// middlewares/validator.js
const {body} = require('express-validator');
const {validationResult} = require('express-validator');
const mongoose = require('mongoose');

exports.validateId = (req, res, next) => {
    const id = req.params.id;
    if (mongoose.Types.ObjectId.isValid(id)) {
        return next();
    } else {
        let err = new Error('Invalid item id');
        err.status = 400;
        return next(err);
    }
};

exports.validateSignUp = [body('firstName', 'First name cannot be empty').notEmpty().trim().escape(),
    body('lastName', 'Last name cannot be empty').notEmpty().trim().escape(),
    body('email','Email must be a valid email address').isEmail().trim().escape().normalizeEmail(),
    body('password','Password must be at least 8 characters and at most 64 characters' ).isLength({min: 8, max: 64})];

exports.validateLogIn = [body('email', 'Email must be a valid email address').isEmail().trim().escape().normalizeEmail(),
    body('password','Password must be at least 8 characters and at most 64 characters' ).isLength({min: 8, max: 64})];

    exports.validateResult = (req, res, next) => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg);
    
            if (req.originalUrl.startsWith('/items')) {
                return res.render('item/new', {
                    errorMessages,
                    successMessages: [],
                    oldInput: req.body
                });
            }
    
            return res.redirect('back');
        }
    
        return next();
    };
    
    

exports.validateItem = [
    body('title', 'Title cannot be empty')
        .notEmpty()
        .trim()
        .escape(),
    body('name', 'Name must be at least 3 characters')
        .isLength({ min: 3 })
        .trim()
        .escape(),
    body('details', 'Details must be at least 5 characters')
        .isLength({ min: 5 })
        .trim()
        .escape(),
    body('price', 'Price must be a valid amount (e.g. 9.99)')
        .trim()
        .escape()
        .isCurrency({ allow_negatives: false, min: 0.01 }),
    body('condition', 'Condition must be one of: New, Used, Refurbished')
        .isIn(['New', 'Used', 'Refurbished'])
        .trim()
        .escape()
];


exports.validateOffer = [
    body('amount', 'Offer amount must be a valid currency and at least $0.01')
      .trim()
      .escape()
      .isCurrency({ allow_negatives: false, min: 0.01 })
  ];

  exports.validateItemResult = (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        return res.render('item/new', {
            errorMessages,
            successMessages: [],
            oldInput: req.body
        });
    }
    return next();
};
