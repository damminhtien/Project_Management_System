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
    cookie: { maxAge: 60 * 1000 * 60 },
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

app.get('/', (req, res) => {
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

app.post("/", (req, res) => {
    var da = "da";
    var key = req.body.key.toLowerCase().replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a").replace(/\\|\~|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)/g, ' ').replace(/đ/g, "d").replace(/đ/g, "d").replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y").replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u").replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ.+/g, "o").replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ.+/g, "e").replace(/ì|í|ị|ỉ|ĩ/g, "i");
    console.log(key);
    var arrKey = key.split(" ");
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        client.query('SELECT tendetai,uploadby,id,star FROM ' + da + ' WHERE hoanthanh = true ORDER BY id ASC ', (err, result) => {
            release();
            if (err) {
                res.end();
                return console.error('Error executing query', err.stack)
            }

            var arrResultFixKey = []; /*tim kiem chinh xac*/
            var arrResultHasAllKey = []; /*tim kiem cac key tach roi, chua tat ca cac key*/
            var arrResultHasSomeKey = []; /*chua mot vai key*/
            result.rows.forEach((data, index) => {
                var strCur = data.tendetai.toLowerCase().replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a").replace(/\\|\~|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)/g, ' ').replace(/đ/g, "d").replace(/đ/g, "d").replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y").replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u").replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ.+/g, "o").replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ.+/g, "e").replace(/ì|í|ị|ỉ|ĩ/g, "i");
                if (strCur.indexOf(key) != -1) {
                    arrResultFixKey.unshift(data);
                } else {
                    var flagAll = true; /* tra ve true neu tat ca key nam trong ten de tai*/
                    var flagSome = false;
                    arrKey.forEach((dt) => {
                        if (strCur.indexOf(dt) == -1) {
                            flagAll = false;
                        } else {
                            flagSome = true;
                        }
                    });
                    if (flagAll == true) arrResultHasAllKey.unshift(data);
                    else if (flagSome == true) arrResultHasSomeKey.unshift(data);
                }
            });
            res.render('doan/search-result', { arrFixKey: arrResultFixKey, arrHasAll: arrResultHasAllKey, arrHasSome: arrResultHasSomeKey, usr: req._passport.session, key: req.body.key, bomon: null });
        })
    })
})

var fs = require('fs'),
    PDFParser = require("pdf2json");

app.get('/timkiem/:da/:key', (req, res) => {
    var da = req.params.da,
        key = req.params.key;
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        client.query('SELECT tendetai,uploadby,id,star FROM ' + da + ' WHERE hoanthanh = true ORDER BY id ASC ', async(err, result) => {
            release();
            if (err) {
                res.end();
                return console.error('Error executing query', err.stack)
            }
            var arrResult = [];
            result.rows.forEach((data, index) => {
                var pdfParser = new PDFParser(this, 1);
                var pdfFilePath;
                if (data.id < 1000) {
                    pdfFilePath = __dirname + "/uploads/da1/" + data.uploadby + "da1.pdf";
                } else if (data.id < 2000) {
                    pdfFilePath = __dirname + "/uploads/da2/" + data.uploadby + "da2.pdf";
                } else if (data.id < 3000) {
                    pdfFilePath = __dirname + "/uploads/da3/" + data.uploadby + "da3.pdf";
                } else {
                    pdfFilePath = __dirname + "/uploads/datn/" + data.uploadby + "datn.pdf";
                }
                pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
                pdfParser.on("pdfParser_dataReady", (pdfData) => {
                    console.log(pdfParser.getRawTextContent());
                });
                pdfParser.loadPDF(pdfFilePath);
            })
            res.send("Loading...");
        });
    });
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
        client.query('SELECT * FROM thongbao WHERE id=' + id, (err, result) => {
            release();
            if (err) {
                res.end();
                return console.error('Error executing query', err.stack)
            }
            pool.connect((err, client, release) => {
                if (err) {
                    return console.error('Error acquiring client', err.stack);
                }
                client.query("UPDATE thongbao SET luotxem = luotxem + 1 WHERE id = " + id);
            })
            res.render('viewpost', { thongbao: result.rows[0], usr: req._passport.session });
        })
    })
});

app.get('/baiviet/viet/byid=:id', (req, res) => {
    res.render('giangvu/writepost', { usr: req._passport.session });
})

var storageAnh = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/images/');
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
})

var uploadAnh = multer({ storage: storageAnh });

