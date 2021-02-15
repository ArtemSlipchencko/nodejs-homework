const {Types: {ObjectId}} = require('mongoose');
const User = require('./User');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function registerValidation(req, res, next) {
    const validationRules = Joi.object({
        email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
        password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
        subscription: Joi.string(),
        token: Joi.string()
    });

    const validationResult = validationRules.validate(req.body);

    if(validationResult.error) {
        return res.status(400).json(validationResult.error)
    };

    const {
        body: {email}
    } = req;

    const user = await User.findOne({email});

    if(user) {
        return res.status(409).send('Email in use')
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

async function loginValidation(req, res, next) {
    const {
        body: {email}
    } = req;

    const user = await User.findOne({email});

    if(!user) {
        return res.status(401).send('Email or password is wrong')
    };

    const validationRules = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required()
    });

    const validationResult = validationRules.validate(req.body);

    if(validationResult.error) {
        return res.status(400).json(validationResult.error)
    };

    next();
};

async function userLogin(req, res) {
    const {
        body: {email, password}
    } = req;

    const user = await User.findOne({email});

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid) {
        return res.status(401).send('Email or password is wrong')
    };

    const token = jwt.sign(
        {
            userId: user._id,
        },
        process.env.JWT_SECRET
    );

    user.token = token;

    const userLogged = await User.findByIdAndUpdate(user._id, user, {new: true});

    return res.json({
        token,
        user: {
            email,
            subscription: user.subscription
        }
    });
};

async function authorization(req, res, next) {
    const authHeader = req.get('Authorization');
    if(!authHeader) {
        return res.status(401).send('User is unauthorized')
    };
    const token = authHeader.replace('Bearer ', '');

    try {
        const payload = await jwt.verify(token, process.env.JWT_SECRET);
        const {userId} = payload;

        const user = await User.findById(userId);

        if(!user) {
            return res.status(401).send('User is unauthorized')
        }

        req.user = user;

        next();
    } catch (error) {
        return res.status(401).send(error);
    }
};

async function userLogout(req, res) {
    const user = req.user;
    user.token = "";

    try {
        await User.findByIdAndUpdate(user._id, user);
        res.status(204).send('No content');
    } catch (error) {
        res.status(401).send('Not authorized');
    };
};

async function userCurrent(req, res) {
    const authHeader = req.get('Authorization');
    const token = authHeader.replace('Bearer ', '');

    const payload = await jwt.verify(token, process.env.JWT_SECRET);
    const {userId} = payload;
    try {
        const user = await User.findById(userId);

        if(user) {
            return res.status(200).send({
                email: user.email,
                subscription: user.subscription
            })
        };
    } catch (error) {
        res.status(401).send('Not authorized');
    };
};

module.exports = {
    registerValidation,
    userCreate,
    loginValidation,
    userLogin,
    authorization,
    userLogout,
    userCurrent
};