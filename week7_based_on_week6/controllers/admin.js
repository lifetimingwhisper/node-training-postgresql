const express = require('express')
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Admin')
const validation = require('../utils/validation')

async function postUserToCoach(req, res, next) {
    try {
      const { userId } = req.params
      const { experience_years: experienceYears, description, profile_image_url: profileImageUrl = null } = req.body
      if (validation.isUndefined(experienceYears) || validation.isNotValidInteger(experienceYears) || validation.isUndefined(description) || validation.isNotValidSting(description)) {
        logger.warn('欄位未填寫正確')
        res.status(400).json({
          status: 'failed',
          message: '欄位未填寫正確'
        })
        return
      }
      if (profileImageUrl && !isNotValidSting(profileImageUrl) && !profileImageUrl.startsWith('https')) {
        logger.warn('大頭貼網址錯誤')
        res.status(400).json({
          status: 'failed',
          message: '欄位未填寫正確'
        })
        return
      }
      const userRepository = dataSource.getRepository('User')
      const existingUser = await userRepository.findOne({
        select: ['id', 'name', 'role'],
        where: { id: userId }
      })
      if (!existingUser) {
        logger.warn('使用者不存在')
        res.status(400).json({
          status: 'failed',
          message: '使用者不存在'
        })
        return
      } else if (existingUser.role === 'COACH') {
        logger.warn('使用者已經是教練')
        res.status(409).json({
          status: 'failed',
          message: '使用者已經是教練'
        })
        return
      }
      const coachRepo = dataSource.getRepository('Coach')
      const newCoach = coachRepo.create({
        user_id: userId,
        experience_years: experienceYears,
        description,
        profile_image_url: profileImageUrl
      })
      const updatedUser = await userRepository.update({
        id: userId,
        role: 'USER'
      }, {
        role: 'COACH'
      })
      if (updatedUser.affected === 0) {
        logger.warn('更新使用者失敗')
        res.status(400).json({
          status: 'failed',
          message: '更新使用者失敗'
        })
        return
      }
      const savedCoach = await coachRepo.save(newCoach)
      const savedUser = await userRepository.findOne({
        select: ['name', 'role'],
        where: { id: userId }
      })
      res.status(201).json({
        status: 'success',
        data: {
          user: savedUser,
          coach: savedCoach
        }
      })
    } catch (error) {
      logger.error(error)
      next(error)
    }
}

async function postNewCourse(req, res, next) {
    try {
        const { id } = req.user
        const {
            skill_id: skillId, name, description, start_at: startAt, end_at: endAt,
            max_participants: maxParticipants, meeting_url: meetingUrl
        } = req.body
        if (validation.isUndefined(skillId) || validation.isNotValidSting(skillId) ||
            validation.isUndefined(name) || validation.isNotValidSting(name) ||
            validation.isUndefined(description) || validation.isNotValidSting(description) ||
            validation.isUndefined(startAt) || validation.isNotValidSting(startAt) ||
            validation.isUndefined(endAt) || validation.isNotValidSting(endAt) ||
            validation.isUndefined(maxParticipants) || validation.isNotValidInteger(maxParticipants) ||
            validation.isUndefined(meetingUrl) || validation.isNotValidSting(meetingUrl) || !meetingUrl.startsWith('https')) {
            logger.warn('欄位未填寫正確')
            res.status(400).json({
                status: 'failed',
                message: '欄位未填寫正確'
            })
            return
        }

        const courseRepo = dataSource.getRepository('Course')

        // 避免課程重複被新增
        const existingCourse = await courseRepo.findOne({
            where : {
                user_id: id,
                skill_id: skillId,
                name: name,
                description: description,
                start_at: startAt,
                end_at: endAt
            }
        })

        if (existingCourse) {
            res.status(409).json({
                status: 'failed',
                message: '資料重複'
            })
            return
        }

        const newCourse = courseRepo.create({
            user_id: id,
            skill_id: skillId,
            name,
            description,
            start_at: startAt,
            end_at: endAt,
            max_participants: maxParticipants,
            meeting_url: meetingUrl
        })
        const savedCourse = await courseRepo.save(newCourse)
        const course = await courseRepo.findOne({
            where: { id: savedCourse.id }
        })
        res.status(201).json({
            status: 'success',
            data: {
                course
            }
        })
    } catch (error) {
        logger.error(error)
        next(error)
    }
}

async function putCourse(req, res, next) {
    try {
        const { id } = req.user
        const { courseId } = req.params
        const {
        skill_id: skillId, name, description, start_at: startAt, end_at: endAt,
        max_participants: maxParticipants, meeting_url: meetingUrl
        } = req.body
        if (validation.isNotValidSting(courseId) ||
        validation.isUndefined(skillId) || validation.isNotValidSting(skillId) ||
        validation.isUndefined(name) || validation.isNotValidSting(name) ||
        validation.isUndefined(description) || validation.isNotValidSting(description) ||
        validation.isUndefined(startAt) || validation.isNotValidSting(startAt) ||
        validation.isUndefined(endAt) || validation.isNotValidSting(endAt) ||
        validation.isUndefined(maxParticipants) || validation.isNotValidInteger(maxParticipants) ||
        validation.isUndefined(meetingUrl) || validation.isNotValidSting(meetingUrl) || !meetingUrl.startsWith('https')) {
        logger.warn('欄位未填寫正確')
            res.status(400).json({
                status: 'failed',
                message: '欄位未填寫正確'
            })
            return
        }
        const courseRepo = dataSource.getRepository('Course')
        const existingCourse = await courseRepo.findOne({
            where: { id: courseId, user_id: id }
        })
        if (!existingCourse) {
            logger.warn('課程不存在')
            res.status(400).json({
                status: 'failed',
                message: '課程不存在'
            })
            return
        }
        const updateCourse = await courseRepo.update({
            id: courseId
            }, {
            skill_id: skillId,
            name,
            description,
            start_at: startAt,
            end_at: endAt,
            max_participants: maxParticipants,
            meeting_url: meetingUrl
        })
        if (updateCourse.affected === 0) {
            logger.warn('更新課程失敗')
            res.status(400).json({
                status: 'failed',
                message: '更新課程失敗'
            })
            return
        }
        const savedCourse = await courseRepo.findOne({
            where: { id: courseId }
        })
        res.status(200).json({
            status: 'success',
            data: {
                course: savedCourse
            }
        })
    } catch (error) {
        logger.error(error)
        next(error)
    }
}

