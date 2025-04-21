const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const {upload} = require('../middleware/fileUpload');
const {isLoggedIn, isSeller} = require('../middleware/auth');
const {validateId} = require('../middleware/validator');

router.get('/', itemController.getAllItems);

router.get('/search', itemController.searchItems);

router.get('/new', isLoggedIn, itemController.getNewItemForm);

router.post('/', isLoggedIn, upload.single('image'), itemController.createItem);

router.get('/:id', validateId, itemController.getItemDetails);

router.get('/:id/edit', isLoggedIn, isSeller, validateId, itemController.getEditItemForm);

router.put('/:id', isLoggedIn, isSeller, validateId, upload.single('image'), itemController.updateItem);

router.delete('/:id', isLoggedIn, isSeller, validateId, itemController.deleteItem);


module.exports = router;
