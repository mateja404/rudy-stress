const express = require('express');
const session = require('express-session');
const mysql = require('mysql');
const app = express();
const database = require('./mysql');
const axios = require('axios');
const bcrypt = require('bcrypt');
const port = 90;

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(session({
    secret: "miroljub",
    resave: true,
    saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    if (req.originalUrl === '/') {
        res.redirect('/login');
    } else {
        next();
    }
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/dashboard', (req, res) => {
    if (req.session.logged) {
        res.render('dashboard');
    } else {
        res.redirect('/login');
    }
});

app.get('/panel', (req, res) => {
    if (req.session.logged) {
        res.render('panel');
    } else {
        res.redirect('/login');
    }
});

app.post('/register', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    try {
        const hash = await bcrypt.hash(password, 10)
        database.query("INSERT INTO `users`(`name`, `password`) VALUES (?, ?)", [username, hash], function (error, results) {
            if (error) {
                console.error('Error logging in:', error);
                req.session.errorMessage = 'Login failed';
                return res.redirect("/login");
            } else {
                return res.redirect("/login");
            }
        });
    } catch (error) {
            console.error('Error:', error);
            req.session.errorMessage = 'Internal Server Error. Please try reloading page.';
            return res.redirect("/");
        }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const results = await new Promise((resolve, reject) => {
            database.query("SELECT * FROM `users` WHERE `name` = ?", [username], (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });

        if (results.length === 0) {
            req.session.errorMessage = 'Invalid username or password.';
            return res.redirect("/login");
        }

        const user = results[0];

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            req.session.errorMessage = 'Invalid username or password.';
            return res.redirect("/login");
        }

        req.session.logged = true;
        res.redirect("/dashboard");

    } catch (error) {
        console.error("Error:", error);
        req.session.errorMessage = 'An error occurred. Please try again.';
        return res.redirect("/login");
    }
});

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
