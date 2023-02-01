var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var hbs = require('express-handlebars');
var db = require('./config/connection');
var app = express();
var fileUpload = require('express-fileupload');
var session = require('express-session')

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine("hbs", hbs.engine({
  extname:'hbs',
  defaultLayout: "layout",
  partialsDir: path.join(__dirname, "views", "partials"),
  layoutsDir: path.join(__dirname, "views", "layouts"),
  }));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

db.connect(function(err){
  if(err) console.log('Connection error'+err);  /// mongodb status
  else console.log('Connection success');
})

app.use(session({secret:"key",cookie:{maxAge:600000}}));
app.use(fileUpload());
app.use('/', userRouter);
app.use('/user', userRouter);
app.use('/admin', adminRouter);



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
  res.render('error',{userLog:true});
});

module.exports = app;