async function getCoachCourses(req, res, next) {
  try {
    const { id } = req.user

    const courseRepo = dataSource.getRepository('Course')
    const coursesWithBookedSpotCount = await courseRepo
      .createQueryBuilder('Course') // (1) Start querying from the 'course' table
      .leftJoinAndSelect('Course.Skill', 'Skill') // (2) Join the Skill table with relation : 'Course.Skill' refers to the relationship you defined in the Course entity (the Skill relation) and its alias (the table's alias) which can be used in the raw object (so course['Skill_name'] is used to access the skill nam)
      .leftJoin('CourseBooking', 'CourseBooking', 'CourseBooking.course_id = Course.id')  // Joining CourseBooking table manually; second argument is the argument and the last is the condition
      .where('Course.user_id = :coachId', { coachId: id }) // (3) Filter by coachId
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(CourseBooking.id)', 'bookedSpotCount') // (4) Count bookings per course
          .from('CourseBooking', 'CourseBooking')
          .where('CourseBooking.course_id = Course.id'); // (5) Match bookings to the course
      }, 'bookedSpotCount')
      // .getMany(); // return entity objects instead of raw objects, so course.Skill.name is used to access the skill name which means the alias can't be used
      .getRawMany(); // return raw objects, so course['Skill_name'] is used to access the skill name

    let courses = coursesWithBookedSpotCount.map(course => {
      return {
        id: course.Course_id,
        name: course.Course_name,
        skillname: course.Skill_name,
        start_at: course.Course_start_at,
        end_at: course.Course_end_at,
        max_participants: course.Course_max_participants,
        participants: parseInt(course.bookedSpotCount, 10), // COUNT() return as a sstring type
      }
    })

    res.status(200).json({
      status: 'success',
      data: courses
    })
  } catch(error) {
    logger.error(error)
    next(error)
  }
}

async function getTheCoachCourse(req, res, next) {
  try {
    const { courseId } = req.params
    const { id } = req.user

    const courseRepo = dataSource.getRepository('Course')
    let courses = await courseRepo
      .createQueryBuilder('Course')
      .innerJoinAndSelect('Course.Skill', 'Skill') 
      .where('Course.user_id = :coachId', { coachId: id })
      .andWhere('Course.id = :courseId', { courseId })
      .getMany()

    courses = courses.map(course => {
      return {
        id: course.id,
        name: course.name,
        skill_name: course.Skill.name,
        description: course.description,
        start_at: course.start_at,
        end_at: course.end_at,
        max_participants: course.max_participants,
      }
    })

    res.status(200).json({
      status: 'success',
      data: courses
    })
  } catch(error) {
    logger.error(error)
    next(error)
  }
}

/*
  JC's note:
  keep it for reference 
async function getCoachCourses(req, res, next) {
  try {
    const { id } = req.user

    const courseRepo = dataSource.getRepository('Course')
    const coursesWithBookedSpotCount = await courseRepo
      .createQueryBuilder('Course') // (1) Start querying from the 'course' table
      .innerJoinAndSelect('Course.Skill', 'Skill') // (2) Join the Skill table with relation : 'Course.Skill' refers to the relationship you defined in the Course entity (the Skill relation) and its alias (the table's alias) which can be used in the raw object (so course['Skill_name'] is used to access the skill nam)
      // .leftJoin('Skill', 'Skill', 'Skill.id = Course.skill_id') // .addSelect(['Skill.name AS skillName'])
      .innerJoin('CourseBooking', 'CourseBooking', 'CourseBooking.course_id = Course.id')  // Joining CourseBooking table manually; second argument is the argument and the last is the condition
      .where('Course.user_id = :coachId', { coachId: id }) // (3) Filter by coachId
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(CourseBooking.id)', 'bookedSpotCount') // (4) Count bookings per course
          .from('CourseBooking', 'CourseBooking')
          .where('CourseBooking.course_id = Course.id'); // (5) Match bookings to the course
      }, 'bookedSpotCount')
      // .addSelect('Course.max_participants - COALESCE(bookedSpotCount, 0)', 'remainingSpots') // (6) Compute remaining spots
      .getMany(); // return entity objects instead of raw objects, so course.Skill.name is used to access the skill name which means the alias can't be used
      // .getRawMany(); // return raw objects, so course['Skill_name'] is used to access the skill name

      console.log("==========================================================")
      console.log('========= coursesWithBookedSpotCount: ', coursesWithBookedSpotCount)
      console.log("==========================================================")
    let courses = coursesWithBookedSpotCount.map(course => {
      return {
        id: course.id,
        name: course.name,
        skillname: course.skillName,
        start_at: course.start_at,
        end_at: course.end_at,
        max_participants: course.max_participants,
        participants: course.bookedSpotCount,
      }
    })

    res.status(200).json({
      status: 'success',
      data: courses
    })
  } catch(error) {
    logger.error(error)
    next(error)
  }
}
  */

module.exports = {
    postUserToCoach,
    postNewCourse,
    putCourse,
    getCoachCourses,
    getTheCoachCourse
}