require("dotenv").config()
const dataSource = require("./db")

const express = require('express'); // JC's note : It loads the Express module, and what is returned is a function
const cors = require('cors')
const path = require('path')
const app = express(); // JC's note : It can be called to create an Express application instance

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

const creditPackageRouter = require('./routes/creditPackage')
app.use('/api/credit-package', creditPackageRouter)
app.use(function(req, res, next){
  res.status(404).send({
      "status":"success",
      "data":"找不到頁面"
  })
})


/*
 // JC's note : 
 // - app.get is a method provided by the Express application instance (app). It is used to define a route handler for GET requests (how the server should respond to GET requests for a specific URL path.)

 app.get('/todo', function(req, res){
    res.status(200).json({
        "content":"待辦事項"
    })
})
*/

/*
  // JC's note : 
  // :productName - 網址路徑，動態路由，擷取重要資源
  // query - 網址參數，多重條件篩選資料用(多個且無序)

  app.get('/s/:productName', function(req, res){
      console.log(req.params)
      console.log(req.query)
      res.status(200).json({
          "name":"比價網"
      })
  })
*/


// 監聽 port
const port = process.env.PORT || 3000;
app.listen(port, async () => {
  console.log('真的有開啟嗎...')
  try {
    await dataSource.initialize()
    console.log('資料庫連線成功')
    console.log(`伺服器運作中. port: ${port}`)
  } catch (error) {
    console.log(`資料庫連線失敗: ${error.message}`)
    process.exit(1)
  }
})


// function isUndefined (value) {
//   return value === undefined
// }

// function isNotValidSting (value) {
//   return typeof value !== "string" || value.trim().length === 0 || value === ""
// }

// function isNotValidInteger (value) {
//   return typeof value !== "number" || value < 0 || value % 1 !== 0
// }

// const requestListener = async (req, res) => {
//   const headers = {
//     "Access-Control-Allow-Headers": "Content-Type, Authorization, Content-Length, X-Requested-With",
//     "Access-Control-Allow-Origin": "*",
//     "Access-Control-Allow-Methods": "PATCH, POST, GET,OPTIONS,DELETE",
//     "Content-Type": "application/json"
//   }
//   let body = ""
//   req.on("data", (chunk) => {
//     body += chunk
//   })

//   if (req.url === "/api/credit-package" && req.method === "GET") {
//     try {
//       const packages = await AppDataSource.getRepository("CreditPackage").find({
//         select: ["id", "name", "credit_amount", "price"]
//       })
//       res.writeHead(200, headers)
//       res.write(JSON.stringify({
//         status: "success",
//         data: packages
//       }))
//       res.end()
//     } catch (error) {
//       res.writeHead(500, headers)
//       res.write(JSON.stringify({
//         status: "error",
//         message: "伺服器錯誤"
//       }))
//       res.end()
//     }
//   } else if (req.url === "/api/credit-package" && req.method === "POST") {
//     req.on("end", async () => {
//       try {
//         const data = JSON.parse(body)
//         if (isUndefined(data.name) || isNotValidSting(data.name) ||
//                 isUndefined(data.credit_amount) || isNotValidInteger(data.credit_amount) ||
//                 isUndefined(data.price) || isNotValidInteger(data.price)) {
//           res.writeHead(400, headers)
//           res.write(JSON.stringify({
//             status: "failed",
//             message: "欄位未填寫正確"
//           }))
//           res.end()
//           return
//         }
//         const creditPackageRepo = await AppDataSource.getRepository("CreditPackage")
//         const existPackage = await creditPackageRepo.find({
//           where: {
//             name: data.name
//           }
//         })
//         if (existPackage.length > 0) {
//           res.writeHead(409, headers)
//           res.write(JSON.stringify({
//             status: "failed",
//             message: "資料重複"
//           }))
//           res.end()
//           return
//         }
//         const newPackage = await creditPackageRepo.create({
//           name: data.name,
//           credit_amount: data.credit_amount,
//           price: data.price
//         })
//         const result = await creditPackageRepo.save(newPackage)
//         res.writeHead(200, headers)
//         res.write(JSON.stringify({
//           status: "success",
//           data: result
//         }))
//         res.end()
//       } catch (error) {
//         console.error(error)
//         res.writeHead(500, headers)
//         res.write(JSON.stringify({
//           status: "error",
//           message: "伺服器錯誤"
//         }))
//         res.end()
//       }
//     })
//   } else if (req.url.startsWith("/api/credit-package/") && req.method === "DELETE") {
//     try {
//       const packageId = req.url.split("/").pop()
//       if (isUndefined(packageId) || isNotValidSting(packageId)) {
//         res.writeHead(400, headers)
//         res.write(JSON.stringify({
//           status: "failed",
//           message: "ID錯誤"
//         }))
//         res.end()
//         return
//       }
//       const result = await AppDataSource.getRepository("CreditPackage").delete(packageId)
//       if (result.affected === 0) {
//         res.writeHead(400, headers)
//         res.write(JSON.stringify({
//           status: "failed",
//           message: "ID錯誤"
//         }))
//         res.end()
//         return
//       }
//       res.writeHead(200, headers)
//       res.write(JSON.stringify({
//         status: "success"
//       }))
//       res.end()
//     } catch (error) {
//       console.error(error)
//       res.writeHead(500, headers)
//       res.write(JSON.stringify({
//         status: "error",
//         message: "伺服器錯誤"
//       }))
//       res.end()
//     }
//   } else if (req.method === "OPTIONS") {
//     res.writeHead(200, headers)
//     res.end()
//   } else if (req.url=== "/api/coaches/skill" && req.method === "GET") {
//     try {
//       const skills = await AppDataSource.getRepository("Skill").find({
//         select: ["id", "name", "createdAt"]
//       })