app.post('/baiviet/viet/byid=:id', uploadAnh.single('ava'), (req, res) => {
    var id = req.params.id,
        tieude = req.body.txtTieude,
        tomtat = req.body.txtTomtatnoidung,
        noidung = req.body.txtNoidung,
        thoigian = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
        filename = req.file.originalname;
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        client.query("INSERT INTO thongbao(tieude,tomtatnoidung,noidung,uploadby,ngaygioupload,anhdaidien) VALUES('" + tieude + "','" + tomtat + "','" + noidung + "'," + id + ",'" + thoigian + "','" + filename + "')", (err, result) => {
            release();
            if (err) {
                res.end();
                return console.error('Error executing query', err.stack)
            }
            res.send("Gửi bài thành công");
        })
    })
})

app.get('/baiviet/sua', (req, res) => {
    res.render('modify-post');
})

app.post('/baiviet/sua', uploadAnh.single('ava'), (req, res) => {
    var id = req.body.id,
        name = req.body.tieude,
        tomtat = req.body.tomtatnoidung,
        noidung = req.body.noidung,
        ava = req.file.originalname;
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        client.query("UPDATE thongbao SET noidung='" + noidung + "',tomtatnoidung='" + tomtat + "',tieude='" + name + "',anhdaidien='" + ava + "' WHERE id=" + id + ";", (err, result) => {
            release();
            if (err) {
                res.end();
                return console.error('Error executing query', err.stack)
            }
            res.send("Sửa bài thành công");
        })
    })
})

app.get('/sinhvien', (req, res) => {
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

app.get("/doanthamkhao", (req, res) => {
    res.render('project-template');
})

app.get("/doithongtin/:id", (req, res) => {
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

app.post("/doithongtin/:id", (req, res) => {
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

app.get("/doimatkhau/:id", (req, res) => {
    res.render('changepass');
});

app.post("/doimatkhau/:id", urlencodedParser, (req, res) => {
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
                res.end("Đổi mật khẩu thành công");
            })
        } else if (id < 10000) {
            client.query("UPDATE giangvien SET password=" + newPass0 + " WHERE id=" + id, (err, result) => {
                release();
                if (err) {
                    res.end();
                    return console.error('Error executing query', err.stack)
                }
                res.end("Đổi mật khẩu thành công");
            })
        } else {
            client.query("UPDATE nvvanphong SET password=" + newPass0 + " WHERE id=" + id, (err, result) => {
                release();
                if (err) {
                    res.end();
                    return console.error('Error executing query', err.stack)
                }
                res.end("Đổi mật khẩu thành công");
            })
        }
    })
});

app.get("/sinhvien/nguyenvong/:id", (req, res) => {
    if (req.isAuthenticated()) {
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
                console.log(result.rows);
                var daht = result.rows[0].doanhientai;
                if (daht != null) {

                    pool.connect((err, client, release) => {
                        if (err) {
                            return console.error('Error acquiring client', err.stack);
                        }
                        client.query("SELECT huongdan FROM " + daht + " WHERE uploadby =" + id, (err, result) => {
                            release();
                            if (err) {
                                res.end();
                                return console.error('Error executing query', err.stack)
                            }
                            if (result.rows[0].huongdan == null) res.render('student-aspiration', { daht: daht });
                            else res.end("Sinh viên không thể đổi nguyện vọng đăng ký.");
                        })
                    })
                } else res.end("Sinh viên không có đồ án kỳ này");
            })
        })
    } else res.redirect("/login");
})

app.post("/sinhvien/nguyenvong/:id", (req, res) => {
    var id = req.params.id;
    var bomon = req.body.bomon;
    var giangvien = req.body.giangvien;
    var ghichu = req.body.ghichuTxt;
    var da = req.body.da;
    var thoigian = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        client.query("INSERT INTO nguyenvong(bysinhvien,bomon,giangvien,ghichu,thoigian,da) VALUES ('" + id + "','" + bomon + "','" + giangvien + "','" + ghichu + "','" + thoigian + "','" + da + "')", (err, result) => {
            release();
            if (err) {
                res.end();
                return console.error('Error executing query', err.stack)
            }
            res.redirect('../../sinhvien');
        })
    })
})

app.get("/sinhvien/doancuatoi/:id", (req, res) => {
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
                        if (result.rows[0].diem == null) {
                            res.render('myproject', { da: result.rows[0], daht: daht });
                        } else res.end("Đồ án của bạn hết thời hạn sửa đổi");
                    })
                })
            } else res.send('Sinh viên không có đồ án kỳ này!');
        })
    })
});

