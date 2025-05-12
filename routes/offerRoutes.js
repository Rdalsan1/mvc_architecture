const express = require('express');
const router = express.Router({ mergeParams: true });
const offerController = require('../controllers/offerController');
const { isLoggedIn, isItemOwner } = require('../middleware/auth');
const {validateOffer, validateResult } = require('../middleware/validator');

router.post('/', isLoggedIn, validateOffer, validateResult, offerController.makeOffer);

router.get('/', isLoggedIn, isItemOwner, offerController.viewOffers);

router.post('/:offerId/accept', isLoggedIn, isItemOwner, offerController.acceptOffer);

module.exports = router;
