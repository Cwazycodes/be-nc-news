const express = require('express');
const { getEndpoints } = require('../controllers/api.controller');

const router = express.Router();

router.get('/', getEndpoints);

module.exports = router;
