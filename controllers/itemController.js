const Item = require('../models/item');

exports.getAllItems = async (req, res, next) => {
    Item.find()
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
                error.status = 404; 
                return next(error); 
            }
            res.render('item/index', { items });
        })
        .catch(err => next(err)); 
};


exports.getNewItemForm = (req, res) => {
    res.render('item/new');
};

exports.createItem = async (req, res, next) => {
    const { title, seller, price, condition, details } = req.body;
    const image = req.file ? req.file.filename : 'default.png';

    const newItem = new Item({ title, condition, price, seller, details, image });

    newItem.save()
        .then(() => res.redirect("/items"))
        .catch(err => next(err));
};


exports.getItemDetails = async (req, res) => {
    Item.findById(req.params.id)
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

    Item.findByIdAndUpdate(req.params.id, updatedItem, { new: true })
        .then(result => {
            if (result) {
                res.redirect(`/items/${req.params.id}`);
            } else {
                res.status(404).send("Item not found.");
            }
        })
        .catch(err => next(err));
};


exports.deleteItem = async (req, res) => {
    Item.findByIdAndDelete(req.params.id)
        .then(result => {
            if (result) {
                res.redirect('/items');
            } else {
                res.status(404).send("item could not be found");
            }
        })
        .catch(err => next(err));
};
