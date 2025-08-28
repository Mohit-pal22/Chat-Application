const mongoose = require("mongoose");

// connection logic
mongoose.connect(process.env.CONN_STRING);

// connection status
const db = mongoose.connection;

// check db connection
db.on('connected', () => {
    console.log('Db Connection Successfull');
})

db.on('err', () => {
    console.log("DB Connection Failed");
})

module.exports = db;