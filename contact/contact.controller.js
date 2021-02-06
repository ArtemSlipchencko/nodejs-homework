const {Types: {ObjectId}} = require('mongoose');
const Contact = require('./Contact');

async function listContacts(req, res) {
    const contacts = await Contact.find();
    res.json(contacts);
};

async function getContactById(req, res) {
    const {params: {contactId}} = req;

    const contact = await Contact.findById(contactId)
    res.json(contact)
};

async function createContact(req, res) {
    try {
        const {body} = req;

        const contact = await Contact.create(body);
        res.json(contact);
    } catch (error) {
        res.status(400).send(error)
    }
};

async function contactUpdate(req, res) {
    const {
        params: {contactId}
    } = req;

    const updatedContact = await Contact.findByIdAndUpdate(contactId, req.body, {new: true});

    if (!updatedContact) {
        return res.status(404).send('Contact is not found')
    };

    res.json(updatedContact);
};

async function contactDelete(req, res) {
    const {
        params: {contactId}
    } = req;

    const deletedContact = await Contact.findByIdAndDelete(contactId)

    if (!deletedContact) {
        return res.status(404).send('Contact is not found')
    };

    res.json(deletedContact);
};

function validateId(req, res, next) {
    const {
        params: {contactId}
    } = req;

    if (!ObjectId.isValid(contactId)) {
        return res.status(400).send('Wrong id!');
    };

    next();
}

module.exports = {
    listContacts,
    getContactById,
    createContact,
    contactUpdate,
    contactDelete,
    validateId
};