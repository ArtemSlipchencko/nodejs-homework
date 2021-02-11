const {Types: {ObjectId}} = require('mongoose');
const User = require('./User');
const Joi = require('joi');
const bcrypt = require('bcryptjs');

async function registerValidation(req, res, next) {
    const validationRules = Joi.object({
        email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
        password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
        subscription: Joi.string().required(),
        token: Joi.string()
    });

    const validationResult = validationRules.validate(req.body);

    if(validationResult.error) {
        return res.status(400).json(validationResult.error)
    };

    next();
};

async function userCreate(req, res) {
    try {
        const {body} = req;
        const hashedPass = await bcrypt.hash(body.password, 14);
        const user = await User.create({
            ...body,
            password: hashedPass
        });
        res.status(201).json(user);
    } catch (error) {
        res.status(400).send(error);
    };
};

module.exports = {
    registerValidation,
    userCreate
}