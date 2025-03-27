const express = require('express');
const app = express();
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan');
const path = require('path');


app.use(express.urlencoded({ extended: true })); 
app.use(express.json()); 
app.use(morgan('tiny'));
app.use(methodOverride('_method')); 
app.use(express.static(path.join(__dirname, 'public'))); 

const mongoUri = 'mongodb+srv://<username>:<password>@cluster0.dnv07.mongodb.net/<database>?retryWrites=true&w=majority';
let port = 3000;
let host = 'localhost';

mongoose.connect(mongoUri)
.then(() => {
    app.listen(port, host, () =>{ 
        console.log(`Server running on port`, port);
    }); 
})
.catch((err) => {
    console.log(err.message);
});
// View Engine
app.set('view engine', 'ejs');

const itemRoutes = require('./routes/itemRoutes');

app.get('/' , (req, res) => {
    res.render('index');
})
// Routes
app.use('/items', itemRoutes);

// Error Handling
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
