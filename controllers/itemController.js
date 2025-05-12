const Item = require('../models/item');
const Offer = require('../models/offer');
exports.getAllItems = async (req, res, next) => {
    Item.find({ active: true }).sort({ price: 1 }).populate('seller')
        .then(async items => {
            const itemsWithOffers = await Promise.all(items.map(async item => {
                const offerCount = await Offer.countDocuments({ item: item._id });
                return { ...item.toObject(), totalOffers: offerCount };
            }));

            res.render('item/index', { items: itemsWithOffers });
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
        errorMessages = [];
        successMessages = [];
        oldInput = {};
        if (err) {
            return next(err);
        }
        res.send(html);
    });
};

exports.createItem = async (req, res, next) => {
    const { title, price, name, condition, details } = req.body;
    const seller = req.session.user;
    const image = req.file ? req.file.filename : 'default.png';


    if (!title || !seller || !price || !condition || !details) {
        return res.status(400).send("Missing required fields");
    }

    const newItem = new Item({ title, price, name, condition, details, seller: seller._id || seller, image });

    newItem.save()
        .then(() => {
            req.flash('success', 'Item created successfully!');
            res.redirect("/items");
        })
        .catch(err => {
            if (err.name === 'ValidationError') {
                err.status = 400;
            }
            next(err);
        });
};



exports.getItemDetails = (req, res, next) => {
    Item.findById(req.params.id)
        .populate('seller', 'firstName lastName')
        .then(item => {
            if (!item) {
                const err = new Error("Item not found.");
                err.status = 404;
                throw err;
            }
            res.render('item/show', {
                item,
                user: req.session.user || null,
                successMessages: req.flash('success') || [],
                errorMessages: req.flash('error') || []
            });
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
                req.flash('success', 'Item updated successfully!');
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


exports.deleteItem = (req, res, next) => {
    const itemId = req.params.id;
   
    if (!itemId || itemId.length !== 24) {
        const err = new Error("Invalid item ID");
        err.status = 400;
        return next(err);
    }

    Promise.all([
        Offer.deleteMany({ item: itemId })
            .then(result => {
                return result;
            })
            .catch(err => {
                throw err;
            }),

        Item.findByIdAndDelete(itemId)
            .then(item => {
                if (!item) console.error(" Item not found");
                else console.log(` Item deleted: ${item._id}`);
                return item;
            })
            .catch(err => {
                throw err;
            })
    ])
    .then(([offersDeleted, itemDeleted]) => {
        if (!itemDeleted) {
            return res.status(404).send("Item not found.");
        }

        req.flash('success', 'Item and associated offers deleted successfully!');
        res.redirect('/items');
    })
    .catch(err => {
        next(err);
    });
};