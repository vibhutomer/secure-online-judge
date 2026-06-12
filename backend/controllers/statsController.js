const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const User = require('../models/User'); 

exports.getUserMetrics = async (req, res) => {
    try {
        const userId = req.user.id;

        const allProblems = await Problem.find({});
        const totalEasy = allProblems.filter(p => p.difficulty === 'Easy').length;
        const totalMedium = allProblems.filter(p => p.difficulty === 'Medium').length;
        const totalHard = allProblems.filter(p => p.difficulty === 'Hard').length;

        const accepted = await Submission.find({ userId, verdict: 'Accepted' }).populate('problemId');
        
        const solvedEasy = new Set();
        const solvedMedium = new Set();
        const solvedHard = new Set();

        accepted.forEach(sub => {
            if (!sub.problemId) return;
            const diff = sub.problemId.difficulty;
            const pid = sub.problemId._id.toString();

            if (diff === 'Easy') solvedEasy.add(pid);
            if (diff === 'Medium') solvedMedium.add(pid);
            if (diff === 'Hard') solvedHard.add(pid);
        });

        const allUserSubs = await Submission.find({ userId })
            .populate('problemId')
            .sort({ createdAt: -1 }); 

        let subsEasy = 0, subsMedium = 0, subsHard = 0;

        allUserSubs.forEach(sub => {
            if (!sub.problemId) return;
            const diff = sub.problemId.difficulty;
            if (diff === 'Easy') subsEasy++;
            if (diff === 'Medium') subsMedium++;
            if (diff === 'Hard') subsHard++;
        });

        const totalSubs = allUserSubs.length;
        const acceptedSubs = accepted.length; 
        const acceptanceRate = totalSubs === 0 ? 0 : Math.round((acceptedSubs / totalSubs) * 100);

        const recentSubmissions = allUserSubs.slice(0, 10).map(sub => ({
            id: sub._id,
            problemTitle: sub.problemId ? sub.problemId.title : 'Deleted Problem',
            difficulty: sub.problemId ? sub.problemId.difficulty : 'Unknown',
            verdict: sub.verdict,
            language: sub.language,
            timestamp: sub.createdAt
        }));

        const heatmapMap = {};
        
        allUserSubs.forEach(sub => {
            const dateStr = sub.createdAt.toISOString().split('T')[0];
            heatmapMap[dateStr] = (heatmapMap[dateStr] || 0) + 1;
        });

        const heatmapData = Object.keys(heatmapMap).map(date => {
            const count = heatmapMap[date];
            let level = 0;
            if (count > 0 && count <= 2) level = 1;
            else if (count > 2 && count <= 5) level = 2;
            else if (count > 5 && count <= 8) level = 3;
            else if (count > 8) level = 4;
            
            return { date, count, level };
        });

        if (heatmapData.length === 0) {
            const today = new Date().toISOString().split('T')[0];
            heatmapData.push({ date: today, count: 0, level: 0 });
        }

        res.json({
            success: true,
            solved: {
                easy: solvedEasy.size, medium: solvedMedium.size, hard: solvedHard.size,
                totalEasy, totalMedium, totalHard
            },
            submissions: {
                easy: subsEasy, medium: subsMedium, hard: subsHard, total: totalSubs
            },
            acceptanceRate,
            recentSubmissions, 
            heatmapData        
        });

    } catch (error) {
        console.error("Stats Error:", error);
        res.status(500).json({ success: false, error: "Failed to load metrics" });
    }
};

exports.getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await Submission.aggregate([
            { $match: { verdict: 'Accepted' } },
            { $group: { _id: '$userId', uniqueProblems: { $addToSet: '$problemId' } } },
            { $project: { userId: '$_id', solvedCount: { $size: '$uniqueProblems' } } },
            { $sort: { solvedCount: -1 } },
            { $limit: 50 },
            { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
            { $unwind: '$user' }
        ]);

        const formattedLeaderboard = leaderboard.map((entry, index) => ({
            rank: index + 1,
            username: entry.user.username || entry.user.name || entry.user.email.split('@')[0],
            solved: entry.solvedCount
        }));

        res.json({ success: true, leaderboard: formattedLeaderboard });
    } catch (error) {
        console.error("Leaderboard Error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch leaderboard" });
    }
};