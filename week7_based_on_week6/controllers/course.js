const express = require('express')
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Course')
const validation = require('../utils/validation')
const { IsNull } = require('typeorm') // check if a column has NULL values in queries

async function getCourses(req, res, next) {
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
}

async function postBuyCourse(req, res, next) {
    const { courseId } = req.params
    const userId = req.user.id
    
    if (validation.isUndefined(courseId) || validation.isNotValidSting(courseId)) {
        res.status(400).json({
            status: 'failed',
            message: '欄位未填寫正確'
        })
        return
    }

    const courseRepo = dataSource.getRepository('Course')
    const course = await courseRepo.findOne({
        where: { 
            id : courseId 
        }
    })

    if (!course) {
        res.status(400).json({
            status: 'failed',
            message: 'ID錯誤'
        })
        return
    }

    const courseBookingRepo = dataSource.getRepository('CourseBooking')
    
    // 已報名過
    const boughtThisCourse = await courseBookingRepo.findOne({
        where: {
            user_id: userId, 
            course_id : courseId 
        }
    })
    
    if (boughtThisCourse) {
        res.status(400).json({
            status: 'failed',
            message: '已經報名過此課程'
        })
        return;
    }

    // 此課程確定的報名人數
    const participantCount = await courseBookingRepo.count({
        where: { 
            course_id : courseId,
            cancelledAt: IsNull() // find bookings of this course where 'cancelledAt' is NULL
        }
    })
    
    if (participantCount >= course.max_participants) {
        res.status(400).json({
            status: 'failed',
            message: '已達最大參加人數，無法參加'
        })
        return
    }

    // 使用了的 credits 
    const userUsedCredits = await courseBookingRepo.count({
        where: {
            user_id: userId, 
            cancelledAt: IsNull()
        }
    })
    // 買過的所有 credits
    const creditPurchaseRepo = dataSource.getRepository('CreditPurchase')
    const boughtCredits = await creditPurchaseRepo.sum('purchased_credits', {
        user_id: userId
    })

    if (userUsedCredits >= boughtCredits) {
        res.status(400).json({
            status: 'failed',
            message: '已無可使用堂數'
        })
        return
    }

    // 報名課程
    const newBooking = courseBookingRepo.create({
        user_id: userId,
        course_id: courseId,   
    })
    await courseBookingRepo.save(newBooking)
    res.status(201).json({
        status: 'success',
        data: null
    })
}

async function deleteCourse(req, res, next) {
    const { courseId } = req.params
    const userId = req.user.id
    
    if (validation.isUndefined(courseId) || validation.isNotValidSting(courseId)) {
        res.status(400).json({
            status: 'failed',
            message: '欄位未填寫正確'
        })
        return
    }

    const courseRepo = dataSource.getRepository('Course')
    const course = await courseRepo.findOne({
        where: { 
            id : courseId 
        }
    })

    if (!course) {
        res.status(400).json({
            status: 'failed',
            message: '課程不存在'
        })
        return
    }

    const courseBookingRepo = dataSource.getRepository('CourseBooking')
    const booking = await courseBookingRepo.findOne({
        where: {
            user_id: userId, 
            course_id : courseId,
        }
    })
    
    if (!booking) {
        res.status(400).json({
            status: 'failed',
            message: '找不到報名紀錄'
        })
        return;
    }

    if (booking.cancelledAt != null) {
        res.status(400).json({
            status: 'failed',
            message: '已經取消過此課程'
        })
        return;
    }

    const updatedCourseBooking = await courseBookingRepo.update(
        { id: booking.id }, 
        { cancelledAt: new Date() })


    if (updatedCourseBooking.affected === 0) {
        logger.warn('更新課程失敗')
        res.status(400).json({
            status: 'failed',
            message: '更新課程失敗'
        })
        return
    }  

    res.status(200).json({
        status: 'success',
        data: null
    })     
}

module.exports = {
    getCourses,
    postBuyCourse,
    deleteCourse
}