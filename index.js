var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var flash = require('connect-flash-plus');
 
app.use(session({
  secret: 'keyboard cat',
  cookie: { maxAge: 60000 }
}));
 
app.use(flash());
// var connect = require('connect');
var cookieParser = require('cookie-parser');

app.use(express.static("./public"));
app.set("view engine","ejs");
app.set("views","./views");

app.use(bodyParser.urlencoded({extended:true}));
app.use(passport.initialize());
app.use(cookieParser());
app.use(flash());

var pg = require("pg");
const pool = new pg.Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'qlda',
    password: 'dmt',
    port: 2197,
});

var server = require("http").Server(app);
server.listen(process.env.PORT || 2211);



app.get('/', function(req, res){
	pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        var rs = {
            thongbao:null,
            doan:null
        };
        client.query('SELECT * FROM thongbao order by id asc', (err, result) => {
            release();
            if (err) {
            	res.end();
                return console.error('Error executing query', err.stack)
            }
            rs.thongbao = result;
            // console.log(rs);
            res.render('./home/trangchu', rs);
        })  
    })
});

app.route('/login')
.get(function(req, res){
    res.render('login', {message: req.flash('error')});
})
.post(passport.authenticate('local', {failureRedirect:'/login', successRedirect: '/', failureFlash: true}));

passport.use(new LocalStrategy(
    (username, password, done) => {
        pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        client.query('SELECT * FROM sinhvien', (err, result) => {
            release();
            if (err) {
                res.end();
                return console.error('Error executing query', err.stack)
            }
            var key = true;
            result.rows.forEach(function(usr, index){
                if(usr.id == username){
                    if(usr.password == password) {
                        key = false;
                        return done(null, usr);
                    }
                    else{
                        key = false; 
                        return done(null, false, {message: 'Invalid password.'});
                    } 
                }
            });
            if(key == true) return done(null, false, {message: 'Invalid username.'});
        })  
    })
    }
))

passport.serializeUser((user, done) => {
    done(null, user);
})