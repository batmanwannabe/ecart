var mongoose = require('mongoose');

// Product Schema
var ProductSchema = mongoose.Schema({

    title: {
        type: String,
        required: true
    },
    slug: {
        type: String
    },
    desc: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String
    },
    avgrating: {
        type: Number
    },
    review: [{
            rating: Number,
            content: String,
            username: String}]

});

var Product = module.exports = mongoose.model('Product', ProductSchema);

