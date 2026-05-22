// Request validation (optional with Joi/Zod)

// here you define schema like:
// name required
// email valid
// password min length
db.users.insertOne({firstname:"Super",lastname:"Admin",phone:"+213600000000",email:"admin@marketing.com",password:"$2b$10$P4rNZT04mvUYxtngfnn0yenQHvmDPDTQSP.2RNtPwwEKCGTEGjQQG",hasPaid:false,role:"admin",createdAt:new Date(),updatedAt:new Date()})