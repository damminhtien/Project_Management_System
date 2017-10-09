var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var flash = require('connect-flash-plus');
var fs = require('fs');
var multer = require('multer');

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

app.get('/baiviet/xem/:id', (req, res) => {
    var id = req.params.id;
   pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        client.query('SELECT * FROM thongbao WHERE id='+id, (err, result) => {
            release();
            if (err) {
                res.end();
                return console.error('Error executing query', err.stack)
            }
            res.render('viewpost', { thongbao: result.rows[0], usr: req._passport.session});
        })
    }) 
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
                var usr = result.rows[0];
                if (usr.doan.length >= 1) {
                    pool.connect((err, client, release) => {
                        client.query('SELECT * FROM da WHERE da.uploadby=' + req.session.passport.user.id, (err, result) => {
                            release();
                            if (err) {
                                res.end();
                            }
                            res.render('sinhvien/sinhvien', { usr: usr, da: result.rows });
                        })
                    })
                }
            })
        })
    } else {
        res.redirect('/');
    }
});

app.get("/doanthamkhao", function(req, res) {
    res.render('project-template');
})

app.get("/doithongtin/:id", function(req, res) {
    var id = req.params.id;
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        if (id > 20000000) {
            client.query("SELECT id,ten,lop,khoa,sdt,mail,namsinh FROM sinhvien WHERE id=" + id, (err, result) => {
                release();
                if (err) {
                    res.end();
                    return console.error('Error executing query', err.stack)
                }
                res.render('changeinfo', { sv: result.rows[0] });
            })
        } else {
            client.query("SELECT id,ten,sdt,mail,namsinh,diachi FROM giangvien WHERE id=" + id, (err, result) => {
                release();
                if (err) {
                    res.end();
                    return console.error('Error executing query', err.stack)
                }
                res.render('changeinfo', { sv: result.rows[0] });
            })
        }
    })
});

app.post("/doithongtin/:id", function(req, res) {
    var id = req.params.id,
        sdt = req.body.txtSdt,
        mail = req.body.txtMail;
    diachi = req.body.txtDiachi;
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        if (id > 20000000) {
            client.query("UPDATE sinhvien SET sdt='" + sdt + "', mail='" + mail + "' WHERE id=" + id, (err, result) => {
                release();
                if (err) {
                    res.end();
                    return console.error('Error executing query', err.stack)
                }
                res.redirect('/sinhvien');
            })
        } else {
            client.query("UPDATE giangvien SET sdt='" + sdt + "', mail='" + mail + "', diachi='" + diachi + "' WHERE id=" + id, (err, result) => {
                release();
                if (err) {
                    res.end();
                    return console.error('Error executing query', err.stack)
                }
                res.redirect('/giangvien');
            })
        }
    })
});

app.get("/doimatkhau/:id", function(req, res) {
    res.render('changepass');
});

app.post("/doimatkhau/:id", urlencodedParser, function(req, res) {
    var id = req.params.id;
    var newPass0 = req.body.txtNewPassword0;
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        if (id >= 20000000) {
            client.query("UPDATE sinhvien SET password=" + newPass0 + " WHERE id=" + id, (err, result) => {
                release();
                if (err) {
                    res.end();
                    return console.error('Error executing query', err.stack)
                }
                res.redirect("../../sinhvien");
            })
        } else {
            client.query("UPDATE giangvien SET password=" + newPass0 + " WHERE id=" + id, (err, result) => {
                release();
                if (err) {
                    res.end();
                    return console.error('Error executing query', err.stack)
                }
                res.redirect("../../giangvien");
            })
        }
    })
});

app.get("/sinhvien/nguyenvong/:id", function(req, res) {
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
            res.render('student-aspiration', { da: result.rows[0] });
        })
    })
})

app.post("/sinhvien/nguyenvong/:id", function(req, res) {
    var id = req.params.id;
    var bomon = req.body.bomon;
    var giangvien = req.body.giangvien;
    var ghichu = req.body.ghichuTxt;
    var thoigian = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        client.query("INSERT INTO nguyenvong(bysinhvien,bomon,giangvien,ghichu,thoigian) VALUES ('" + id + "','" + bomon + "','" + giangvien + "','" + ghichu + "','" + thoigian + "')", (err, result) => {
            release();
            if (err) {
                res.end();
                return console.error('Error executing query', err.stack)
            }
            res.redirect('../');
        })
    })
})

app.get("/sinhvien/doancuatoi/:id", function(req, res) {
    var id = req.params.id;
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        client.query("SELECT doanhientai FROM sinhvien WHERE id=" + id, (err, result) => {
            release();
            if (err) {
                res.end();
                return console.error('Error executing query', err.stack)
            }
            if (result.rows[0].doanhientai !== null) {
                var daht = result.rows[0].doanhientai;
                pool.connect((err, client, release) => {
                    if (err) {
                        return console.error('Error acquiring client', err.stack);
                    }
                    client.query("SELECT * FROM " + daht + " WHERE uploadby=" + id, (err, result) => {
                        release();
                        if (err) {
                            res.end();
                            return console.error('Error executing query', err.stack)
                        }
                        res.render('myproject', { da: result.rows[0], daht: daht });
                    })
                })
            } else res.send('Sinh viên không có đồ án kỳ này!');
        })
    })
});

