const express = require('express');
const session = require('express-session');
const mysql = require('mysql');
const app = express();
const database = require('./mysql');
const axios = require('axios');
const bcrypt = require('bcrypt');
const port = 80;

const adminMiddleware = require('./middleware/admin');
const promoterMiddleware = require('./middleware/promoter');

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static("public"));
app.set('trust proxy', true);
app.set("view engine", 'ejs');
app.use(session({
    secret: "miroljub",
    resave: true,
    saveUninitialized: true
}));

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
        database.query('SELECT COUNT(*) AS totalUsers FROM users', (error, userResults) => {
            if (error) {
                throw error;
            }
            const totalUsers = userResults[0].totalUsers;
            const username = req.session.username;
            database.query('SELECT COUNT(*) AS totalAttacks FROM attacks', (error, attackResults) => {
                if (error) {
                    throw error;
                }
                const totalAttacks = attackResults[0].totalAttacks;
                database.query('SELECT setting_value FROM settings WHERE setting_name = ?', ['totalServers'], (err, settingsResults) => {
                    if (err) {
                        console.error('Error fetching settings:', err);
                        res.status(500).send('Internal Server Error. Please try reloading page.');
                        return;
                    }
                    const totalServers = settingsResults.length > 0 ? settingsResults[0].setting_value : '0';
                    database.query('SELECT title, content, created_at, id FROM news ORDER BY created_at DESC', (err, newsResults) => {
                        if (err) {
                            console.error('Error fetching news:', err);
                            res.status(500).send('Internal Server Error. Please try reloading page.');
                            return;
                        }
                        const news = newsResults;
                        database.query('SELECT isAdmin, isPromoter FROM users WHERE name = ?', [username], (error, results) => {
                            if (error) throw error;
                            req.session.isAdmin = results.length > 0 ? results[0].isAdmin : 0;
                            req.session.isPromoter = results.length > 0 ? results[0].isPromoter : 0;
                            res.render('dashboard', {
                                username: username,
                                isAdmin: req.session.isAdmin,
                                isPromoter: req.session.isPromoter,
                                totalUsers: totalUsers,
                                totalAttacks: totalAttacks,
                                totalServers: totalServers,
                                news: news
                            });
                        });
                    });
                });
            });
        });
    } else {
        res.redirect('/login');
    }
});

