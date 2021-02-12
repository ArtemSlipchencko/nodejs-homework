const {Router} = require('express');
const ContactController = require('./contact.controller');
const UserController = require('../user/user.controller');

const router = Router();

router.get('/', UserController.authorization, ContactController.listContacts);
router.get('/:contactId', UserController.authorization, ContactController.validateId, ContactController.getContactById);
router.post('/', UserController.authorization, ContactController.validateCreateContact, ContactController.createContact);
router.delete('/:contactId', UserController.authorization, ContactController.validateId, ContactController.contactDelete);
router.patch('/:contactId', UserController.authorization, ContactController.validateUpdateContact, ContactController.validateId, ContactController.contactUpdate);

module.exports = router;