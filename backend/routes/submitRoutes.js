const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { submitCode, getHint, getHistory } = require('../controllers/submitController'); 
const { getUserMetrics, getLeaderboard } = require('../controllers/statsController'); 
const auth = require('../middleware/auth');

const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: { 
        success: false, 
        error: "AI Mentor token budget exceeded. Please try again in an hour." 
    }
});

router.get('/metrics', auth, getUserMetrics);
router.post('/', auth, submitCode);

router.post('/hint', auth, aiLimiter, getHint); 

router.get('/history/:problemId', auth, getHistory);
router.get('/leaderboard', getLeaderboard);

module.exports = router;