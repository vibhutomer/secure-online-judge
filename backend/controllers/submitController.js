const Problem = require('../models/Problem');
const { generateFile } = require('../utils/generateFile');
const { executeCpp } = require('../utils/executeCpp');
const { generateInputFile } = require('../utils/generateInputFile');
const fs = require('fs');
const crypto = require('crypto');
const { generateAIHint } = require('../services/aiService');
const Submission = require('../models/Submission');
const { executePython } = require('../utils/executePython'); 
const { executeJava } = require('../utils/executeJava');     
const { executeC } = require('../utils/executeC');

const hintCache = new Map();

exports.submitCode = async (req, res) => {
    const { language = 'cpp', code, problemId } = req.body;

    if (!code) return res.status(400).json({ success: false, error: "Empty code body!" });
    if (!problemId) return res.status(400).json({ success: false, error: "Problem ID required!" });

    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ success: false, error: "Problem not found!" });

    let filePath = "";
    try {
        filePath = await generateFile(language, code);
        const testCases = problem.testCases;

        for (let i = 0; i < testCases.length; i++) {
            const { input, expectedOutput } = testCases[i];
            const inputPath = await generateInputFile(input);
            
            let rawOutput = "";
            if (language === 'cpp') {
                rawOutput = await executeCpp(filePath, inputPath);
            } else if (language === 'python') {
                rawOutput = await executePython(filePath, inputPath);
            } else if (language === 'java') {
                rawOutput = await executeJava(filePath, inputPath);
            } else if (language === 'c') {
                rawOutput = await executeC(filePath, inputPath);
            }

            fs.unlinkSync(inputPath);

            const cleanUserOutput = rawOutput.replace(/\r/g, "").trim();
            const cleanExpectedOutput = expectedOutput.replace(/\r/g, "").trim();

            if (cleanUserOutput !== cleanExpectedOutput) {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                
                await Submission.create({
                    userId: req.user.id,
                    problemId: problemId,
                    code: code,
                    language: language,
                    verdict: "Wrong Answer"
                });

                return res.json({
                    success: false,
                    verdict: "Wrong Answer",
                    expected: cleanExpectedOutput,
                    received: cleanUserOutput,
                    input: input 
                });
            }
        }

        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        
        await Submission.create({
            userId: req.user.id,
            problemId: problemId,
            code: code,
            language: language,
            verdict: "Accepted"
        });

        return res.json({ success: true, verdict: "Accepted" });

    } catch (error) {
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
        
        const isTLE = error === "Time Limit Exceeded" || error?.message === "Time Limit Exceeded";
        const isMLE = error === "Memory Limit Exceeded" || error?.message === "Memory Limit Exceeded";
        let finalVerdict = "Compilation Error";
        let finalMessage = error.message || error;

        if (isTLE) {
            finalVerdict = "Time Limit Exceeded";
            finalMessage = "Your code took too long to execute (exceeded 10 seconds).";
        } else if (isMLE) {
            finalVerdict = "Memory Limit Exceeded";
            finalMessage = "Your code consumed too much memory (exceeded 256MB limit).";
        }
        
        await Submission.create({
            userId: req.user.id,
            problemId: problemId,
            code: code,
            language: language,
            verdict: finalVerdict
        });
        return res.status(400).json({ 
            success: false, 
            verdict: finalVerdict, 
            message: finalMessage 
        });
    }
};

exports.getHint = async (req, res) => {
    const { problemId, userCode, failedTestCase } = req.body;

    try {
        const codeHash = crypto.createHash('md5').update(userCode).digest('hex');
        if (hintCache.has(codeHash)) {
            return res.json({ success: true, hint: hintCache.get(codeHash), cached: true });
        }
        const problem = await Problem.findById(problemId);
        const aiHint = await generateAIHint({
            problemTitle: problem.title,
            problemDescription: problem.description,
            userCode: userCode,
            failedTestCase: failedTestCase
        });
        hintCache.set(codeHash, aiHint);
        return res.json({ success: true, hint: aiHint, cached: false });
    } catch (error) {
        console.error("Hint Generation Error:", error);
        return res.status(500).json({ success: false, error: "Failed to generate hint." });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const { problemId } = req.params;
        const userId = req.user.id;
        const submissions = await Submission.find({ userId, problemId }).sort({ createdAt: -1 });
        return res.json({ success: true, submissions });
    } catch (error) {
        console.error("Fetch History Error:", error);
        return res.status(500).json({ success: false, error: "Failed to fetch submission history." });
    }
};