const rateLimit = require('express-rate-limit');

exports.logInLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5, 
    
    handler: (req, res, next) => {
        let err = newError('Too many login requests. Try again later');
        err.statusCode = 429;
        return next(err);
    }
});