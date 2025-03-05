const express = require('express')
const router = express.Router()
const { dataSource } = require('../db/data-source')
const config = require('../config/index')
const logger = require('../utils/logger')('Skill')
const auth = require('../middlewares/auth')({
  secret: config.get('secret').jwtSecret,
  userRepository: dataSource.getRepository('User'),
  logger
})
const isCoach = require('../middlewares/isCoach')
const skill = require('../controllers/skill')

// 取得教練專長列表
router.get('', skill.getCoachSkills)

// 新增教練專長
router.post('', auth, isCoach, skill.postCoachSkill)

// 刪除教練專長
router.delete('/:skillId', auth, isCoach, skill.deleteCoachSkill)

module.exports = router