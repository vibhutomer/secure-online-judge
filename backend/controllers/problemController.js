const Problem = require('../models/Problem');

exports.addProblem = async (req, res) => {
    try {
        const { title, description, difficulty, tags, examples, testCases } = req.body;
        
        const newProblem = new Problem({ 
            title, 
            description, 
            difficulty, 
            tags, 
            examples, 
            testCases 
        });
        
        await newProblem.save();
        
        res.status(201).json({ status: 'success', message: 'Problem added successfully!' });
    } catch (error) {
        console.error("Error adding problem:", error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

exports.getAllProblems = async (req, res) => {
    try {
        const problems = await Problem.find().select('-testCases');
        res.status(200).json({ status: 'success', problems });
    } catch (error) {
        console.error("Error fetching problems:", error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};