app.get('/giangvien', (req, res) => {
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

app.get('/giangvien/chodiem/:da/:id', (req, res) => {
    var da = req.params.da,
        id = req.params.id;
    if (req.isAuthenticated()) {
        pool.connect((err, client, release) => {
            client.query("SELECT huongdan FROM " + da + " WHERE uploadby=" + id, (err, result) => {
                release();
                if (err) {
                    res.end();
                }
                if (result.rows[0].huongdan != req.session.passport.user.id) res.redirect("/");
                else res.render('giangvien/setmark');
            })
        })
    } else {
        res.redirect('/');
    }
})


app.post('/giangvien/chodiem/:da/:id', (req, res) => {
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

var storageDa = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/' + req.body.da);
    },
    filename: function(req, file, cb) {
        cb(null, req.body.id + req.body.da + '.pdf');
    }
})

var uploadDa = multer({ storage: storageDa });

app.post("/sinhvien/doancuatoi/:id", uploadDa.single('file'), (req, res) => {
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

app.get('/giangvu', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('giangvu/home', { usr: req._passport.session.user });
    } else res.redirect('/');
})

app.get('/giangvu/pheduyetdoan', (req, res) => {
    if (req.isAuthenticated()) {
        pool.connect((err, client, release) => {
            client.query("SELECT * FROM nguyenvong", (err, result) => {
                release();
                if (err) {
                    res.end();
                }
                res.render('giangvu/approved', { nguyenvong: result.rows, usr: req._passport.session });
            })
        })
    } else res.redirect('/');
})

app.post('/giangvu/pheduyetdoan', (req, res) => {
    var id = req.body.id;
    console.log(id);
    if (req.isAuthenticated()) {
        pool.connect((err, client, release) => {
            client.query("SELECT * FROM nguyenvong WHERE id =" + id, (err, result) => {
                release();
                if (err) {
                    res.end();
                }
                var rs = result.rows[0];
                console.log(rs);
                var giangvien = rs.giangvien,
                    sinhvien = rs.bysinhvien,
                    da = rs.da;
                pool.connect((err, client, release) => {
                    client.query("UPDATE " + da + " SET huongdan = " + giangvien + " WHERE  uploadby =" + sinhvien);
                    client.query("DELETE FROM nguyenvong WHERE bysinhvien =" + sinhvien)
                })
            })
        })
    } else res.redirect('/');
})

app.get('/giangvu/capnhatdoanmoi', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('giangvu/update-project');
    } else res.redirect('/');
})

app.post('/giangvu/capnhatdoanmoi', (req, res) => {
    var id = req.body.mssv,
        ky = req.body.ky,
        da = req.body.da,
        tS = req.body.timestart,
        tE = req.body.timeend;
    pool.connect((err, client, release) => {
        client.query("SELECT id FROM sinhvien WHERE id=" + id, (err, result) => {
            release();
            if (err) {
                res.end();
            }
            if (result.rows.length == 0) {
                res.end("Sinh viên không tồn tại.");
            } else {
                client.query("SELECT id FROM " + da + " WHERE uploadby=" + id, (err, result) => {
                    release();
                    if (err) {
                        res.end();
                    }
                    if (result.rows[0] == null) {
                        client.query("SELECT doanhientai FROM sinhvien WHERE id=" + id, (err, result) => {
                            release();
                            if (err) {
                                res.end();
                            }
                            if (result.rows[0].doanhientai != null) res.end("Sinh viên đã có đồ án kỳ này");
                            else {
                                client.query("INSERT INTO " + da + "(uploadby,ky,timestart,timeend) VALUES(" + id + "," + ky + ",'" + tS + "','" + tE + "')", (err, result) => {
                                    release();
                                    if (err) {
                                        res.end();
                                    };
                                    client.query("SELECT doan FROM sinhvien WHERE id=" + id, (err, result) => {
                                        release();
                                        if (err) {
                                            res.end();
                                        }
                                        var doan = result.rows[0].doan;
                                        doan.push(da);
                                        client.query("UPDATE sinhvien SET doan = '{" + doan + "}' WHERE id = " + id, (err, result) => {
                                            release();
                                            if (err) {
                                                res.end();
                                            };
                                            client.query("UPDATE sinhvien SET doanhientai = '" + da + "' WHERE id = " + id, (err, result) => {
                                                release();
                                                if (err) {
                                                    res.end();
                                                };
                                            })
                                        })
                                        res.end("Cập nhật thành công");
                                    })
                                })
                            }
                        });
                    } else res.end("Sinh viên đã có đồ án này");
                })
            }
        })
    })
})

