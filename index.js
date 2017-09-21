var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var flash = require('connect-flash-plus');
var fs = require('fs');

app.use(session({
  secret: 'keyboard cat',
  cookie: { maxAge: 60*1000*15 },
  saveUninitialized: true,
  resave: true
}));
 
app.use(flash());
var cookieParser = require('cookie-parser');

app.use(express.static("./public"));
app.set("view engine","ejs");
app.set("views","./views");

app.use(bodyParser.urlencoded({extended:false}));
app.use(passport.initialize());
app.use(cookieParser());
app.use(flash());
app.use(passport.session());

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

// var database = require(__dirname + '/models/database.js');

app.get('/', function(req, res){
	pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        client.query('SELECT * FROM thongbao ORDER BY id DESC LIMIT 10', (err, result) => {
            release();
            if (err) {
            	res.end();
                return console.error('Error executing query', err.stack)
            }
            res.render('./home/trangchu', {thongbao: result, usr: req._passport.session});
        })  
    })
});

app.get('/logout', (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect('/');
});

app.get('/sinhvien', function(req, res){
    // var id = req._parsedUrl.query;
    // console.log(req.session.passport.user);
    if(req.isAuthenticated()){
        pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        client.query('SELECT * FROM sinhvien WHERE id='+ req.session.passport.user.id, (err, result) => {
            release();
            if (err) {
                res.end();
                return console.error('Error executing query', err.stack)
            }
            // console.log(req.session.passport.user);
            if(req.session.passport.user.doan.length >= 1){
                req.session.passport.user.doan.forEach(function(da){
                    pool.connect((err, client, release) =>{client.query('SELECT * FROM '+ da+' WHERE '+da+'.uploadby='+req.session.passport.user.id, (err, result) => {
                        release();
                        if (err) {
                            res.end();
                        }
                        res.render('./sinhvien/sinhvien', {usr: req.session.passport.user, da:result.rows});
                    })  
                    })
                });
            } 
        })  
        })
    }
    else{
        res.redirect('/');
    }
    
});

    app.get('/da', function(req, res){
    var filePath = "/uploads/DA1.pdf";

    fs.readFile(__dirname + filePath , function (err,data){
        res.contentType("application/pdf");
        res.send(data);
    });
})

/* sử dụng chứng thực local, nếu chứng thực ko đc thì gửi mess*/
app.route('/login')
.get(function(req, res){
    res.render('login', {message: req.flash('error')});
})
.post(passport.authenticate('local', {failureRedirect:'/login', successRedirect: '/', failureFlash: true}));

/* chứng thực local strategy, lấy dữ liệu từ DB, nếu đúng/sai return hàm done(null, usr) / done (null, false) */
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
            result.rows.forEach(function(usr){
                if(usr.id == username){
                    if(usr.password == password) {
                        key = false;
                        return done(null, usr, {usr: usr} );
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

/* nếu chứng thực đúng sẽ gọi  */
passport.serializeUser((user, done) => {
    // console.log("serializeUser" + user);
    done(null, user);
})

passport.deserializeUser(function(user, done) {
    // console.log('deserializeUser');
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        client.query('SELECT * FROM sinhvien', (err, result) => {
            release();
            if (err) {
                return console.error('Error executing query', err.stack)
            }
            result.rows.forEach(function(usr){
                if(usr.id == user.id){
                    // console.log(user);
                    return done(null, user);
                }
            });
        })  
    })
});

/* ajax */
app.get("/recent/post=:id.json", function(req, res){
    var id = parseInt(req.params.id);
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        client.query('SELECT * FROM thongbao ORDER BY id DESC OFFSET ' + id*8 +' LIMIT 8', (err, result) => {
            release();
            if (err) {
                res.end();
                return console.error('Error executing query', err.stack)
            }
            res.send(result.rows);
        })  
    })
});

app.get("/da/:name/byid=:id", function(req, res){
    var name = req.params.name;
    var id = parseInt(req.params.id);
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        client.query('SELECT * FROM '+ name+' WHERE '+ name+ '.uploadby ='+ id, (err, result) => {
            release();
            if (err) {
                res.end();
                return console.error('Error executing query', err.stack)
            }
            res.send(result.rows);
        })  
    })
});

app.get("/giangvien/id=:id", function(req, res){
    var id = parseInt(req.params.id);
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        client.query('SELECT * FROM giangvien WHERE id ='+ id, (err, result) => {
            release();
            if (err) {
                res.end();
                return console.error('Error executing query', err.stack)
            }
            res.send(result.rows);
        })  
    })
});





