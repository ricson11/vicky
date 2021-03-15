const express = require('express');
const exphbs = require('express-handlebars');
const Handlebars = require('handlebars');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const moment = require('moment');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo')(session);
const env =  require('dotenv')
const path = require('path');
const {allowInsecurePrototypeAccess}=require('@handlebars/allow-prototype-access');

const {formatDate, formatTime, truncate, stripTags}=require('./helpers/hps');

require('./config/passport')(passport);
env.config({path: './.env'});


const app = express();

mongoose.promise = global.promise;

//local DB connection
/*mongoose.connect('mongodb://localhost/vicky', {
    useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: true
})
.then(()=>console.log('Mongodb connected to port 700'))
.catch(err=>console.log(err)); */

// production DB connection


mongoose.connect(process.env.mongoConnection, {
    useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: true
})
.then(()=>console.log('Mongodb connected to port 700'))
.catch(err=>console.log(err));  

app.engine('handlebars', exphbs({
   helpers:{
       formatDate: formatDate,
       formatTime: formatTime,
       truncate: truncate,
       stripTags: stripTags
   },
    handlebars:allowInsecurePrototypeAccess(Handlebars),
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

app.use(bodyparser.urlencoded({extended: false}))
app.use(bodyparser.json())

app.use(methodOverride('_method'));

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({mongooseConnection: mongoose.connection})
}));

app.use(passport.initialize ());
app.use(passport.session());

app.use(flash());

app.use(function(req, res, next){
    res.locals.success_msg = req.flash('success_msg'),
    res.locals.error_msg = req.flash('error_msg'),
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

app.use('/', require('./routes/post'));
app.use('/', require('./routes/admin'));

app.use('/admin', require('./routes/user'));
app.use('/css', express.static(__dirname +'/node_modules/bootstrap/dist/css'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/dist', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/dist', express.static(__dirname + '/node_modules/popper.js/dist'));
app.use('/fa', express.static(__dirname + '/node_modules/font-awesome/css'));
app.use('/fonts', express.static(__dirname + '/node_modules/font-awesome/fonts'));
app.use('/ckeditor', express.static(__dirname + '/node_modules/ckeditor'));

app.use(express.static(path.join(__dirname, 'public')));

const port=700
app.listen(port, ()=>console.log('Server is running on port,'+''+ 700))
//app.set('port,'||process.env.port);
//app.listen(app.get('port'),()=>console.log('Server is running on port', app.get('port')))
