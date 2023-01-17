// Koa与Mysql的搭配使用练习
const koa = require("koa")
const mysql = require("mysql")
const app = new koa();
const connection = mysql.createConnection({
    host: "127.0.0.1",
    port:3306,
    user: "root",
    password: "1111",
    database: "testkoa"
})
let sql = "SELECT * FROM picture";
connection.query(sql, function (err, results,) {
    if (err) throw err
    console.log("results", results)
})
// const addSql = "INSERT INTO picture(id,url) VALUE(2,?)"
// const sqlParams = ["/test.png"]

// connection.query(addSql, sqlParams, function (err, results) {
//     if (err) throw err
//     console.log("results", results)
// })

app.listen(3000, () => {
    console.log("服务器启动")
})