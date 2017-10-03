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
    cookie: { maxAge: 60 * 1000 * 15 },
    saveUninitialized: true,
    resave: true
}));

app.use(flash());
var cookieParser = require('cookie-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(express.static("./public"));
app.set("view engine", "ejs");
app.set("views", "./views");

app.use(bodyParser.urlencoded({ extended: false }));
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

app.get('/', function(req, res) {
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
            res.render('./home/trangchu', { thongbao: result, usr: req._passport.session });
        })
    })
});

app.get('/logout', (req, res) => {
    req.logout();
    req.session.destroy();
    res.redirect('/');
});

app.get('/sinhvien', function(req, res) {
    if (req.isAuthenticated()) {
        pool.connect((err, client, release) => {
            if (err) {
                return console.error('Error acquiring client', err.stack);
            }
            client.query('SELECT * FROM sinhvien WHERE id=' + req.session.passport.user.id, (err, result) => {
                release();
                if (err) {
                    res.end();
                    return console.error('Error executing query', err.stack)
                }
                if (req.session.passport.user.doan.length >= 1) {
                    pool.connect((err, client, release) => {
                        client.query('SELECT * FROM da WHERE da.uploadby=' + req.session.passport.user.id, (err, result) => {
                            release();
                            if (err) {
                                res.end();
                            }
                            res.render('sinhvien/sinhvien',{ usr: req.session.passport.user, da: result.rows });
                        })
                    })
                }
            })
        })
    } else {
        res.redirect('/');
    }

});

app.get("/sinhvien/doimatkhau/:id", function(req, res) {
    res.render('changepass');
});

app.get("/sinhvien/doanthamkhao", function(req, res){
    res.render('project-template');
})

app.get("/sinhvien/doithongtin/:id", function(req, res) {
    var id = req.params.id;
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        client.query("SELECT id,ten,lop,khoa,sdt,mail,namsinh FROM sinhvien WHERE id=" + id, (err, result) => {
            release();
            if (err) {
                res.end();
                return console.error('Error executing query', err.stack)
            }
            res.render('changeinfo', { sv: result.rows[0] });
        })
    })
});

app.post("/sinhvien/doithongtin/:id", function(req, res) {
    var id = req.params.id,
        sdt = req.body.txtSdt,
        mail = req.body.txtMail;
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        client.query("UPDATE sinhvien SET sdt='" + sdt + "', mail='" + mail + "' WHERE id=" + id, (err, result) => {
            release();
            if (err) {
                res.end();
                return console.error('Error executing query', err.stack)
            }
            res.redirect('/sinhvien');
        })
    })
});

app.post("/sinhvien/doimatkhau/:id", urlencodedParser, function(req, res) {
    var id = req.params.id;
    var newPass0 = req.body.txtNewPassword0;
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        client.query("UPDATE sinhvien SET password=" + newPass0 + " WHERE id=" + id, (err, result) => {
            release();
            if (err) {
                res.end();
                return console.error('Error executing query', err.stack)
            }
            res.redirect("../../sinhvien");
        })
    })
});

app.get("/sinhvien/nguyenvong/:id", function(req, res){
    var id = req.params.id;
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        client.query("SELECT doanhientai FROM sinhvien WHERE id =" + id, (err, result) => {
            release();
            if (err) {
                res.end();
                return console.error('Error executing query', err.stack)
            }
            res.send( {da: result});
        })
    })
})


/* sử dụng chứng thực local, nếu chứng thực ko đc thì gửi mess*/
app.route('/login')
    .get(function(req, res) {
        res.render('login', { message: req.flash('error') });
    })
    .post(passport.authenticate('local', { failureRedirect: '/login', successRedirect: '/', failureFlash: true }));

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
                result.rows.forEach(function(usr) {
                    if (usr.id == username) {
                        if (usr.password == password) {
                            key = false;
                            return done(null, usr, { usr: usr });
                        } else {
                            key = false;
                            return done(null, false, { message: 'Invalid password.' });
                        }
                    }
                });
                if (key == true) return done(null, false, { message: 'Invalid username.' });
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
            result.rows.forEach(function(usr) {
                if (usr.id == user.id) {
                    // console.log(user);
                    return done(null, user);
                }
            });
        })
    })
});

/* ajax */

/* bài đăng */
app.get("/recent/post=:id.json", function(req, res) {
    var id = parseInt(req.params.id);
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        client.query('SELECT * FROM thongbao ORDER BY id DESC OFFSET ' + id * 8 + ' LIMIT 8', (err, result) => {
            release();
            if (err) {
                res.end();
                return console.error('Error executing query', err.stack)
            }
            res.send(result.rows);
        })
    })
});


/* đồ án*/
app.get("/da/:name/byid=:id", function(req, res) {
    var name = req.params.name;
    var id = parseInt(req.params.id);
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        client.query('SELECT * FROM ' + name + ' WHERE ' + name + '.uploadby =' + id, (err, result) => {
            release();
            if (err) {
                res.end();
                return console.error('Error executing query', err.stack)
            }
            res.send(result.rows);
        })
    })
});

app.get("/da/:name/get8from/:num", function(req, res){
    var name = req.params.name;
    var num = req.params.num;
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        client.query('SELECT * FROM ' + name + '  ORDER BY id DESC OFFSET ' +num*8+ ' LIMIT 8', (err, result) => {
            release();
            if (err) {
                res.end();
                return console.error('Error executing query', err.stack)
            }
            res.send(result.rows);
        })
    })
})

app.get('/:name/id=:id/view', function(req, res) {
    var id = req.params.id,
        name = req.params.name;
    var filePath = "/uploads/" + name + "/" + id + ".pdf";
    fs.readFile(__dirname + filePath, function(err, data) {
        res.contentType("application/pdf");
        res.send(data);
    });
})

/*giảng viên*/
app.get("/giangvien/id=:id", function(req, res) {
    var id = parseInt(req.params.id);
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        client.query('SELECT * FROM giangvien WHERE id=' + id, (err, result) => {
            release();
            if (err) {
                res.end();
                return console.error('Error executing query', err.stack)
            }
            res.send(result.rows);
        })
    })
});