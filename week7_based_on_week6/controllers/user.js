const express = require('express')
const bcrypt = require('bcrypt')

const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Users')
const config = require('../config')
const validation = require('../utils/validation')
const generateJWT = require('../utils/generateJWT')

const saltRounds = 10

const { IsNull } = require('typeorm') // check if a column has NULL values in queries

async function postSignup(req, res, next) {
    try {
        const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}/
        const { name, email, password } = req.body
        // 驗證必填欄位
        if (validation.isUndefined(name) || validation.isNotValidSting(name) || validation.isUndefined(email) || validation.isNotValidSting(email) || validation.isUndefined(password) || validation.isNotValidSting(password)) {
            logger.warn('欄位未填寫正確')
            res.status(400).json({
                status: 'failed',
                message: '欄位未填寫正確'
            })
            return
        }
        if (!passwordPattern.test(password)) {
            logger.warn('建立使用者錯誤: 密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字')
            res.status(400).json({
                status: 'failed',
                message: '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字'
             })
            return
        }
        const userRepository = dataSource.getRepository('User')
        // 檢查 email 是否已存在
        const existingUser = await userRepository.findOne({
            where: { email }
        })
    
        if (existingUser) {
            logger.warn('建立使用者錯誤: Email 已被使用')
            res.status(409).json({
                status: 'failed',
                message: 'Email 已被使用'
            })
            return
        }
    
        // 建立新使用者
        const hashPassword = await bcrypt.hash(password, saltRounds)
        const newUser = userRepository.create({
            name,
            email,
            role: 'USER',
            password: hashPassword
        })
    
        const savedUser = await userRepository.save(newUser)
        logger.info('新建立的使用者ID:', savedUser.id)
    
        res.status(201).json({
            status: 'success',
            data: {
                user: {
                    id: savedUser.id,
                    name: savedUser.name
                }
            }
        })
    } catch (error) {
        logger.error('建立使用者錯誤:', error)
        next(error)
    }
} 

async function postLogin(req, res, next) {
    try {
        const { email, password } = req.body
        if (validation.isUndefined(email) || validation.isNotValidSting(email) || validation.isUndefined(password) || validation.isNotValidSting(password)) {
            logger.warn('欄位未填寫正確')
            res.status(400).json({
                status: 'failed',
                message: '欄位未填寫正確'
            })
            return
        }
        
        const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}/
        if (!passwordPattern.test(password)) {
            logger.warn('密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字')
            res.status(400).json({
              status: 'failed',
              message: '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字'
            })
            return
        }
    
        const userRepo = dataSource.getRepository('User')
        const existingUser = await userRepo.findOne({
            select: ['id', 'name', 'password'],
            where: { email }
        })
    
        console.log('existingUser: ', existingUser)
    
        if (!existingUser) {
            res.status(400).json({
                status: 'failed',
                message: '使用者不存在或密碼輸入錯誤'
            })
            return
        }
    
        logger.info(`使用者資料: ${JSON.stringify(existingUser)}`)
        const isMatch = await bcrypt.compare(password, existingUser.password)
        if (!isMatch) {
            res.status(400).json({
                status: 'failed',
                message: '使用者不存在或密碼輸入錯誤'
            })
            return
        }
    
        const token = await generateJWT({
            id: existingUser.id
        }, config.get('secret.jwtSecret'), {
            expiresIn: `${config.get('secret.jwtExpiresDay')}`
        })
    
        res.status(201).json({
            status: 'success',
            data: {
                token,
                user: {
                name: existingUser.name
                }
            }
        })
      } catch (error) {
        logger.error('登入錯誤:', error)
        next(error)
      }
}

async function getProfile(req, res, next) {
    try {
        const { id } = req.user
        const userRepository = dataSource.getRepository('User')
        const user = await userRepository.findOne({
            select: ['name', 'email'],
            where: { id }
        })
        res.status(200).json({
            status: 'success',
            data: {
            user
            }
        })
    } catch (error) {
        logger.error('取得使用者資料錯誤:', error)
        next(error)
    }
}

