var mongoose = require('mongoose');

// Deals Schema
var DealsSchema = mongoose.Schema({
   
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String
    },
    date: {
        type: Date,
        required: true
    },
    categoryid: {
        type: String,
        required: true
    },
    discount: {
        type: Number,
        required: true
    }
    
});

var Deals = module.exports = mongoose.model('Deals', DealsSchema);