app.get('/giangvien', function(req, res) {
    if (req.isAuthenticated()) {
        pool.connect((err, client, release) => {
            if (err) {
                return console.error('Error acquiring client', err.stack);
            }
            client.query('SELECT * FROM giangvien WHERE id=' + req.session.passport.user.id, (err, result) => {
                release();
                if (err) {
                    res.end();
                    return console.error('Error executing query', err.stack)
                }
                var usr = result.rows[0];
                pool.connect((err, client, release) => {
                    client.query('SELECT * FROM da WHERE diem IS NULL AND huongdan = ' + req.session.passport.user.id, (err, result) => {
                        release();
                        if (err) {
                            res.end();
                        }
                        res.render('giangvien/giangvien', { usr: usr, da: result.rows });
                    })
                })
            })
        })
    } else {
        res.redirect('/');
    }
});

app.get('/giangvien/chodiem/:da/:id', function(req, res) {
    var da = req.params.da,
        id = req.params.id;
    if (req.isAuthenticated()) {
        pool.connect((err, client, release) => {
            client.query("SELECT huongdan FROM " + da + " WHERE uploadby=" +id, (err, result) => {
                release();
                if (err) {
                    res.end();
                }
                console.log(result);
                if (result.rows[0].huongdan != req.session.passport.user.id) res.redirect("/");
                else res.render('giangvien/setmark');
            })
        })
    } else {
        res.redirect('/');
    }
})

app.post('/giangvien/chodiem/:da/:id', function(req, res) {
    var da = req.params.da,
        id = req.params.id,
        diem = req.body.txtDiem;
    pool.connect((err, client, release) => {
        client.query("UPDATE da SET diem='" + diem + "' WHERE uploadby='" + id + "'", (err, result) => {
            release();
            if (err) {
                res.end();
            }
            res.send("Cho điểm thành công <a href=\"../../../giangvien\">Nhấn vào đây để quay lại</a>");
        })
    })
})

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/' + req.body.da);
    },
    filename: function(req, file, cb) {
        cb(null, req.body.id + req.body.da + '.pdf');
    }
})

var upload = multer({ storage: storage });

app.post("/sinhvien/doancuatoi/:id", upload.single('file'), function(req, res) {
    var id = req.body.id;
    var da = req.body.da;
    var ten = req.body.tendetai;
    var ghichu = req.body.ghichu;
    var time = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        client.query("UPDATE " + da + " SET tendetai='" + ten + "',timeupload='" + time + "',ghichu='" + ghichu + "',hoanthanh='true' WHERE uploadby='" + id + "'", (err, result) => {
            release();
            if (err) {
                res.end();
                return console.error('Error executing query', err.stack)
            }
            res.send('Upload success, <a href=\"../../sinhvien\"> nhấn vào đây để quay lại </a>');
        })
    })
})

app.get('/giangvu',function(req, res){
   res.render('giangvu/home', {usr: user._passport.session}) 
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
            client.query('select id, password,ten from sinhvien union select id, password, ten from giangvien union select id, password, ten from nvvanphong', (err, result) => {
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
    done(null, user);
})

passport.deserializeUser(function(user, done) {
    // console.log('deserializeUser');
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        client.query('select id, password,ten from sinhvien union select id, password, ten from giangvien union select id, password, ten from nvvanphong', (err, result) => {
            release();
            if (err) {
                return console.error('Error executing query', err.stack)
            }
            result.rows.forEach(function(usr) {
                if (usr.id == user.id) {
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

app.get("/da/:name/get8from/:num", function(req, res) {
    var name = req.params.name;
    var num = req.params.num;
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        client.query('SELECT * FROM ' + name + '  ORDER BY id DESC OFFSET ' + num * 8 + ' LIMIT 8', (err, result) => {
            release();
            if (err) {
                res.end();
                return console.error('Error executing query', err.stack)
            }
            res.send(result.rows);
        })
    })
})

app.get('/:name/byid=:id', function(req, res) {
    var id = req.params.id,
        name = req.params.name;
    var filePath = "/uploads/" + name + "/" + id + name + ".pdf";
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

app.get("/giangvien/bomon=:bm", function(req, res) {
    var bm = req.params.bm;
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        client.query("SELECT * FROM giangvien WHERE bomon='" + bm + "'", (err, result) => {
            release();
            if (err) {
                res.end();
                return console.error('Error executing query', err.stack)
            }
            res.send(result.rows);
        })
    })
});