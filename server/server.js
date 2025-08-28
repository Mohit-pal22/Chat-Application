const server = require('./app');
const dotenv = require('dotenv');

dotenv.config({path: './.env'});
const dbConfig = require('./config/dbConfig');

const port = process.env.PORT_NUMBER || 3000;

server.listen(port, () => {console.log('Listing to requests on PORT: ' + port)});