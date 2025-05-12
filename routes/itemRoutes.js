const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const {upload} = require('../middleware/fileUpload');
const {isLoggedIn, isSeller, isItemOwner} = require('../middleware/auth');
const {validateId, validateItem, validateResult} = require('../middleware/validator');

const offerRoutes = require('./offerRoutes');
router.use('/:itemId/offers', offerRoutes);

router.get('/', itemController.getAllItems);

router.get('/search', itemController.searchItems);

router.get('/new', isLoggedIn, itemController.getNewItemForm);

router.post('/', isLoggedIn, validateItem, upload.single('image'), itemController.createItem);

router.get('/:id', validateId, isItemOwner, itemController.getItemDetails);

router.get('/:id/edit', validateId, isLoggedIn, isSeller, itemController.getEditItemForm);

router.put('/:id', validateId, isLoggedIn, isSeller, validateItem, validateResult, upload.single('image'), itemController.updateItem);

router.delete('/:id', validateId, isLoggedIn, isSeller, itemController.deleteItem);


module.exports = router;
