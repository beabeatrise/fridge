const sqlite3 = require('sqlite3').verbose();

// Pieslēdzamies datubāzei (aizstāj "products.db" ar savu faila nosaukumu)
const db = new sqlite3.Database('users.db', (err) => {
    if (err) {
        return console.error('Error opening database:', err.message);
    }
    console.log('Connected to the database.');
});

// Atlasa visus datus no tabulas "dati"
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
// Aizveram savienojumu ar datubāzi
db.close((err) => {
    if (err) {
        return console.error('Error closing database:', err.message);
    }
    console.log('Database connection closed.');
});