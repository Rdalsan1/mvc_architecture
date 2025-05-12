const Offer = require('../models/offer');
const Item = require('../models/item');

exports.makeOffer = (req, res, next) => {
    const itemId = req.params.itemId;
    const sessionUser = req.session.user;


    Item.findById(itemId)
    .then(item => {
        if (!item) throw new Error('Item not found');
        if (item.seller.toString() === sessionUser._id) {
            return res.status(401).render('error', { error: '401 Unauthorized: Cannot offer on your own item.' });
        }
        const offer = new Offer({
            item: item._id,
            buyer: sessionUser._id, // ✅ must be _id only
            amount: parseFloat(req.body.amount)
        });

        return offer.save().then(savedOffer => {
            
            return Item.findByIdAndUpdate(
                item._id,
                {
                    $inc: { totalOffers: 1 },
                    $max: { highestOffer: savedOffer.amount }
                },
                { new: true }
            );
        }).then(() => {
            req.flash('success', 'Offer submitted successfully');
            req.session.save(err => {
                if (err) return next(err);
                res.redirect(`/items/${item._id}`);
            });
        });
    })
    .catch(err => {
        next(err);
    });
};


exports.viewOffers = (req, res, next) => {

    Item.findById(req.params.itemId).populate('seller', 'firstName lastName')
        .then(item => {
            if (!item) {
                const err = new Error('Item not found');
                err.status = 404;
                throw err;
            }

            if (!req.session.user._id || item.seller._id.toString() !== req.session.user._id.toString()) {
                const err = new Error('Unauthorized to view offers for this item');
                err.status = 401;
                throw err;
            }

            Offer.find({ item: item._id }).populate('buyer', 'firstName lastName')
                .then(offers => {
                    res.render('offers/list', { item, offers });
                })
                .catch(err => next(err));
        })
        .catch(err => next(err));
};

exports.acceptOffer = (req, res, next) => {
    Offer.findById(req.params.offerId)
        .populate('item')
        .then(offer => {
            if (!offer) {
                const err = new Error('Offer not found');
                err.status = 404;
                throw err;
            }

            const item = offer.item;

            if (item.seller._id.toString() !== req.session.user._id) {
                const err = new Error('Unauthorized to accept this offer');
                err.status = 401;
                throw err;
            }

            offer.status = 'accepted';

            return offer.save()
                .then(() => {
                    item.active = false;
                    return item.save();
                })
                .then(() => {
                    return Offer.updateMany(
                        { item: item._id, _id: { $ne: offer._id } },
                        { status: 'rejected' }
                    );
                })
                .then(() => {
                    req.flash('success', 'Offer accepted successfully');
                    res.redirect(`/items/${item._id}/offers`);
                });
        })
        .catch(err => {
            next(err);
        });
};
