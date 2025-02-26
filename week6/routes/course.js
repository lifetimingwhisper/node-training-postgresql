const express = require('express')
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Course')
const validation = require('../utils/validation')
const router = express.Router()

router.get('', async (req, res, next) => {
    try {
        const courseRepo = dataSource.getRepository('Course')
        let courses = await courseRepo.find({
            relations: ['User', 'Skill'], 
            select: ['id', 'User.name', 'Skill.name', 'name', 'description', 'start_at', 'end_at', 'max_participants']
        })
        
        courses = courses.map( course => {
            return {
                id: course.id,
                coach_name: course.User.name,
                skill_name: course.Skill.name,
                name: course.name,
                description: course.description,
                start_at: course.start_at,
                end_at: course.end_at,
                max_participants: course.max_participants
            }
        })
        res.status(200).json({
            status: "success",
            data: courses
        })
    } catch (error) {
        logger.error('取得課程資料錯誤:', error)
        next(error)
    }
})

module.exports = router