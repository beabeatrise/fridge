//moduli
const express = require("express");
const session = require("express-session");
const sqlite3 = require("sqlite3").verbose();
const app = express();

//css, js, atteli
app.use(express.static('public'));
//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//sesijas
app.use(
  session({
    secret: "fridge", 
    resave: false,
    saveUninitialized: false,
  })
);

//savienojums ar datubazi
const db = new sqlite3.Database("./users.db", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the users database.");
});

//izmanto ejs
app.set("view engine", "ejs");
app.use(express.static("public"));
//autentifikacija
function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.redirect("/");
  }
}

//logij
app.get("/", (req, res) => {
  res.render("login", { error: null });
});
//signup
app.get("/signup", (req, res) => {
  res.render("signup", { error: null, formData: null });
});

//pieteiksanas
app.post("/logindone", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    
    db.get('SELECT * FROM dati WHERE email = ?', [email], (err, row) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal server error');
        } else if (!row) {
            res.render("login", { error: "E-MAIL NOT FOUND" });
        } else {
         
            bcrypt.compare(password, row.password, (err, result) => {
                if (err) {
                    console.error(err.message);
                    return res.status(500).send("Internal server error");
                }
                if (result) {
                    
                    req.session.userId = row.id;
                    res.redirect("/index");
                } else {
                    res.render("login", { error: "WRONG PASSWORD" });
                }
            });
        }
    });
});


const bcrypt = require('bcrypt');

//reģistrācija
app.post("/register", (req, res) => {
    const data = req.body;
    console.log(data);

    if (data.password !== data.repeat_password) {
        return res.render("signup", { error: "PASSWORDS DO NOT MATCH", formData: data });
    }

    
    db.get("SELECT * FROM dati WHERE email = ?", [data.email], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send("Internal server error");
        } else if (row) {
            return res.render("signup", { error: "E-MAIL IS ALREADY TAKEN", formData: data });
        } else {
            
            bcrypt.hash(data.password, 10, (err, hashedPassword) => {
                if (err) {
                    console.error(err.message);
                    return res.status(500).send("Internal server error");
                }
                const sql = 'INSERT INTO dati(firstname, email, password) VALUES (?, ?, ?)';
                db.run(sql, [data.firstname, data.email, hashedPassword], function (err) {
                    if (err) {
                        console.error(err.message);
                        return res.status(500).send("Internal server error");
                    } else {
                        res.redirect("/");
                    }
                });
            });
        }
    });
});

//iziešana
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});
//ledusskapja skats
app.get("/index", isAuthenticated, (req, res) => {
  res.render("index", {error:null});
});

// api lietotaja produkti
app.get("/api/fridge-products", isAuthenticated, (req, res) => {
  const userId = req.session.userId;
  const sql = "SELECT * FROM fridge_products WHERE user_id = ?";
  db.all(sql, [userId], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.json(rows);
    }
  });
});
//iegust produktu
app.get('/api/products', async (req, res) => {
  try {
      const products = await db.all("SELECT id, name, icon FROM products");
      res.json(products);
  } catch (error) {
      res.status(500).json({ error: "Database error" });
  }
});
//ievieno produktus
app.post("/api/fridge-products", isAuthenticated, (req, res) => {
  const userId = req.session.userId;
  const { productName, expiryDate, quantity, category, icon, notes } = req.body;

  if (!productName || !expiryDate || !quantity || !category || !icon) {
    return res.status(400).json({ error: "PLEASE FILL OUT PRODUCT NAME, EXPIRY DATE, QUANTITY, CATGEORY AND ICON" });
  }

  const sql =
    "INSERT INTO fridge_products (user_id, product_name, expiry_date, quantity, category, icon, notes) VALUES (?, ?, ?, ?, ?, ?, ?)";
  db.run(sql, [userId, productName, expiryDate, quantity, category, icon, notes], function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.status(201).json({
        id: this.lastID,
        user_id: userId,
        product_name: productName,
        expiry_date: expiryDate,
        quantity,
        category,
        icon,
        notes,
      });
    }
  });
});

//dzeš
app.delete("/api/fridge-products/:id", isAuthenticated, (req, res) => {
  const userId = req.session.userId;
  const productId = req.params.id;

  
  const sqlCheck = "SELECT * FROM fridge_products WHERE id = ? AND user_id = ?";
  db.get(sqlCheck, [productId, userId], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: "Internal server error" });
    } else if (!row) {
      return res.status(404).json({ error: "PRODUCT NOT FOUND" });
    } else {
      const sqlDelete = "DELETE FROM fridge_products WHERE id = ?";
      db.run(sqlDelete, [productId], function (err) {
        if (err) {
          console.error(err.message);
          res.status(500).json({ error: "Internal server error" });
        } else {
          res.status(204).send();
        }
      });
    }
  });
});
//serveris
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});