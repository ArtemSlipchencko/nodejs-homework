const {Router} = require('express');
const ContactController = require('../controllers/contact.controller');

const router = Router();

router.get('/', ContactController.getContacts);
router.get('/:contactId', ContactController.getContact);
router.post('/', ContactController.validateCreateContact, ContactController.createContact);
router.delete('/:contactId', ContactController.contactDelete);
router.patch('/:contactId', ContactController.contactUpdate);

module.exports = router;