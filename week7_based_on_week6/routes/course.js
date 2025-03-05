const express = require('express')
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Course')
const router = express.Router()

const config = require('../config')
const auth = require('../middlewares/auth')({
    secret: config.get('secret').jwtSecret,
    userRepository: dataSource.getRepository('User'),
    logger
})

const course = require('../controllers/course')

// 取得課程列表
router.get('', course.getCourses)

// 報名課程
router.post('/:courseId', auth, course.postBuyCourse)

// 取消課程
router.delete('/:courseId', auth, course.deleteCourse)
module.exports = router