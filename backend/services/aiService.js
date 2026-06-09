const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// 1. Initialize with the globally available model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const generateAIHint = async (data) => {
    try {
        // 2. Compress the Evaluator and Mentor into one highly specific prompt
        const prompt = `You are a friendly, Socratic C++ interview coach.
        Problem: ${data.problemTitle}
        Description: ${data.problemDescription}
        
        User's Broken Code:
        ${data.userCode}
        
        Failed Test Case:
        Input: ${data.failedTestCase.input}
        Expected Output: ${data.failedTestCase.expectedOutput}
        Actual Output: ${data.failedTestCase.actualOutput}

        Analyze the code and write a short, 2-sentence encouraging hint to guide the user to the right answer. 
        CRITICAL RULES:
        1. Do NOT give away the exact code.
        2. Point out the specific logic flaw (e.g., missing a loop, printing the wrong variable).`;

        const result = await model.generateContent(prompt);
        return result.response.text();

    } catch (error) {
        console.error("AI Error:", error.message);
        return "Fallback Hint: It looks like your code isn't reversing the array yet. Double-check your logic to make sure you are swapping the characters!";
    }
};

module.exports = { generateAIHint };