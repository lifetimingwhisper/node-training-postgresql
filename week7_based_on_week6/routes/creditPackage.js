const express = require('express')
const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('CreditPackage')
const config = require('../config/index')
const auth = require('../middlewares/auth')({
  secret: config.get('secret').jwtSecret,
  userRepository: dataSource.getRepository('User'),
  logger
})
const isCoach = require('../middlewares/isCoach')
const creditPackage = require('../controllers/creditPackage')

// 取得購買方案列表
router.get('', creditPackage.getCreditPackages)

// 新增購買方案
router.post('', auth, isCoach, creditPackage.postCreditPackage)

// 刪除購買方案
router.delete('/:creditPackageId', auth, isCoach, creditPackage.deleteCreditPackage)

// 使用者購買方案
router.post('/:creditPackageId', auth, creditPackage.postUserBuyCreditPackage)

module.exports = router
