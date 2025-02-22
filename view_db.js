const sqlite3 = require('sqlite3').verbose();


const db = new sqlite3.Database('users.db', (err) => {
    if (err) {
        return console.error('Error opening database:', err.message);
    }
    console.log('Connected to the database.');
});


db.all('SELECT * FROM dati', [], (err, rows) => {
    if (err) {
        return console.error('Error fetching data:', err.message);
    }
    console.log('Database contents:', rows);
});
db.all('SELECT * FROM fridge_products', [], (err, rows) => {
    if (err) {
        return console.error('Error fetching data:', err.message);
    }
    console.log('Database contents:', rows);
});

db.close((err) => {
    if (err) {
        return console.error('Error closing database:', err.message);
    }
    console.log('Database connection closed.');
});