const Item = require('../models/item');
exports.getAllItems = async (req, res, next) => {
    Item.find().sort({price: 1})
        .then(items => {
            res.render('item/index', { items });
        })
        .catch(err => {
            next(err);
        });
};


exports.searchItems = (req, res, next) => {
    const query = req.query.q;

    if (!query) {
        return res.redirect('/items');
    }

    Item.find({
        $or: [
            { title: { $regex: query, $options: 'i' } },
            { details: { $regex: query, $options: 'i' } }
        ]
    })
        .then(items => {
            if (items.length === 0) {
                const error = new Error('No items found for your search.');
                error.status = 500; 
                return next(error); 
            }
            res.render('item/index', { items });
        })
        .catch(err => next(err)); 
};


exports.getNewItemForm = (req, res) => {
    res.render('item/new', (err, html) => {
        if (err) {
            return res.status(500).send("Failed to render form."); // or use next(err) if using centralized error handler
        }
        res.send(html);
    });
};

exports.createItem = async (req, res, next) => {
    const { title, price, name, condition, details } = req.body;
    const seller = req.session.user;

    if (!title || !seller || !price || !condition || !details) {
        return res.status(400).json({ error: "Missing required fields in request body." });
    }

    const image = req.file ? req.file.filename : 'default.png';
    const newItem = new Item({ title, condition,name, price, seller, details, image });

    newItem.save()
    .then(() => res.redirect("/items"))
    .catch(err => {
        if(err.name === 'ValidationError'){
            err.status = 400;
        }
        next(err)
    });
};


exports.getItemDetails = async (req, res) => {
    Item.findById(req.params.id).populate('seller', 'firstName lastName')
        .then(item => {
            if (item) {
                res.render('item/show', { item });
            } else {
                res.status(404).send("Item not found.");
            }
        })
        .catch(err => next(err));
};

exports.getEditItemForm = async (req, res) => {
    Item.findById(req.params.id)
        .then(item => {
            if (item) {
                res.render('item/edit', { item });
            } else {
                res.status(404).send("Item not found.");
            }
        })
        .catch(err => next(err));
};

exports.updateItem = async (req, res) => {
    let updatedItem = req.body;
    if (req.file) {
        updatedItem.image = req.file.filename;
    }

    Item.findByIdAndUpdate(req.params.id, updatedItem, { new: true, useFindAndModify: false, runValidators: true })
        .then(result => {
            if (result) {
                res.redirect(`/items/${req.params.id}`);
            } else {
                res.status(404).send("Item not found.");
            }
        })
        .catch(err => {
            if(err.name === 'ValidationError')
                err.status = 400;
            next(err)
        });
};


exports.deleteItem = async (req, res) => {
    Item.findByIdAndDelete(req.params.id, {useFindAndModify: false})
        .then(result => {
            if (result) {
                res.redirect('/items');
            } else {
                res.status(404).send("item could not be found");
            }
        })
        .catch(err => next(err));
};
