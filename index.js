const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const contactRoutes = require('./contact/contact.routes');
const userRoutes = require('./user/user.routes');
const bcrypt = require('bcryptjs');

dotenv.config();

const PORT = process.env.port || 8080;

start();

function start() {
  const server = initServer();
  initMiddlewares(server);
  initRoutes(server);
  connectToDb();
  listen(server);

  server.use('/images', express.static('public/images'));
};

function initServer() {
  return express();
};

function initMiddlewares(server) {
  server.use(express.json());
};

function initRoutes(server) {
  server.use('/api/contacts', contactRoutes);
  server.use('/auth', userRoutes);
};

async function connectToDb() {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    console.log('Database connection successful');
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

function listen(server) {
  server.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}`)
  });
};