//       res.writeHead(200, headers)
//       res.write(JSON.stringify({
//         status: "success",
//         data: skills
//       }))
//       res.end()
//     } catch {
//       res.writeHead(headers)
//       res.write(JSON.stringify({
//          "status" : "error",
//          "message": "伺服器錯誤"
//       }))
//       res.end()
//     }
//   } else if (req.url=== "/api/coaches/skill" && req.method === "POST") {
//     req.on("end", async () => {
//       try{
//         const data = JSON.parse(body)
//         if (isUndefined(data.name) || isNotValidSting(data.name)){
//           res.writeHead(400, headers)
//           res.write(JSON.stringify({
//             "status" : "failed",
//             "message": "欄位未填寫正確"
//           }))
//           res.end()
//           return
//         }

//         const skillRepo = AppDataSource.getRepository("Skill");
//         const existSkill = await skillRepo.find({
//           where: {
//             name: data.name
//           }
//         })

//         if (existSkill.length) {
//           res.writeHead(200, headers)
//           res.write(JSON.stringify({
//             "status" : "failed",
// 	          "message": "資料重複"
//           }))
          
//           res.end()
//           return
//         } else {
//           const newSkill = skillRepo.create({
//             name: data.name 
//           })
//           const result = await skillRepo.save(newSkill) // JC's Q : when to add await?
//           console.log('result:', result)

//           res.writeHead(200, headers)
//           res.write(JSON.stringify({
//             "status" : "success",
//             "data": result
//           }))
//           res.end()
//         }
//       } catch (error) {
//         console.log(error)
//         res.writeHead(500, headers)
//         res.write(JSON.stringify({
//           "status" : "error",
//           "message": "伺服器錯誤"
//        }))
//         res.end()
//       }
//     })
//   } else if (req.url.startsWith("/api/coaches/skill/") && req.method === "DELETE"){
//     const skillID = req.url.split('/').pop()
//     if (isUndefined(skillID) || isNotValidSting(skillID)) {
//       res.writeHead(400, headers)
//       res.write(JSON.stringify({
//         status: "failed",
//         message: "ID錯誤"
//       }))
//       res.end()
//       return
//     } else {
//       const skillRepo = AppDataSource.getRepository("Skill");
//       const result = await skillRepo.delete(skillID)

//       /* 
//         JC's note : 
//         Delete result should have number of rows affected propert.
//       */
//       if (result.affected === 0) {
//         res.writeHead(400, headers)
//         res.write(JSON.stringify({
//           status: "failed",
//           message: "ID錯誤"
//         }))
//         res.end()
//         return
//       }
//       res.writeHead(200, headers)
//       res.write(JSON.stringify({
//         status: "success"
//       }))
//       res.end()
//     }
//   } else {
//     res.writeHead(404, headers)
//     res.write(JSON.stringify({
//       status: "failed",
//       message: "無此網站路由"
//     }))
//     res.end()
//   }
// }

// const server = http.createServer(requestListener)

// async function startServer () {
//   await AppDataSource.initialize()
//   console.log("資料庫連接成功")
//   server.listen(process.env.PORT)
//   console.log(`伺服器啟動成功, port: ${process.env.PORT}`)
//   return server;
// }

// module.exports = startServer();