app.get('/api/dashboard-data', (req, res) => {
    if (req.session.logged) {
        database.query('SELECT COUNT(*) AS totalUsers FROM users', (error, userResults) => {
            if (error) {
                throw error;
            }
            const totalUsers = userResults[0].totalUsers;
            const username = req.session.username;

            database.query('SELECT COUNT(*) AS totalAttacks FROM attacks', (error, attackResults) => {
                if (error) {
                    throw error;
                }
                const totalAttacks = attackResults[0].totalAttacks;

                database.query('SELECT setting_value FROM settings WHERE setting_name = ?', ['totalServers'], (err, settingsResults) => {
                    if (err) {
                        console.error('Error fetching settings:', err);
                        res.status(500).send('Internal Server Error. Please try reloading page.');
                        return;
                    }
                    const totalServers = settingsResults.length > 0 ? settingsResults[0].setting_value : '0';
                    
                    res.json({
                        totalUsers: totalUsers,
                        totalAttacks: totalAttacks,
                        totalServers: totalServers
                    });
                });
            });
        });
    } else {
        res.status(401).send('Unauthorized');
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
        req.session.isPromoter = user.isPromoter; // Dodaj ovu liniju
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

app.get('/noaccess', (req, res) => {
    res.render('noaccess');
});

/////////////////////////////////////////////////////////////PROMOTER

app.get('/promoter', promoterMiddleware, (req, res) => {
    if (req.session.logged && req.session.isPromoter) {
        res.render('promoter', { isPromoter: req.session.isPromoter, username: req.session.username });
    } else {
        res.redirect('/noaccess');
    }
});

const imgbbApiKey = 'd3aacfaa24bfb9801f8a7caddef0fbc2';

async function uploadImageToImgBB(imageBuffer, title) {
    const formData = new URLSearchParams();
    formData.append('key', imgbbApiKey);
    formData.append('image', imageBuffer.toString('base64'));
    formData.append('name', title);

    const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData
    });
    const data = await response.json();
    return data;
}

app.post('/send-promotion', (req, res) => {
    const { type, link, title, username, additionalLink } = req.body;
    const now = new Date().getTime();
    const userIp = req.ip;

    if (!username || (type === 'youtube' && !link.trim()) || (type === 'image' && !title.trim())) {
        return res.json({ success: false, message: 'Required fields cannot be empty.' });
    }

    const lastPromotion = cooldowns[username];
    if (lastPromotion && now - lastPromotion < COOLDOWN_TIME) {
        const remainingTime = Math.ceil((COOLDOWN_TIME - (now - lastPromotion)) / 1000);
        return res.json({ success: false, message: `You must wait ${remainingTime} seconds before submitting again.` });
    }

    let message = '';

    if (type === 'youtube') {
        message += `**<a:celebrate:811878501594169364> New YouTube Link Submitted**\n`;
        message += `**<:promoter:1273056458354720819> Promoter:** ${username}\n`;
        message += `**<a:notu12:1045635332110037033> Title:** ${title}\n`;
        message += `**<:YouTube:1199423327639445655> YouTube Link:** ${link}\n`;
        if (additionalLink) {
            message += `**<:plus:1275559275082547363> Additional Link:** ${additionalLink}\n`;
        }
        const sql = `INSERT INTO promoters (username, last_promote_ip, title, media_link) VALUES (?, ?, ?, ?)`;
        database.query(sql, [username, userIp, title, link], (err, result) => {
            if (err) {
                console.error(err);
                return res.json({ success: false, message: 'Database error.' });
            }
            sendDiscordWebhook(message)
                .then(() => {
                    cooldowns[username] = now;
                    res.json({ success: true, message: 'YouTube link successfully sent.' });
                })
                .catch(error => {
                    console.error('Webhook error:', error);
                    res.json({ success: false, message: 'Failed to send Discord webhook.' });
                });
        });
    } else if (type === 'image') {
        const imageBuffer = Buffer.from(req.body.image, 'base64');
        uploadImageToImgBB(imageBuffer, title)
            .then(response => {
                const imageUrl = response.data.url;
                message += `**<a:celebrate:811878501594169364> New Image/GIF Uploaded**\n`;
                message += `**<:promoter:1273056458354720819> Promoter:** ${username}\n`;
                message += `<a:notu12:1045635332110037033> ${title}\n`;
                message += `**🖼️ Image URL:** ${imageUrl}\n`;
                if (additionalLink) {
                    message += `**<:plus:1275559275082547363> Additional Link:** ${additionalLink}\n`;
                }
                const sql = `INSERT INTO promoters (username, last_promote_ip, title, media_link) VALUES (?, ?, ?, ?)`;
                database.query(sql, [username, userIp, title, imageUrl], (err, result) => {
                    if (err) {
                        console.error(err);
                        return res.json({ success: false, message: 'Database error.' });
                    }
                    sendDiscordWebhook(message)
                        .then(() => {
                            cooldowns[username] = now;
                            res.json({ success: true, message: 'Image/GIF successfully uploaded.' });
                        })
                        .catch(error => {
                            console.error('Webhook error:', error);
                            res.json({ success: false, message: 'Failed to send Discord webhook.' });
                        });
                });
            })
            .catch(error => {
                console.error('ImgBB error:', error);
                res.json({ success: false, message: 'Failed to upload image to ImgBB.' });
            });
    } else {
        res.json({ success: false, message: 'Invalid type.' });
    }
});

function sendDiscordWebhook(message) {
    const webhookUrl = 'https://discord.com/api/webhooks/1274773722753925120/xxh-W_F2VqvNyjWCVjEEipCnzri8QfVuKTJn5Oq4gJnLZROiH_WQd7iLvZMjffzDMWlU';
    return fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content: message
        })
    });
}

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
            redeemCodes: [],
            bannedUsers: [],
            methods: [],
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
                redeemCodes: [],
                bannedUsers: [],
                methods: [],
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
                    redeemCodes: [],
                    bannedUsers: [],
                    methods: [],
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
                        redeemCodes: [],
                        bannedUsers: [],
                        methods: [],
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
                            redeemCodes: [],
                            bannedUsers: [],
                            methods: [],
                            news: news
                        });
                    }
                    res.render('admin', {
                        username: req.session.username,
                        users: users,
                        plans: plans,
                        news: news,
                        redeemCodes: [],
                        bannedUsers: [],
                        apis: [],
                        methods: [],
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
            news: [],
            redeemCodes: [],
            bannedUsers: [],
            methods: [],
            plans: []
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
                news: [],
                redeemCodes: [],
                bannedUsers: [],
                methods: [],
                plans: []
            });
        }

        database.query('SELECT * FROM news ORDER BY created_at DESC', (err, news) => {
            if (err) {
                console.error('Error fetching news:', err);
                return res.status(500).render('admin', {
                    errorMessage: 'Failed to fetch news.',
                    successMessage: null,
                    username: req.session.username,
                    news: [],
                    plans: [],
                    bannedUsers: [],
                    methods: [],
                    redeemCodes: []
                });
            }

            res.render('admin', {
                username: req.session.username,
                news: news,
                apis: [],
                successMessage: 'News deleted successfully!',
                plans: [],
                redeemCodes: [],
                bannedUsers: [],
                methods: [],
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

app.post('/set-balance', adminMiddleware, (req, res) => {
    const { userId, balance } = req.body;

    database.query('UPDATE users SET balance = ? WHERE id = ?', [balance, userId], (err, result) => {
        if (err) {
            console.error('Error updating balance:', err);
            req.session.errorMessage = 'Failed to update balance';
        } else {
            console.log(`Successfully updated balance for user with ID ${userId} to ${balance}`);
            req.session.successMessage = 'Successfully updated balance';
        }

        setTimeout(() => {
            res.redirect('/admin');
        }, 3000);
    });
});

app.post('/set-promoter', adminMiddleware, (req, res) => {
    const { userId } = req.body;
    database.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error checking user:', err);
            req.session.errorMessage = 'Failed to set promoter';
            return res.redirect('/admin');
        }
        const user = results[0];
        if (!user) {
            req.session.errorMessage = 'User not found';
            return res.redirect('/admin');
        }
        if (user.isPromoter) {
            req.session.errorMessage = 'User is already a promoter';
            return res.redirect('/admin');
        }

        database.query('UPDATE users SET isPromoter = 1 WHERE id = ?', [userId], (err, result) => {
            if (err) {
                console.error('Error setting promoter:', err);
                req.session.errorMessage = 'Failed to set promoter';
            } else {
                console.log(`Successfully set promoter for user with ID ${userId}`);
                req.session.successMessage = `Successfully set promoter for user`;
            }
            setTimeout(() => {
                res.redirect('/admin');
            }, 3000);
        });
    });
});

app.post('/remove-promoter', adminMiddleware, (req, res) => {
    const { userId } = req.body;
    database.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error checking user:', err);
            req.session.errorMessage = 'Failed to remove promoter';
            return res.redirect('/admin');
        }
        const user = results[0];
        if (!user) {
            req.session.errorMessage = 'User not found';
            return res.redirect('/admin');
        }
        if (!user.isPromoter) {
            req.session.errorMessage = 'User is not a promoter';
            return res.redirect('/admin');
        }
        database.query('UPDATE users SET isPromoter = 0 WHERE id = ?', [userId], (err, result) => {
            if (err) {
                console.error('Error removing promoter:', err);
                req.session.errorMessage = 'Failed to remove promoter';
            } else {
                console.log(`Successfully removed promoter for user with ID ${userId}`);
                req.session.successMessage = `Successfully removed promoter for user`;
            }
            setTimeout(() => {
                res.redirect('/admin');
            }, 3000);
        });
    });
});