app.get("/giangvu/capnhatdoancu", (req, res) => {
    if (req.isAuthenticated()) {
        res.render('giangvu/modify-project');
    } else res.redirect('/');
});

app.post("/giangvu/capnhatdoancu", (req, res) => {
    var mssv = req.body.mssv,
        da = req.body.da,
        ky = req.body.ky,
        diem = req.body.diem,
        ghichu = req.body.ghichu,
        tendetai = req.body.tendetai,
        timestart = req.body.timestart,
        timeend = req.body.timeend,
        huongdan = req.body.huongdan,
        star = req.body.star;
    pool.connect((err, client, release) => {
        console.log("UPDATE " + da + " SET ky=" + ky + ",diem=" + diem + ",ghichu='" + ghichu + "',tendetai='" + tendetai + "',timestart='" + timestart + "',timeend='" + timeend + "',star=" + star + ",huongdan=" + huongdan);
        client.query("UPDATE " + da + " SET ky=" + ky + ",diem=" + diem + ",ghichu='" + ghichu + "',tendetai='" + tendetai + "',timestart='" + timestart + "',timeend='" + timeend + "',star=" + star + ",huongdan=" + huongdan + " WHERE uploadby=" + mssv, (err, result) => {
            release();
            if (err) {
                res.end();
            }
            res.end("Cập nhật thành công!");
        })
    })
});

app.get('/giangvu/taogiangvien', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('giangvu/create-teacher');
    } else res.redirect('/');
})

app.post('/giangvu/taogiangvien', (req, res) => {
    var ten = req.body.ten,
        bomon = req.body.bomon,
        pass = req.body.pass,
        namsinh = req.body.namsinh,
        diachi = req.body.diachi,
        mail = req.body.mail;
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        client.query("INSERT INTO giangvien(ten,bomon,password,namsinh,diachi,mail) VALUES('" + ten + "','" + bomon + "','" + pass + "','" + namsinh + "','" + diachi + "','" + mail + "');");
        client.query("SELECT id,password,ten FROM giangvien ORDER BY id DESC LIMIT 1", (err, result) => {
            release();
            if (err) {
                res.end();
                return console.error('Error executing query', err.stack)
            }
            res.send("Tài khoản của giảng viên " + result.rows[0].ten + " : Tên đăng nhập: " + result.rows[0].id + " Mật khẩu: " + result.rows[0].password);
        })
    })
})

app.get('/giangvu/taosinhvien', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('giangvu/create-student');
    } else res.redirect('/');
})

app.post('/giangvu/taosinhvien', (req, res) => {
    var id = req.body.id,
        ten = req.body.ten,
        pass = req.body.pass,
        namsinh = req.body.namsinh,
        lop = req.body.lop,
        khoa = req.body.khoa;
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        client.query("INSERT INTO sinhvien(ten,id,password,namsinh,lop) VALUES('" + ten + "','" + id + "'," + pass + "," + namsinh + ",'" + lop + "');", (err, result) => {
            release();
            if (err) {
                res.end("Tài khoản bị trùng mssv đã có");
                return console.error('Error executing query', err.stack);
            }
        });
        client.query("SELECT id,password,ten FROM sinhvien ORDER BY id DESC LIMIT 1", (err, result) => {
            release();
            if (err) {
                res.end();
                return console.error('Error executing query', err.stack)
            }
            res.send("Tài khoản của sinh viên " + result.rows[0].ten + " : Tên đăng nhập: " + result.rows[0].id + " Mật khẩu: " + result.rows[0].password);
        })
    })
})

/* sử dụng chứng thực local, nếu chứng thực ko đc thì gửi mess*/
app.route('/login')
    .get((req, res) => {
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

app.get("/da/:da/bomon=:bm", (req, res) => {
    var da = req.params.da,
        bomon = req.params.bm;
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        client.query("SELECT tendetai," + da + ".id,uploadby,huongdan,diem,star,ky,ghichu FROM " + da + ",giangvien WHERE giangvien.bomon = '" + bomon + "' AND " + da + ".hoanthanh=true AND " + da + ".huongdan=giangvien.id", (err, result) => {
            release();
            if (err) {
                res.end();
                return console.error('Error executing query', err.stack)
            }
            res.render('doan/bomon', { da: result.rows, bomon: bomon, usr: req._passport.session });
        })
    })
});

