const mysql = require('mysql');
const db = mysql.createConnection({
    host:       'localhost',
    user:       'chatbookservice1',
    password:   'shikangzhi',
    database:   'schema1',
});

db.connect((err) => {
    if (err) {
        console.error('Error: fail to connect to database: ' + err.stack);
        process.exit(1);
    }
    console.log('Connected to database as id: ' + db.threadId);
});

module.exports = db;