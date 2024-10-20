const express = require('express');
const session = require('express-session');
const mysql = require('mysql');
const app = express();
const database = require('./mysql');
const axios = require('axios');
const bcrypt = require('bcrypt');
const port = 80;

const adminMiddleware = require('./middleware/admin');

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
        const username = req.session.username;
        
        database.query('SELECT isAdmin FROM users WHERE name = ?', [username], (error, results) => {
            if (error) throw error;
            req.session.isAdmin = results.length > 0 ? results[0].isAdmin : 0;
            res.render('dashboard', { 
                username: username,
                isAdmin: req.session.isAdmin
            });
        });
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
        req.session.username = username;
        req.session.isAdmin = user.isAdmin;
        res.redirect("/dashboard");
    } catch (error) {
        console.error("Error:", error);
        req.session.errorMessage = 'An error occurred. Please try again.';
        return res.redirect("/login");
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return console.log(err);
        }
        res.redirect('/login');
    });
});

/////////////////////////////////////////////////////////////ADMIN

app.get('/admin', adminMiddleware, (req, res) => {
    database.query('SELECT * FROM users', (err, users) => {
        if (err) {
            console.error('Error fetching users:', err);
            res.status(500).send('Internal Server Error. Please try reloading page.');
            return;
        }

        database.query('SELECT * FROM plans', (err, plans) => {
            if (err) {
                console.error('Error fetching plans:', err);
                res.status(500).send('Internal Server Error. Please try reloading page.');
                return;
            }

            database.query('SELECT title, content, created_at, id FROM news ORDER BY created_at DESC', (err, news) => {
                if (err) {
                    console.error('Error fetching news:', err);
                    res.status(500).send('Internal Server Error. Please try reloading page.');
                    return;
                }

                database.query('SELECT * FROM apis', (err, apis) => {
                    if (err) {
                        console.error('Error fetching APIs:', err);
                        res.status(500).send('Internal Server Error. Please try reloading page.');
                        return;
                    }

                    database.query('SELECT * FROM blacklist', (err, blacklist) => {
                        if (err) {
                            console.error('Error fetching blacklist:', err);
                            res.status(500).send('Internal Server Error. Please try reloading page.');
                            return;
                        }

                        database.query('SELECT * FROM port_blacklist', (err, portBlacklist) => {
                            if (err) {
                                console.error('Error fetching port blacklist:', err);
                                res.status(500).send('Internal Server Error. Please try reloading page.');
                                return;
                            }

                            database.query('SELECT * FROM slots', (err, methods) => {
                                if (err) {
                                    console.error('Error fetching slots methods:', err);
                                    res.status(500).send('Internal Server Error. Please try reloading page.');
                                    return;
                                }

                                database.query('SELECT * FROM redeem_codes', (err, redeemCodes) => {
                                    if (err) {
                                        console.error('Error fetching redeem codes:', err);
                                        res.status(500).send('Internal Server Error. Please try reloading page.');
                                        return;
                                    }

                                    database.query('SELECT setting_value FROM settings WHERE setting_name = ?', ['totalServers'], (err, settingsResults) => {
                                        if (err) {
                                            console.error('Error fetching settings:', err);
                                            res.status(500).send('Internal Server Error. Please try reloading page.');
                                            return;
                                        }

                                        const totalServers = settingsResults.length > 0 ? settingsResults[0].setting_value : '0';

                                        database.query('SELECT * FROM banned_users', (err, bannedUsers) => {
                                            if (err) {
                                                console.error('Error fetching banned users:', err);
                                                res.status(500).send('Internal Server Error. Please try reloading page.');
                                                return;
                                            }


                                            database.query('SELECT * FROM banned_ips', (err, bannedIPUsers) => {
                                                if (err) {
                                                    console.error('Error fetching banned IPs:', err);
                                                    res.status(500).send('Internal Server Error. Please try reloading page.');
                                                    return;
                                                }

                                                res.render('admin', {
                                                    username: req.session.username,
                                                    users: users,
                                                    plans: plans,
                                                    news: news,
                                                    apis: apis,
                                                    methods: methods,
                                                    portBlacklist: portBlacklist,
                                                    blacklist: blacklist,
                                                    redeemCodes: redeemCodes,
                                                    totalServers: totalServers,
                                                    bannedUsers: bannedUsers,
                                                    bannedIPUsers: bannedIPUsers,
                                                    successMessage: req.session.successMessage,
                                                    errorMessage: req.session.errorMessage
                                                });

                                                req.session.successMessage = null;
                                                req.session.errorMessage = null;
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

app.post('/admin/add-port-blacklist', (req, res) => {
    const { port } = req.body;
    database.query('INSERT INTO port_blacklist (port) VALUES (?)', [port], (err) => {
        if (err) {
            console.error("Database insert error (port_blacklist):", err);
            req.session.errorMessage = 'Failed to add port to blacklist';
        } else {
            req.session.successMessage = 'Port added to blacklist';
        }
        res.redirect('/admin');
    });
});

app.post('/admin/delete-port-blacklist', (req, res) => {
    const { id } = req.body;
    database.query('DELETE FROM port_blacklist WHERE id = ?', [id], (err) => {
        if (err) {
            console.error("Database delete error (port_blacklist):", err);
            req.session.errorMessage = 'Failed to remove port from blacklist';
        } else {
            req.session.successMessage = 'Port removed from blacklist';
        }
        res.redirect('/admin');
    });
});

app.post('/admin/add-blacklist', (req, res) => {
    const { url } = req.body;
    database.query('INSERT INTO blacklist (url) VALUES (?)', [url], (err) => {
        if (err) {
            console.error("Database insert error (blacklist):", err);
            req.session.errorMessage = 'Failed to add URL to blacklist';
        } else {
            req.session.successMessage = 'URL added to blacklist';
        }
        res.redirect('/admin');
    });
});

app.post('/admin/delete-blacklist', (req, res) => {
    const { id } = req.body;
    database.query('DELETE FROM blacklist WHERE id = ?', [id], (err) => {
        if (err) {
            console.error("Database delete error (blacklist):", err);
            req.session.errorMessage = 'Failed to remove URL from blacklist';
        } else {
            req.session.successMessage = 'URL removed from blacklist';
        }
        res.redirect('/admin');
    });
});

app.post('/admin/news', (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).render('admin', {
            errorMessage: 'Title and content are required.',
            successMessage: null,
            username: req.session.username,
            users: [],
            plans: [],
            apis: [],
            news: []
        });
    }
    const query = 'INSERT INTO news (title, content, created_at) VALUES (?, ?, NOW())';
    database.query(query, [title, content], (error, results) => {
        if (error) {
            console.error('Error inserting news:', error);
            return res.status(500).render('admin', {
                errorMessage: 'Failed to add news.',
                successMessage: null,
                username: req.session.username,
                users: [],
                plans: [],
                apis: [],
                news: []
            });
        }

        database.query('SELECT * FROM news ORDER BY created_at DESC', (err, news) => {
            if (err) {
                console.error('Error fetching news:', err);
                return res.status(500).render('admin', {
                    errorMessage: 'Failed to fetch news.',
                    successMessage: null,
                    username: req.session.username,
                    users: [],
                    plans: [],
                    apis: [],
                    news: []
                });
            }

            database.query('SELECT * FROM users', (err, users) => {
                if (err) {
                    console.error('Error fetching users:', err);
                    return res.status(500).render('admin', {
                        errorMessage: 'Failed to fetch users.',
                        successMessage: null,
                        username: req.session.username,
                        users: [],
                        plans: [],
                        apis: [],
                        news: news
                    });
                }

                database.query('SELECT * FROM plans', (err, plans) => {
                    if (err) {
                        console.error('Error fetching plans:', err);
                        return res.status(500).render('admin', {
                            errorMessage: 'Failed to fetch plans.',
                            successMessage: null,
                            username: req.session.username,
                            users: users,
                            plans: [],
                            apis: [],
                            news: news
                        });
                    }
                    res.render('admin', {
                        username: req.session.username,
                        users: users,
                        plans: plans,
                        news: news,
                        apis: [],
                        successMessage: 'News added successfully!',
                        errorMessage: null
                    });
                });
            });
        });
    });
});

app.post('/admin/delete-news', (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).render('admin', {
            errorMessage: 'News ID is required for deletion.',
            successMessage: null,
            username: req.session.username,
            news: []
        });
    }

    const query = 'DELETE FROM news WHERE id = ?';
    database.query(query, [id], (error) => {
        if (error) {
            console.error('Error deleting news:', error);
            return res.status(500).render('admin', {
                errorMessage: 'Failed to delete news.',
                successMessage: null,
                username: req.session.username,
                news: []
            });
        }

        database.query('SELECT * FROM news ORDER BY created_at DESC', (err, news) => {
            if (err) {
                console.error('Error fetching news:', err);
                return res.status(500).render('admin', {
                    errorMessage: 'Failed to fetch news.',
                    successMessage: null,
                    username: req.session.username,
                    news: []
                });
            }

            res.render('admin', {
                username: req.session.username,
                news: news,
                apis: [],
                successMessage: 'News deleted successfully!',
                errorMessage: null
            });
        });
    });
});

app.post('/admin/generate-redeem-code', (req, res) => {
    const { planName } = req.body;
    
    if (!planName) {
        req.session.errorMessage = 'Plan name is required';
        return res.redirect('/admin');
    }

    const code = generateRedeemCode(); 

    database.query('INSERT INTO redeem_codes (code, plan_name, created_at) VALUES (?, ?, NOW())', [code, planName], (err, result) => {
        if (err) {
            console.error('Error generating redeem code:', err);
            req.session.errorMessage = `Failed to generate redeem code for plan: ${planName}`;
        } else {
            req.session.successMessage = `Successfully generated redeem code for plan: ${planName}`;
        }
        res.redirect('/admin');
    });
});

function generateRedeemCode() {
    return 'xxxxxxxx-xxxxxxxx'.replace(/x/g, () => (Math.random() * 36 | 0).toString(36).toUpperCase());
}

app.post('/delete-redeem-code/:id', (req, res) => {
    const codeId = req.params.id;

    database.query('DELETE FROM redeem_codes WHERE id = ?', [codeId], (err, result) => {
        if (err) {
            console.error('Error deleting redeem code:', err);
            req.session.errorMessage = 'Failed to delete redeem code';
        } else {
            req.session.successMessage = 'Successfully deleted redeem code';
        }
        res.redirect('/admin');
    });
});

app.post('/admin/add-method', (req, res) => {
    const methodName = req.body.method;
    const category = req.body.category;
    const maxSlots = req.body.max_slots;
    const vipMethods = req.body.vip_methods;
    const layer = req.body.layer;


    if (!methodName || !maxSlots || !category || !vipMethods || !layer) {
        req.session.errorMessage = 'All required fields must be filled.';
        return res.redirect('/admin'); 
    }


    const query = `
        INSERT INTO slots (method, category, max_slots, vip_methods, layer)
        VALUES (?, ?, ?, ?, ?)
    `;


    database.query(query, [methodName, category, maxSlots, vipMethods, layer], (err, results) => {
        if (err) {
            req.session.errorMessage = 'Failed to add method. Please try again.';
            console.error(err); 
            return res.redirect('/admin'); 
        }

        req.session.successMessage = 'Method added successfully!';
        res.redirect('/admin'); 
    });
});


app.post('/admin/update-method', (req, res) => {
    const methodId = req.body.methodId; 
    const methodName = req.body.methodName; 
    const methodCategory = req.body.methodCategory; 
    const maxSlots = req.body.max_slots;
    const vipMethods = req.body.vip_methods;
    const layer = req.body.layer;

    if (!methodId || !methodName || !methodCategory || !maxSlots || !vipMethods || !layer) {
        req.session.errorMessage = 'All fields are required.';
        return res.redirect('/admin'); 
    }

    const query = `
        UPDATE slots
        SET method = ?, category = ?, max_slots = ?, vip_methods = ?, layer = ?
        WHERE id = ?
    `;
    database.query(query, [methodName, methodCategory, maxSlots, vipMethods, layer, methodId], (err, results) => {
        if (err) {
            req.session.errorMessage = 'Failed to update method. Please try again.';
            console.error(err); 
            return res.redirect('/admin'); 
        }

        req.session.successMessage = 'Method updated successfully!';
        res.redirect('/admin'); 
       
        database.query('SELECT * FROM slots', (err, methods) => {
            if (err) {
                req.session.errorMessage = 'Failed to fetch methods.';
                return res.redirect('/admin');
            }
         
            
        });
    });
});

app.post('/admin/delete-method', (req, res) => {
    const methodId = req.body.methodId;

    if (!methodId) {
        req.session.errorMessage = 'Method ID is required.';
        return res.redirect('/admin');
    }

    const query = 'DELETE FROM slots WHERE id = ?';
    database.query(query, [methodId], (err, results) => {
        if (err) {
            req.session.errorMessage = 'Failed to delete method. Please try again.';
            console.error(err); 
            return res.redirect('/admin'); 
        }

        req.session.successMessage = 'Method deleted successfully!';
        res.redirect('/admin'); 

        database.query('SELECT * FROM slots', (err, methods) => {
            if (err) {
                req.session.errorMessage = 'Failed to fetch methods.';
                return res.redirect('/admin');
            }
            
            
        });
    });
});

app.post('/admin/add-api', adminMiddleware, (req, res) => {
    const { id, api_name, username, password, base_url } = req.body;

    if (!api_name || !username || !password || !base_url) {
        req.session.errorMessage = 'All fields are required.';
        return res.redirect('/admin');
    }


    database.query('SELECT * FROM apis WHERE api_name = ?', [api_name], (err, results) => {
        if (err) {
            console.error('Error checking API existence:', err);
            req.session.errorMessage = 'Failed to check API existence.';
            return res.redirect('/admin');
        }

        if (results.length > 0) {

            const existingApi = results[0];
            const apiId = existingApi.id;

            database.query('UPDATE apis SET username = ?, password = ?, base_url = ? WHERE id = ?', [username, password, base_url, apiId], (err) => {
                if (err) {
                    console.error('Error updating API:', err);
                    req.session.errorMessage = 'Failed to update API.';
                } else {
                    req.session.successMessage = 'API updated successfully!';
                }
                res.redirect('/admin');
            });
        } else {

            database.query('INSERT INTO apis (api_name, username, password, base_url) VALUES (?, ?, ?, ?)', [api_name, username, password, base_url], (err) => {
                if (err) {
                    console.error('Error adding API:', err);
                    req.session.errorMessage = 'Failed to add API.';
                } else {
                    req.session.successMessage = 'API added successfully!';
                }
                res.redirect('/admin');
            });
        }
    });
});

app.post('/admin/delete-api', adminMiddleware, (req, res) => {
    const { id } = req.body;

    if (!id) {
        req.session.errorMessage = 'API ID is required for deletion.';
        return res.redirect('/admin');
    }

    database.query('DELETE FROM apis WHERE id = ?', [id], (err) => {
        if (err) {
            console.error('Error deleting API:', err);
            req.session.errorMessage = 'Failed to delete API.';
        } else {
            req.session.successMessage = 'API deleted successfully!';
        }
        res.redirect('/admin');
    });
});

app.post('/admin/settings', adminMiddleware, (req, res) => {
    const { totalServers } = req.body;

    const queries = [
        { name: 'totalServers', value: totalServers }
    ];

    let errorOccurred = false;

    queries.forEach(query => {
        const updateQuery = `
            INSERT INTO settings (setting_name, setting_value)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE
            setting_value = VALUES(setting_value)
        `;
        database.query(updateQuery, [query.name, query.value], (err) => {
            if (err) {
                console.error('Database update error:', err.message);
                errorOccurred = true;
            }
        });
    });

    if (errorOccurred) {
        req.session.errorMessage = 'Failed to update Total Servers';
    } else {
        req.session.successMessage = 'Successfully updated Total Servers';
    }

    res.redirect('/admin');
});

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
