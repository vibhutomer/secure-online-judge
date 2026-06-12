const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    
    tags: [{ type: String }],
    
    constraints: { type: String },
    
    starterCode: {
        cpp: { type: String, default: "" },
        java: { type: String, default: "" },
        python: { type: String, default: "" },
        c: { type: String, default: "" }
    },

    examples: [{
        input: String,
        output: String,
        explanation: String
    }],
    testCases: [{
        input: String,
        expectedOutput: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('Problem', problemSchema);