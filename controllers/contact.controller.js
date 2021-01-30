const Joi = require('joi');
const contact = require('../contact');

class ContactController {
    async getContacts(req, res) {
        const contacts = await contact.listContacts();
        res.json(contacts);
    }

    async getContact(req, res) {
        const { params: {contactId} } = req;
        const id = parseInt(contactId);
        const contactById = await contact.getContactById(id);
        res.json(contactById);
    }

    async createContact(req, res) {
        const {body: {name, email, phone}} = req;
        const result = await contact.addContact(name, email, phone);
        res.json(result);

    }

    validateCreateContact(req, res, next) {
        const validationRules = Joi.object({
            name: Joi.string().required(),
            email: Joi.string().required(),
            phone: Joi.string().required()
        });

        const validationResult = validationRules.validate(req.body);

        if(validationResult.error) {
            return res.status(400).json({"message": "missing required name field"})
        };

        next();
    }

    async contactUpdate(req, res) {
        const {body, params: {contactId}} = req;
        if(body.name || body.phone || body.email) {
            const id = parseInt(contactId);
            const result = await contact.updateContact(id, body);
            res.json(result)
            return
        } else {
            res.json({
                "message": "missing fields"
            })
        }

    }

    async contactDelete(req, res) {
        const {params: {contactId}} = req;
        const id = parseInt(contactId);
        const result = await contact.removeContact(id);
        const {status, message} = result;
        res.status(status).json(message);
    }
}

module.exports = new ContactController();