app.post('/set-plan', adminMiddleware, (req, res) => {
    const { userId, plan } = req.body;

    database.query('SELECT plan_name FROM plans WHERE id = ?', [plan], (err, rows) => {
        if (err) {
            console.error('Error fetching plan details:', err);
            req.session.errorMessage = 'Failed to update plan';
            return res.redirect('/admin');
        }

        if (rows.length === 0) {
            console.error('Plan with ID ' + plan + ' not found');
            req.session.errorMessage = 'Plan not found';
            return res.redirect('/admin');
        }

        const planName = rows[0].plan_name;

        database.query("UPDATE users SET plan = ?, expires_at = DATE_ADD(NOW(), INTERVAL 1 MONTH) WHERE id = ?", [planName, userId], (err, result) => {
            if (err) {
                console.error('Error updating plan:', err);
                req.session.errorMessage = 'Failed to update plan';
            } else {
                console.log(`Successfully updated plan for user with ID ${userId} to plan ${planName}`);
                req.session.successMessage = `Successfully updated plan to ${planName}`;
            }

            res.redirect('/admin');
        });
    });
});

///////////////////////////////////////////17.8.2K24 - IVKEBOYARA - SISTEM ZA OPŠTE SKIDANJE PLANOVA KADA PRODJE NJIHOVO VREME
setInterval(() => {
    database.query("UPDATE users SET plan = 'Free Plan' WHERE expires_at <= NOW() AND plan != 'Free Plan'", (err, result) => {
        if (err) {
            console.error('Error reverting plans to Free Plan:', err);
        } else if (result.affectedRows > 0) {
            console.log(`${result.affectedRows} userima je skinut plan na Free Plan, jer im je istekao isti.`);
        }
    });
}, 60000); // 60 sek


app.post('/remove-plan', (req, res) => {
    const userId = req.body.userId;

    if (!req.session.isAdmin) {
        return res.status(403).send('Access denied');
    }

    const query = 'UPDATE users SET plan = "Free Plan", expires_at = NULL WHERE id = ?';
    database.query(query, [userId], (error, results) => {
        if (error) {
            console.error('Error removing plan:', error);
            req.session.errorMessage = 'Failed to remove plan';
            return res.redirect('/admin');
        }

        req.session.successMessage = 'Plan successfully removed and set to Free Plan';
        res.redirect('/admin');
    });
});

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
