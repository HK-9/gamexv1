const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config({path:'./config.env'})
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
let hbs = require('express-handlebars')
const  db = require('./db') //database connection
const AppError = require('./util/AppError')
const adminRouter = require('./routes/admin');
const usersRouter = require('./routes/users');
const server = require('./server')
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({extname:'hbs',
defaultLayout:'layout',
layoutsDir:__dirname+'/views/layout/',
partialsDir:__dirname+'/views/partials/',
helpers:{
  formatString(date){
    newdate = date.toUTCString()
    return newdate.slice(0 , 16)
  },
  
inc1: function (context){
  return context +1
},
plusOne: function(number) {
  return number + 1;
}
}
}))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//SESSION
// app.use(session({
//   name : 'codeil',
//   secret : 'something',
//   resave :false,
//   saveUninitialized: true,
//   cookie : {
//   maxAge:(1000 * 60 * 100)
//   }      
// }));

app.use('/', usersRouter);
app.use('/admin', adminRouter);
// app.get('*',(req,res)=>{
  
//   res.render('404',{noHeader:true})
// })

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error',{noHeader:true});
});

const PORT = 3001;
 app.listen(PORT,()=>{
  console.log('local host established at 3001')
 })


module.exports = app;