async function putProfile(req, res, next) {
    try {
        const { id } = req.user
        const { name } = req.body
        if (validation.isUndefined(name) || validation.isNotValidSting(name)) {
            logger.warn('欄位未填寫正確')
            res.status(400).json({
                status: 'failed',
                message: '欄位未填寫正確'
            })
            return
        }
        const userRepository = dataSource.getRepository('User')
        const user = await userRepository.findOne({
            select: ['name'],
            where: { id }
        })
        if (user.name === name) {
            res.status(400).json({
                status: 'failed',
                message: '使用者名稱未變更'
            })
        return
        }
        const updatedResult = await userRepository.update({
            id,
            name: user.name
        }, {
             name
        })
        if (updatedResult.affected === 0) {
            res.status(400).json({
                status: 'failed',
                message: '更新使用者資料失敗'
            })
            return
        }
        const result = await userRepository.findOne({
            select: ['name'],
            where: { id }
            })
        res.status(200).json({
            status: 'success',
            data: {
                user: result
            }
        })
    } catch (error) {
        logger.error('取得使用者資料錯誤:', error)
        next(error)
    }
}

async function getBoughtCreditPackages(req, res, next) {
    try {
        const { id } = req.user
        const creditPurchaseRepo = dataSource.getRepository('CreditPurchase')
        let creditPurchases = await creditPurchaseRepo.find({
            relations: [ 'CreditPackage' ],
            where: {
                user_id: id
            }
        })

        creditPurchases = creditPurchases.map( purchase => {
            return {
                purchased_credits: purchase.purchased_credits,
                price_paid: purchase.price_paid,
                name: purchase.CreditPackage.name,
                purchase_at: purchase.purchase_at
            }
        })

        res.status(200).json({
            "status" : "success",
            "data": creditPurchases
        })
    } catch(error) {
        logger.error(error)
        next(error)
    }
}

async function getBookedCourses(req, res, next) {
    try {
        const { id } = req.user 
        const courseBookingRepo = dataSource.getRepository('CourseBooking')
        const creditPurchaseRepo = dataSource.getRepository('CreditPurchase')
        const [courseBookings, purchasedCredits] = await Promise.all([
            courseBookingRepo.find({
                relations: [ 'Course', 'Course.User' ],
                where: {
                    user_id: id,
                    cancelledAt: IsNull()
                }
            }),
            creditPurchaseRepo.sum('purchased_credits', { user_id: id })
        ]);

        const bookedCourses = courseBookings.map( booking => {
            return {
                name: booking.Course.name,
                course_id: booking.course_id,
                coach_name: booking.Course.User.name,
                start_at: booking.Course.start_at,
                end_at: booking.Course.end_at,
                meeting_url: booking.Course.meeting_url
            }
        })

        res.status(200).json({
            "status" : "success",
            "data": {
                "credit_remain": purchasedCredits - bookedCourses.length,
                "credit_usage": bookedCourses.length,
                course_booking: bookedCourses
            }
        })
    } catch(error) {
        logger.error(error)
        next(error)
    }
}

async function putPassword(req, res, next) {
    try {
        const { id } = req.user
        const { password: oldPassword, new_password: newPassword, confirm_new_password: confirmNewPassword } = req.body

        // 驗證必填欄位
        if (validation.isUndefined(newPassword) || validation.isNotValidSting(newPassword) || validation.isUndefined(confirmNewPassword) || validation.isNotValidSting(confirmNewPassword) || validation.isUndefined(oldPassword) || validation.isNotValidSting(oldPassword)) {
            logger.warn('欄位未填寫正確')
            res.status(400).json({
                status: 'failed',
                message: '欄位未填寫正確'
            })
            return
        }

        const userRepository = dataSource.getRepository('User')
        const user = await userRepository.findOne({
            select: ['password'], 
            where: { id }
        })

        const isMatch = await bcrypt.compare(oldPassword, user.password)
        if (!isMatch) {
            res.status(400).json({
            status: 'failed',
            message: '密碼輸入錯誤'
            })
            return
        }

        const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}/
        if (newPassword !== confirmNewPassword) {
            logger.warn('新密碼和確認密碼不一致')
            res.status(400).json({
                status: 'failed',
                message: '新密碼和確認密碼不一致'
             })
            return
        }

        if (!passwordPattern.test(newPassword)) {
            logger.warn('建立使用者錯誤: 密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字')
            res.status(400).json({
                status: 'failed',
                message: '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字'
             })
            return
        }

        const hashPassword = await bcrypt.hash(newPassword, saltRounds)
        const updatedResult = await userRepository.update({
            id
        }, {
            password: hashPassword
        })

        if (updatedResult.affected === 0) {
            res.status(400).json({
              status: 'failed',
              message: '更新密碼失敗'
            })
            return
        }

        res.status(200).json({
            status: 'success',
            data: null
        })
    }
    catch(error) {
        logger.error(error)
        next(error)
    }
}

module.exports = {
    postSignup,
    postLogin,
    getProfile,
    putProfile,
    getBoughtCreditPackages,
    getBookedCourses,
    putPassword
}