const express = require('express')
const router = express.Router()
const { dataSource } = require('../db/data-source')
const validation = require('../utils/validation')

router.get('', async (req, res, next) => {
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
})

module.exports = router