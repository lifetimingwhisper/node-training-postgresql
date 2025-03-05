const express = require('express')

const router = express.Router()
const config = require('../config/index')
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Admin')
const auth = require('../middlewares/auth')({
  secret: config.get('secret').jwtSecret,
  userRepository: dataSource.getRepository('User'),
  logger
})
const isCoach = require('../middlewares/isCoach')
const admin = require('../controllers/admin')

// 新增教練課程資料
router.post('/coaches/courses', auth, isCoach, admin.postNewCourse)

// 編輯教練課程資料
router.put('/coaches/courses/:courseId', auth, isCoach, admin.putCourse)

// 將使用者新增為教練
router.post('/coaches/:userId', auth, isCoach, admin.postUserToCoach)

module.exports = router