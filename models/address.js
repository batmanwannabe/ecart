var mongoose = require('mongoose');

// Address Schema
var AddressSchema = mongoose.Schema({

    username: {
        type: String,
        required: true
    },
    zipcode: {
        type: String
    },
    state: {
        type: String
    },
    city: {
        type: String
    },
    phone: {
        type: Number
    },
    address: {
        type: String
    }

});

var Address = module.exports = mongoose.model('Address', AddressSchema);

