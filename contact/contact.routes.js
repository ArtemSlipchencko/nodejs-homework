const {Router} = require('express');
const ContactController = require('./contact.controller');

const router = Router();

router.get('/', ContactController.listContacts);
router.get('/:contactId', ContactController.validateId, ContactController.getContactById);
router.post('/', ContactController.validateCreateContact, ContactController.createContact);
router.delete('/:contactId', ContactController.validateId, ContactController.contactDelete);
router.patch('/:contactId', ContactController.validateUpdateContact, ContactController.validateId, ContactController.contactUpdate);

module.exports = router;