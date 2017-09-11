var express = require('express');
var app = express();

app.use(express.static("./public"));
app.set("view engine","ejs");
app.set("views","./views");

var pg = require("pg");
const pool = new pg.Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'qlda',
    password: 'dmt',
    port: 2197,
});

var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var server = require("http").Server(app);
server.listen(process.env.PORT || 3000);

app.get('/', function(req, res){
	pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack);
        }
        client.query('SELECT * FROM thongbao order by id asc', (err, result) => {
            release();
            if (err) {
            	res.end();
                return console.error('Error executing query', err.stack)
            }
            res.render("trangchu",{rs:result});
        })
    })
});

