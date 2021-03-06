const {Types: {ObjectId}} = require('mongoose');
const User = require('./User');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Avatar = require('avatar-builder');
const fs = require('fs');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
const sgMail = require('@sendgrid/mail');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

dotenv.config();

const PORT = process.env.port || 8080;

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function userVerify(req, res) {
    const {params: {
        verificationToken
    }} = req;

    console.log(verificationToken)

    const user = await User.findOne({verificationToken});

    if(user) {
        user.verificationToken = "";
        const updatedUser = await User.findByIdAndUpdate(user._id, user, {new: true});
        res.status("200").send("Your account is verified");
    } else {
        return res.send("User not found").status("404");
    }
};

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
    const verificationToken = uuidv4();;

    const {body: {email}} = req;

    const msg = {
        to: `${email}`, // Change to your recipient
        from: 'pfistaskin@gmail.com', // Change to your verified sender
        subject: 'Verify',
        html: `<a href="http://localhost:${PORT}/auth/verify/${verificationToken}">Please, verify your account<a>`
      };

        try {
            const {body} = req;
            const hashedPass = await bcrypt.hash(body.password, 14);
            const user = await User.create({
                ...body,
                password: hashedPass,
                avatarURL: req.pathAvatar,
                verificationToken: `${verificationToken}`
            });

            sgMail
            .send(msg)
                .then(() => {
                    console.log('Email sent')
                })
                .catch((error) => {
                    console.log(process.env.SENDGRID_API_KEY);
                    console.error(error)
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
    const user = req.user;

    return res.status(200).send({
        email: user.email,
        subscription: user.subscription
    });
};

async function createAvatar(req, res, next) {
    const avatar = Avatar.githubBuilder(128);
    const pathAvatar = `${Date.now()}.png`;
    avatar.create().then(buffer => fs.writeFileSync(`tmp/${pathAvatar}`, buffer));
    req.pathAvatar = pathAvatar;

    next();
};

async function userUpdate(req, res) {
    const {user} = req;
    user.avatarURL = req.pathAvatar;

    const updatedUser = await User.findByIdAndUpdate(user._id, user, {new: true});

    if (!updatedUser) {
        return res.status(404).send('User is not found')
    };

    res.send({
        email: updatedUser.email,
        avatarURL: updatedUser.avatarURL
    });
};

async function minifyImage(req, res, next) {
    const files = await imagemin([`tmp/${req.pathAvatar}`], {
        destination: 'public/images/',
        plugins: [
            imageminJpegtran(),
            imageminPngquant({
                quality: [0.6, 0.8]
            })
        ]
    });

    await fs.unlink(`tmp/${req.pathAvatar}`, (err) => {
        if(err) throw err;
    });
    
    req.pathAvatar = `http://localhost:${PORT}/images/${req.pathAvatar}`;

    next();
};

module.exports = {
    registerValidation,
    userCreate,
    loginValidation,
    userLogin,
    authorization,
    userLogout,
    userCurrent,
    createAvatar,
    userUpdate,
    minifyImage,
    userVerify
};