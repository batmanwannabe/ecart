var mongoose = require('mongoose');

// Order Schema
var OrderSchema = mongoose.Schema({
   
    username: {
        type: String,
        required: true
    },
    productid: [{
        type: String
    }],
    price: [{
        type: Number
    }],
    quantity: [{
        type: Number
    }]
});

var Product = module.exports = mongoose.model('Product', ProductSchema);

