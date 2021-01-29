const express = require('express');
const cors = require('cors');

const PORT = process.env.port || 8080;

class Server {

  constructor() {
    this.server = null;
  }

  start() {
    this.server = express();
    this.initMiddlewares();
    this.initRoutes();
    this.listen();
  }

  initMiddlewares() {
    this.server.use(express.json());
    this.server.use(cors(
      {
        origin: '*'
      }
    ))
  }

  initRoutes() {

  }

  listen() {
    this.server.listen(PORT, () => {
      console.log('Server is listening')
    })
  }

};

const server = new Server();
server.start();