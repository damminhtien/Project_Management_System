// var pg = require("pg");
// const pool = new pg.Pool({
//     user: 'postgres',
//     host: 'localhost',
//     database: 'qlda',
//     password: 'dmt',
//     port: 2197,
// });


// pool.connect((err, client, release) => {
//     client.query('SELECT * FROM thongbao ORDER BY id DESC LIMIT 10', 'SELECT * FROM sinhvien ORDER BY id DESC LIMIT 10',(err, result) => {
//         release();
//         if (err) {
//             return console.error('Error executing query', err.stack)
//         }
//         console.log(result);
//         // return result.rows;
//     }) 
//     // client.query('SELECT * FROM sinhvien ORDER BY id DESC LIMIT 10', (err, result) => {
//     //     release();
//     //     if (err) {
//     //         res.end();
//     //         return console.error('Error executing query', err.stack)
//     //     }
//     //     // console.log(result);
//     //     // return result.rows;
//     // })
//     console.log(client); 
// })




