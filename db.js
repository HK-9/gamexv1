const mongoose = require('mongoose')  
 module.exports = {
    connect:   
    mongoose.connect(process.env.DATABASE_URL,
        {
           useUnifiedTopology: true,
           useNewUrlParser: true,
           autoIndex: true, //make this true
       }).then(()=>
     console.log('Mongoose DB sccessfully established')
     )
    
 };
 