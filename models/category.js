var mongoose = require('mongoose');

// Category Schema
var CategorySchema = mongoose.Schema({
   
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String
    },
    discount: {
        type: Boolean
    },
    discountrate: {
        type: Number
    }
    
});

var Category = module.exports = mongoose.model('Category', CategorySchema);

