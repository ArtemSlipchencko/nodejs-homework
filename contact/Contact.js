const mongoose = require('mongoose');

const {Schema} = mongoose;

const ContactSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        validate: (value) => value.includes('@')
    },
    phone: {
        type: String,
        required: true
    },
    subscription: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    token: {
        type: String,
    }
});

const Contact = mongoose.model('Contact', ContactSchema);

module.exports = Contact;