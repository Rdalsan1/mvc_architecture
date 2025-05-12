const model = require('../models/user');
const item = require('../models/item');
const Offer = require('../models/offer');
exports.new = (req, res)=>{
    
        return res.render('./user/new');
};

exports.create = (req, res, next)=>{
    let user = new model(req.body);
    user.save()
    .then(user=> res.redirect('/users/login'))
    .catch(err=>{
        if(err.code === 11000) {
            req.flash('error', 'Email has been used');  
            return res.redirect('/users/new');
        }

        if(err.name === 'ValidationError' ) {
            req.flash('error', err.message);  
            return res.redirect('/users/new');
        }
        
        next(err);
    }); 

    
};

exports.getUserLogin = (req, res, next) => {
    
        return res.render('./user/login');
}

exports.login = (req, res, next)=>{

    let email = req.body.email;
    let password = req.body.password;
    model.findOne({ email: email })
    .then(user => {
        if (!user) {
            req.flash('error', 'wrong email address');  
            res.redirect('/users/login');
            } else {
            user.comparePassword(password)
            .then(result=>{
                if(result) {
                    req.session.user = {
                        _id: user._id.toString(),
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email
                    };
                      
                    req.flash('success', 'You have successfully logged in');
                    req.session.save(err => {
                        if (err) return next(err);
                        res.redirect('/users/profile');
                      });
            } else {
                req.flash('error', 'wrong password');      
                res.redirect('/users/login');
            }
            });     
        }     
    })
    .catch(err => next(err));

    
};

exports.profile = (req, res, next) => {
    const userId = req.session.user._id;

    Promise.all([
        model.findById(userId),
        item.find({ seller: userId }),
        Offer.find({ buyer: userId }).populate('item')
    ])
    .then(([userDoc, items, offersMade]) => {
        console.log('--- PROFILE DEBUG ---');
        console.log('Logged-in user:', userId);
        console.log('Offers made:', offersMade.map(o => ({
            amount: o.amount,
            item: o.item?.title || 'N/A',
            status: o.status
        })));

        res.render('./user/profile', {
            user: userDoc,
            items,
            offersMade,
            successMessages: req.flash('success'),
            errorMessages: req.flash('error')
        });
    })
    .catch(err => {
        console.error("Profile error:", err.stack);
        next(err);
    });
};


exports.logout = (req, res, next)=>{
    req.session.destroy(err=>{
        if(err) 
           return next(err);
       else
            res.redirect('/');  
    });
   
 };



