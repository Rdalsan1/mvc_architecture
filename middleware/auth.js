const item = require('../models/item');

exports.isGuest = (req, res, next) => {
    if (!req.session.user) 
        { return next();}
    else{
        req.flash('error', 'You are already logged in');
        return res.redirect('/users/profile');
    }
};

exports.isLoggedIn = (req, res, next) => {
    if (req.session.user) 
        { 
            return next();}
    else{
        req.flash('error', 'You need to login first');
        return res.redirect('/users/login');
    }
};

exports.isSeller = (req, res, next) => {
    const itemId = req.params.id;
    const sessionUser = req.session.user;

    if (!sessionUser || !sessionUser._id) {
        const err = new Error('User not authenticated');
        err.status = 401;
        return next(err);
    }

    item.findById(itemId)
        .then(item => {
            if (!item) {
                const err = new Error('Item not found');
                err.status = 404;
                return next(err);
            }

            const itemSeller = item.seller.toString();
            const currentUserId = sessionUser._id.toString();

            if (itemSeller === currentUserId) {
                return next();
            } else {
                const err = new Error('Unauthorized');
                err.status = 401;
                return next(err);
            }
        })
        .catch(err => {
            next(err);
        });
};

exports.isItemOwner = (req, res, next) => {
    const itemId = req.params.id;
    const user = req.session.user;

    if (!user || !user._id) {
        req.flash('error', 'You must be logged in to view this item.');
        return res.redirect('/users/login');
    }

    item.findById(itemId).populate('seller')
        .then(item => {
            if (!item || item.seller._id.toString() !== user._id.toString()) {
                req.flash('error', 'Unauthorized access to this item.');
                return res.status(401).render('error', { error: '401 Unauthorized' });
            }
            next();
        })
        .catch(err => {
            console.error(err);
            res.status(500).render('error', { error: '500 Internal Server Error' });
        });
};
