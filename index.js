// 引入所需模組
const express = require('express'); // 引入 Express 框架
const mysql = require('mysql'); // 引入 MySQL 模組
const path = require('path'); // 引入 path 模組
const cors = require('cors'); // 引入 cors 模組


// 引入 dotenv 模組並讀取 .env 檔案中的環境變數
require('dotenv').config(); 

// 建立 Express 應用程式
const app = express();

// 設定 MySQL 連接參數
const db = mysql.createConnection({
    host: process.env.DB_HOST, // 使用環境變數設置 MySQL 主機
    user: process.env.DB_USER, // 使用環境變數設置 MySQL 使用者名稱
    password: process.env.DB_PASSWORD, // 使用環境變數設置 MySQL 密碼
    database: process.env.DB_NAME // 使用環境變數設置要連接的資料庫名稱
});

// 連接到 MySQL 資料庫
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('MySQL 連線成功...'); // 連線成功時的提示訊息
});

// 設置中介軟體來解析 POST 請求的資料
app.use(express.json()); // 解析 JSON 格式的請求資料
app.use(express.urlencoded({ extended: false })); // 解析表單提交的資料
app.use(cors()); // 使用 CORS 中間件

// 設置靜態資源路徑，使 Express 能夠提供 public 資料夾中的檔案
app.use(express.static('public'));
// 設置靜態資源路徑，使 Express 能夠提供 CSS 和 JavaScript 檔案
app.use('/styles', express.static(path.join(__dirname, 'public/styles')));
app.use('/scripts', express.static(path.join(__dirname, 'public/scripts')));

// 使用 app.get('/') 路由來直接渲染 HTML 檔案
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html'); // 將 HTML 檔案發送到客戶端
});

// 使用 app.get('/get_todoList') 路由來檢索 todoList 表中的所有資料
app.get('/get_todoList', (req, res) => {
    const sql = 'SELECT * FROM todoList'; // 查詢資料庫中的所有資料
    db.query(sql, (err, result) => {
        if (err) {
            res.status(500).send('從資料庫檢索資料時出錯'); // 如果出錯，發送錯誤狀態碼和訊息到客戶端
            throw err;
        }
        console.log('從資料庫檢索到資料:', result); // 將從資料庫檢索到的資料輸出到控制台
        res.json(result); // 將資料以 JSON 格式發送回客戶端
    });
});

// 處理 POST 請求以將資料插入到 MySQL 資料庫中
app.post('/add_todoList', (req, res) => {
    console.log(req.body); // 將 POST 請求的請求體輸出到控制台
    const { name, due_date } = req.body; // 從請求體中獲取待辦事項名稱和截止日期
    const sql = 'INSERT INTO todoList (name, due_date) VALUES (?, ?)'; // SQL 插入語句
    db.query(sql, [name, due_date], (err, result) => {
        if (err) {
            res.status(500).send('插入資料到資料庫時出錯'); // 如果出錯，發送錯誤狀態碼和訊息到客戶端
            throw err;
        }
        console.log('資料插入到資料庫:', result); // 將插入資料的結果輸出到控制台
        res.status(200).send('資料插入到資料庫'); // 發送成功訊息到客戶端
    });
});

// 處理 PATCH 請求以更新特定待辦事項的名稱和截止日期
app.patch('/update_todoList/:id', (req, res) => {
    const id = req.params.id; // 獲取待辦事項的標識符
    const { name, due_date } = req.body; // 獲取更新的名稱和截止日期
    const sql = 'UPDATE todoList SET name = ?, due_date = ? WHERE id = ?'; // SQL 更新語句
    db.query(sql, [name, due_date, id], (err, result) => {
        if (err) {
            res.status(500).send('在資料庫中更新資料時出錯'); // 如果出錯，發送錯誤狀態碼和訊息到客戶端
            throw err;
        }
        console.log('在資料庫中更新資料:', result); // 將更新資料的結果輸出到控制台
        res.status(200).send('在資料庫中成功更新資料'); // 發送成功訊息到客戶端
    });
});

// 處理 DELETE 請求以刪除特定待辦事項
app.delete('/delete_todoList/:id', (req, res) => {
    const todoId = req.params.id; // 獲取待辦事項的標識符
    const sql = 'DELETE FROM todoList WHERE id = ?'; // SQL 刪除語句
    db.query(sql, [todoId], (err, result) => {
        if (err) {
            res.status(500).send('從資料庫中刪除資料時出錯'); // 如果出錯，發送錯誤狀態碼和訊息到客戶端
            throw err;
        }
        console.log('從資料庫中刪除資料:', result); // 將刪除資料的結果輸出到控制台
        res.status(200).send('從資料庫中成功刪除資料'); // 發送成功訊息到客戶端
    });
});

// 監聽端口
const port = 3000; // 應用程式運行的端口號
app.listen(port, () => console.log(`伺服器正在執行，位於端口 ${port}`)); // 在控制台輸出伺服器啟動訊息
