const express = require('express')
const router = express.Router()
const user = require('../controllers/user')
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Users')
const config = require('../config')
const auth = require('../middlewares/auth')({
  secret: config.get('secret').jwtSecret,
  userRepository: dataSource.getRepository('User'),
  logger
})

// 新增使用者
router.post('/signup', user.postSignup)

// 使用者登入
router.post('/login', user.postLogin)

// 取得個人資料
router.get('/profile', auth, user.getProfile)

// 更新個人資料
router.put('/profile', auth, user.putProfile)

// 取得使用者已購買的方案列表
router.get('/credit-package', auth, user.getBoughtCreditPackages)

// 取得已預約的課程列表
router.get('/courses', auth, user.getBookedCourses)

// 使用者更新密碼
router.put('/password', auth, user.putPassword)
module.exports = router