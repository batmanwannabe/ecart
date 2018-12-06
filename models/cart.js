var mongoose = require('mongoose');

// Cart Schema
var CartSchema = mongoose.Schema({
   
    username: {
        type: String
    },
    cartItems: [{
    title : String,
    quantity : Number,
    price: Number,
    image: String,
    status: String,
    deliverydate: Date
     }],
    isordered: {
        type: Boolean
    },
    status: {
        type: String
    }
});

var Cart = module.exports = mongoose.model('Cart', CartSchema);

