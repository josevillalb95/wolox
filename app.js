var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var app = express();
var hbs = require('hbs');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
const router = express.Router();
const settings={
	connectURI:process.env.DB ||"sin",
	secretJWT:process.env.SECRET_JWT ||"sin",
	timeJWT:process.env.TIME_JWT || 100000,
	domain: process.env.DOMAIN || "localhost"
}
console.log("secretJWT",settings.secretJWT)
console.log("timeJWT",settings.timeJWT)
const memoria={
	CoinGecko:[],
	CoinName:[],
	monedas:["aed","ars","aud","bch","bdt","bhd","bits","bmd","bnb","brl","btc","cad","chf","clp","cny","czk","dkk","dot","eos","eth","eur","gbp","hkd","huf","idr","ils","inr","jpy","krw","kwd","link","lkr","ltc","mmk","mxn","myr","ngn","nok","nzd","php","pkr","pln","rub","sar","sats","sek","sgd","thb","try","twd","uah","usd","vef","vnd","xag","xau","xdr","xlm","xrp","yfi","zar"],
}
const jwt = require('jsonwebtoken');
const functionJWT={
	firmar:function(user,callback){
		if(!user || !user.username || !user.password)
			return callback(true,null)
		jwt.sign({"username": user.username,"password":user.password}, settings.secretJWT, { expiresIn: settings.timeJWT } ,callback );
	},
	validar:function(token,callback){
		if(!token) return callback(true,null)
		jwt.verify(token,settings.secretJWT,callback );
	}
}
const model = require('./model.js')(settings);
require('./monedas.js')(memoria,model);
app.use('/', require("./routes/index.js")({settings, model,router,functionJWT,memoria})); 
app.use('/users', require("./routes/users.js")({settings, model,router,functionJWT,memoria})); 
hbs.registerHelper('ifCond', function(v1, v2, options) {
  if(v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});
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
