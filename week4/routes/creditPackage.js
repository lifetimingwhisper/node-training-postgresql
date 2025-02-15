const express = require('express')

const router = express.Router()
const AppDataSource = require("../db")
router.get('/', async (req, res, next) => {
    const packages = await AppDataSource.getRepository("CreditPackage").find({
        select: ["id", "name", "credit_amount", "price"]
      })
    res.status(200).json({
        status: "success",
        data: packages
      })
})

router.post('/', async (req, res, next) => {
    console.log(req.body)

    res.status(200).json({
        "status":"200",
        "data":[]
    })
})

router.delete('/:creditPackageId', async (req, res, next) => {
})

module.exports = router