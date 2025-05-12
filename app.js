//require modules
const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const itemRoutes = require('./routes/itemRoutes');
const userRoutes = require('./routes/userRoutes');
const offerRoutes = require('./routes/offerRoutes');
const path = require('path');


const app = express();

let port = 3000;
let host = 'localhost';
app.set('view engine', 'ejs');

mongoose.connect('mongodb+srv://rdalsan1:RajDa!2004@cluster0.dnv07.mongodb.net/project3?retryWrites=true&w=majority')
.then(() => {
    app.listen(port, host, () =>{ 
        console.log(`Server running on port`, port);
    }); 
})
.catch((err) => {
    console.log(err.message);
});

app.use(
    session({
        secret: "ajfeirf90aeu9eroejfoefj",
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({mongoUrl: 'mongodb+srv://rdalsan1:RajDa!2004@cluster0.dnv07.mongodb.net/project3?retryWrites=true&w=majority'}),
        cookie: {maxAge: 60*60*1000}
        })
);
app.use(flash());

app.use((req, res, next) => {
    //console.log(req.session);
    res.locals.user = req.session.user||null;
    res.locals.errorMessages = req.flash('error');
    res.locals.successMessages = req.flash('success');
    next();
});

app.use(express.urlencoded({ extended: true })); 
app.use(express.json()); 
app.use(morgan('tiny'));
app.use(methodOverride('_method')); 
app.use(express.static(path.join(__dirname, 'public'))); 

app.get('/' , (req, res) => {
    res.render('index');
})

app.use('/items', itemRoutes);
app.use('/users', userRoutes);
app.use('/offers', offerRoutes);

app.use((req, res, next) => {
    let err = new Error("The server was not found " + req.url + ". Try a different part of the page.");
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    if (!err.status) {
        err.status = 500;
        err.message = "Internal server error. Something went wrong.";
    }
    res.status(err.status);
    res.render('error', { error: err });
});
