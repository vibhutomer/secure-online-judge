const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');
const auth = require('../middleware/auth');

router.post('/', auth, problemController.addProblem);

router.get('/', problemController.getAllProblems);

module.exports = router;