const fs = require('fs').promises;
const path = require('path');
const { v4: uuid } = require('uuid');

const contactsPath = path.relative(`/`, `/db/contacts.json`);

function listContacts() {
    return fs.readFile(contactsPath)
        .then(data => { 
            const contacts = JSON.parse(data.toString());
            return contacts;
        })
        .catch( err => console.error(err.message))
};

function getContactById(contactId) {
    return fs.readFile(contactsPath)
        .then(data => { 
            const contacts = JSON.parse(data.toString());
            const contact = contacts.find(el => el.id === contactId);
            if (contact) {
                return contact
            } 
            throw new Error(`Contact with id ${contactId} doesn't exist!`)
        })
        .catch( err => console.error(err.message))
};

function removeContact(contactId) {
    return fs.readFile(contactsPath)
          .then(data => { 
                const contacts = [...JSON.parse(data.toString())]
                const idx = contacts.findIndex(el => el.id === contactId);
                if (idx === -1) {
                    return {
                      status: 404,
                      message: {"message": "Not found"}
                    }
                }
                contacts.splice(idx, 1);
                return fs.writeFile(contactsPath, JSON.stringify(contacts, 2))
                .then( () => {
                    return {
                        status: 200,
                        message: {"message": "contact deleted"}
                    }
                })
          })
          .catch( err => console.error(err.message))
};

function addContact(name, email, phone) {
    
    return fs.readFile(contactsPath)
        .then(data => { 
            const contacts = JSON.parse(data.toString());
            const newContact = { id: contacts.length + 1, name, email, phone };
            contacts.push(newContact);
            console.log(contacts)
            fs.writeFile(contactsPath, JSON.stringify(contacts, 2))
                .then( () => console.log("Contact was added"))
            return newContact
        })
        .catch( err => console.error(err.message))
};

function updateContact(contactId, body) {
    return fs.readFile(contactsPath)
        .then(data => {
            const contacts = JSON.parse(data.toString());
            const idx = contacts.findIndex(({id}) => id === contactId);
            contacts[idx] = {
                ...contacts[idx],
                ...body
            };
            fs.writeFile(contactsPath, JSON.stringify(contacts, 2))
            .then( () => console.log("Contact was updated"))
            return contacts[idx];
        })
        .catch( err => console.error(err.message))
}

module.exports = {
    listContacts,
    getContactById,
    removeContact,
    addContact,
    updateContact
};