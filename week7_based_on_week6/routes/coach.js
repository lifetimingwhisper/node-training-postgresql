const express = require('express')
const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Coach')
const coach = require('../controllers/coach')

// 取得教練列表
router.get('', coach.getCoaches)

// 取得教練詳細資訊
router.get('/:coachId', coach.getTheCoachInfo)

module.exports = router