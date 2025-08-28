const server = require('./app');
const dbConfig = require('./config/dbConfig');

const port = process.env.PORT || 3000;

server.listen(port, () => {console.log('Listing to requests on PORT: ' + port)});