app.get("/da/:da/xemchitiet/:id", (req, res) => {
    var da = req.params.da,
        id = req.params.id;
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        client.query("SELECT * FROM " + da + " WHERE id = " + id, (err, result) => {
            release();
            if (err) {
                res.end();
                return console.error('Error executing query', err.stack)
            }
            res.render('doan/view-info', { data: result.rows[0], usr: req._passport.session });
        })
    })
});

/* ajax */

/* bài đăng */
app.get("/recent/post=:id.json", (req, res) => {
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
app.get("/da/:name/byid=:id", (req, res) => {
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

app.get("/da/:da/gettop", (req, res) => {
    var da = req.params.da;
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        client.query('SELECT star,id,uploadby,diem,huongdan,tendetai FROM ' + da + '  ORDER BY star DESC LIMIT 6', (err, result) => {
            release();
            if (err) {
                res.end();
                return console.error('Error executing query', err.stack)
            }
            res.send(result.rows);
        })
    })
})

app.get("/da/:name/get8from/:num", (req, res) => {
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

app.post("/da/:da/bomon=:bm", (req, res) => {
    var da = req.params.da;
    var key = req.body.key.toLowerCase().replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a").replace(/\\|\~|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)/g, ' ').replace(/đ/g, "d").replace(/đ/g, "d").replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y").replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u").replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ.+/g, "o").replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ.+/g, "e").replace(/ì|í|ị|ỉ|ĩ/g, "i");
    console.log(key);
    var arrKey = key.split(" ");
    var bomon = req.params.bm;
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        client.query("SELECT tendetai,uploadby," + da + ".id,star FROM " + da + ",giangvien WHERE hoanthanh = true AND giangvien.bomon = '" + bomon + "' AND giangvien.id = " + da + ".huongdan ORDER BY id ASC ", (err, result) => {
            release();
            if (err) {
                res.end();
                return console.error('Error executing query', err.stack)
            }

            var arrResultFixKey = []; /*tim kiem chinh xac*/
            var arrResultHasAllKey = []; /*tim kiem cac key tach roi, chua tat ca cac key*/
            var arrResultHasSomeKey = []; /*chua mot vai key*/
            result.rows.forEach((data, index) => {
                var strCur = data.tendetai.toLowerCase().replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a").replace(/\\|\~|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)/g, ' ').replace(/đ/g, "d").replace(/đ/g, "d").replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y").replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u").replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ.+/g, "o").replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ.+/g, "e").replace(/ì|í|ị|ỉ|ĩ/g, "i");
                if (strCur.indexOf(key) != -1) {
                    arrResultFixKey.unshift(data);
                } else {
                    var flagAll = true; /* tra ve true neu tat ca key nam trong ten de tai*/
                    var flagSome = false;
                    arrKey.forEach((dt) => {
                        if (strCur.indexOf(dt) == -1) {
                            flagAll = false;
                        } else {
                            flagSome = true;
                        }
                    });
                    if (flagAll == true) arrResultHasAllKey.unshift(data);
                    else if (flagSome == true) arrResultHasSomeKey.unshift(data);
                }
            });
            res.render('doan/search-result', { arrFixKey: arrResultFixKey, arrHasAll: arrResultHasAllKey, arrHasSome: arrResultHasSomeKey, usr: req._passport.session, key: req.body.key, bomon: bomon });
        })
    })
})

app.get('/:name/byid=:id', (req, res) => {
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        client.query("UPDATE " + name + " SET star = star + 1 WHERE uploadby = " + id);
    })
    var id = req.params.id,
        name = req.params.name;
    var filePath = "/uploads/" + name + "/" + id + name + ".pdf";
    if (req.isAuthenticated()) {
        fs.readFile(__dirname + filePath, function(err, data) {
            res.contentType("application/pdf");
            res.end(data);
        })
    } else {
        var pdfParser = new PDFParser(this, 1);
        pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
        pdfParser.on("pdfParser_dataReady", (pdfData) => {
            res.end(pdfParser.getRawTextContent());
        });
        pdfParser.loadPDF(__dirname + filePath);
    }

})

/*giảng viên*/
app.get("/giangvien/id=:id", (req, res) => {
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

app.get("/giangvien/bomon=:bm", (req, res) => {
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

/*thông báo*/

app.get("/baiviet/laythongtin/id=:id", (req, res) => {
    var id = req.params.id;
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        client.query("SELECT * FROM thongbao WHERE id=" + id, (err, result) => {
            release();
            if (err) {
                res.end();
                return console.error('Error executing query', err.stack)
            }
            res.send(result.rows);
        })
    })
})