const express = require('express')
const { dataSource } = require('../db/data-source')
const validation = require('../utils/validation')
const logger = require('../utils/logger')('Coach')

async function getTheCoachInfo(req, res, next) {
    const coachId = req.params.coachId
    if (validation.isUndefined(coachId) || validation.isNotValidSting(coachId)) {
        logger.warn('欄位未填寫正確')
        res.status(400).json({
            status: 'failed',
            message: '欄位未填寫正確'
        })
        return
    }

    try {
        const coachRepo = dataSource.getRepository('Coach')
        const existingCoach = await coachRepo.findOne({
            relations: ['User'],
            where: {id : coachId}
        })

        if (!existingCoach) {
            logger.warn('找不到該教練')
            res.status(400).json({
                status: 'failed',
                message: '找不到該教練'
            })
            return
        }

        res.status(200).json({
            "status" : "success",
            "data": {
                "user": {
                    "name": existingCoach.User.name,
                    "role": "COACH"
                },
                "coach": {
                    "id": existingCoach.id,
                    "user_id": existingCoach.user_id,
                    "experience_years": existingCoach.experience_years,
                    "description": existingCoach.description,
                    "profile_image_url": existingCoach.profile_image_url,
                    "created_at": existingCoach.created_at,
                    "updated_at": existingCoach.updated_at
                }
            }
        })
    } catch(error) {
        logger.error(error)
        next(error)
    } 
}

async function getCoaches(req, res, next) {
    const per = req.query.per
    const page = req.query.page

    if(validation.isUndefined(per) || validation.isUndefined(page) || validation.isNotValidSting(per) || validation.isNotValidSting(page) || validation.isNotValidInteger(Number(per)) || validation.isNotValidInteger(Number(page)) || Number(per) < 1 || Number(page) < 1) {
        res.status(400).json({
            status:"failed",
            message:"參數未填寫正確"
        })

        return;
    }

    const take = Number(per)
    const skip = (Number(page) - 1) * take

    try{
        const coachRepo = dataSource.getRepository('Coach')
        let coaches = await coachRepo.find({
            relations: ["User"],
            take: take,
            skip: skip
         })

        coaches = coaches.map((coach) => {
            return {
                id: coach.id,
                name: coach.User.name
            }
        })

        res.status(200).json({
            status: "success",
            data: coaches
        })
    } catch(error) {
        logger.error(error)
        next(error)
    }
}

async function getTheCoachCourses(req, res, next) {
    const coachId = req.params.coachId
    if (validation.isUndefined(coachId) || validation.isNotValidSting(coachId)) {
        logger.warn('欄位未填寫正確')
        res.status(400).json({
            status: 'failed',
            message: '欄位未填寫正確'
        })
        return
    }

    try {
        const coachRepo = dataSource.getRepository('Coach')
        const existingCoach = await coachRepo.findOne({
            relations: ['User'],
            where: {id : coachId}
        })

        if (!existingCoach) {
            logger.warn('找不到該教練')
            res.status(400).json({
                status: 'failed',
                message: '找不到該教練'
            })
            return
        }

        const courseRepo = dataSource.getRepository('Course')
        let courses = await courseRepo.find({
            relations: ['Skill'],
            where: {
                user_id: existingCoach.User.id
            }
        })

        courses = await courses.map(course => {
            return {
                id: course.id,
                coach_name: existingCoach.User.name,
                skill_name: course.Skill.name,
                name: course.name,
                description: course.description,
                start_at: course.start_at,
                end_at: course.end_at,
                max_participants: course.max_participants
            }
        })

        res.status(200).json({
            "status" : "success",
            "data": courses
        })
    } catch(error) {
        logger.error(error)
        next(error)
    } 
}

module.exports = {
    getTheCoachInfo,
    getCoaches,
    getTheCoachCourses
}