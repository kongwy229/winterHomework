var entries = require('./routes/entries')
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var registerRouter = require('./routes/register');
var messages = require('./lib/messages')
var user = require('./lib/middleware/user')
var validate = require('./lib/middleware/validate')
var page = require('./lib/middleware/page')
var Entry = require('./lib/entry')
var api = require('./routes/api')
var routes = require('./routes/index')





var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
api.use('/api',api.auth)
app.use(user)
app.use(messages)
app.use(routes.notfound)
app.use(routes.error)

app.get('/',page(Entry.count,5),entries.list)
app.get('/register', registerRouter.form);
app.post('/register', registerRouter.submit);
api.get('/api/user/:id',api.user)
api.get('/api/entries/:page?',page(Entry.count),api.entries)
api.post('/api/entry',entries.submit)
app.get('/post', entries.form);
app.post('/post',validate.required('entry[title]'),validate.lengthAbove('entry[title]',4), entries.submit);


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
  res.render('error');
});



module.exports = app;
