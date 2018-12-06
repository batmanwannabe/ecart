var mongoose = require('mongoose');

// Card Schema
var CardSchema = mongoose.Schema({

    username: {
        type: String,
        required: true
    },
    name: {
        type: String
    },
    number: {
        type: String
    },
    expmonth: {
        type: String
    },
    expyear: {
        type: String
    }
});

var Card = module.exports = mongoose.model('Card', CardSchema);

