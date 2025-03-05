const express = require('express')

const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('CreditPackage')
const validation = require('../utils/validation')
const CreditPurchase = require('../entities/CreditPurchase')

async function getCreditPackages(req, res, next) {
    try {
        const creditPackage = await dataSource.getRepository('CreditPackage').find({
          select: ['id', 'name', 'credit_amount', 'price']
        })
        res.status(200).json({
          status: 'success',
          data: creditPackage
        })
      } catch (error) {
        logger.error(error)
        next(error)
      }
}

async function postCreditPackage(req, res, next) {
    try {
        const { name, credit_amount: creditAmount, price } = req.body
        if (validation.isUndefined(name) || validation.isNotValidSting(name) || 
        validation.isUndefined(creditAmount) || validation.isNotValidInteger(creditAmount) ||
        validation.isUndefined(price) || validation.isNotValidInteger(price)) {
            res.status(400).json({
            status: 'failed',
            message: '欄位未填寫正確'
            })
            return
        }
        const creditPackageRepo = await dataSource.getRepository('CreditPackage')
        const existCreditPackage = await creditPackageRepo.find({
            where: {
                name
            }
        })
        if (existCreditPackage.length > 0) {
            res.status(409).json({
                status: 'failed',
                message: '資料重複'
            })
            return
        }
        const newCreditPackage = await creditPackageRepo.create({
            name,
            credit_amount: creditAmount,
            price
        })
        const result = await creditPackageRepo.save(newCreditPackage)
        res.status(200).json({
            status: 'success',
            data: result
        })
    } catch (error) {
        logger.error(error)
        next(error)
    }
}

async function deleteCreditPackage(req, res, next) {
    try {
        const { creditPackageId } = req.params
        if (validation.isUndefined(creditPackageId) || validation.isNotValidSting(creditPackageId)) {
            res.status(400).json({
                status: 'failed',
                message: '欄位未填寫正確'
            })
            return
        }
        const result = await dataSource.getRepository('CreditPackage').delete(creditPackageId)
        if (result.affected === 0) {
            res.status(400).json({
                status: 'failed',
                message: 'ID錯誤'
            })
            return
        }
        res.status(200).json({
            status: 'success',
            data: result
        })
    } catch (error) {
        logger.error(error)
        next(error)
    }
}

async function postUserBuyCreditPackage(req, res, next) {
    try {
        const { creditPackageId } = req.params
        if (validation.isUndefined(creditPackageId) || validation.isNotValidSting(creditPackageId)) {
            res.status(400).json({
                status: 'failed',
                message: 'ID錯誤'
            })
            return
        }

        const creditPackageRepo = dataSource.getRepository('CreditPackage')
        const existCreditPackage = await creditPackageRepo.findOne({
            where: { id : creditPackageId }
        })

        if (!existCreditPackage) {
            res.status(400).json({
                status: 'failed',
                message: '購買方案不存在'
            })
            return 
        }

        const creditPurchaseRepo = dataSource.getRepository('CreditPurchase')
        const newCreditPurchase = creditPurchaseRepo.create({
            user_id: req.user.id,
            credit_package_id: creditPackageId,
            purchased_credits: existCreditPackage.credit_amount,
            price_paid: existCreditPackage.price,
            purchaseAt: new Date().toISOString()
        /*
            JC's note : 
            new Date().toISOString() 產生 ISO 8601 string，但因為在 database schema 是 type timestamp，所以 TypeORM will convert the string back to a Date object before saving it (那為什麼不存入 Date object 即可呢？ 測試 'purchaseAt : new Date()' 可以正確新增一筆資料)
        */
        })

        await creditPurchaseRepo.save(newCreditPurchase)
        res.status(201).json({
            status: 'success',
            data: null
        })
    } catch (error) {
        logger.error(error)
        next(error)
    }
}

module.exports = {
    getCreditPackages,
    postCreditPackage,
    deleteCreditPackage,
    postUserBuyCreditPackage
}