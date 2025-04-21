const item = require('../models/item');
//Check if User is guest
exports.isGuest = (req, res, next) => {
    if (!req.session.user) 
        { return next();}
    else{
        req.flash('error', 'You are already logged in');
        return res.redirect('/users/profile');
    }
};

//Check if user is authenticated
exports.isLoggedIn = (req, res, next) => {
    if (req.session.user) 
        { return next();}
    else{
        req.flash('error', 'You need to login first');
        return res.redirect('/users/login');
    }
};

//Check if user is seller of item
exports.isSeller = (req, res, next) => {
    let id = req.params.id;
    
    item.findById(id)
    .then(item => {
        if (item) {
            if (item.seller == req.session.user) {
                return next();
            } else {
                let err = new Error('Unauthorized to access the resource');
                err.status = 401;
                return next(err);
            }
        } else {
            let err = new Error('Cannot find a item with id ' + id);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
};
