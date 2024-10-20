module.exports = (req, res, next) => {
    console.log('Admin Middleware:', req.session); 
    if (req.session.logged && req.session.isAdmin) {
        next();
    } else {
        res.redirect('/noaccess');
    }
};
