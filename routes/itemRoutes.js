const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const {upload} = require('../middleware/fileUpload');


router.get('/', itemController.getAllItems);

router.get('/search', itemController.searchItems);

router.get('/new', itemController.getNewItemForm);

router.post('/', upload.single('image'), itemController.createItem);

router.get('/:id', itemController.getItemDetails);

router.get('/:id/edit', itemController.getEditItemForm);

router.put('/:id', upload.single('image'), itemController.updateItem);

router.delete('/:id', itemController.deleteItem);


module.exports = router;
