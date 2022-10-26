// const mongoose = require('mongoose')
// const dotenv = require('dotenv')
// const app = require('./app');

// dotenv.config({path:'./config.env'})
// const LOCAL_DATABASE = process.env.LOCAL_DATABASE;
// const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);
// mongoose.connect(DB,{
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useFindAndModify:true
// }).then(con=>{
//     // console.log(con.connection)
//     console.log('database connection seccessfull')
// })
// // console.log(process.env)

// // console.log(app.get('env'))

// const port = 3000;
// app.listen(port,()=>{
//     console.log(`server listening to port ${port}`)
// })

// module.exports = server