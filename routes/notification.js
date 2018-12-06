var express = require('express');
var router = express.Router();
// Get Product model
var Product = require('../models/product');
var Wishlist = require('../models/wishlist');
var Order = require('../models/cart');
/*
 * GET add product to wishlist
 */
router.get('/all-notifications', function (req, res) {

    Order.find({username: res.locals.user.username, isordered: true}, function (err, orders) {
        if (err)
            console.log(err);
        console.log(orders);
        var notifications = [];
        if (orders !== null) {
            orders.forEach(function (order) {
                if (order.status == "delivered") {
                    notifications.push("Your Order " + order._id + " is Delivered");
                }
            })
        }
        res.render('all_notifications', {
            title: 'Notifications',
            notifications: notifications
        });
    });
});



/*
 * GET wishlist page
 */
router.get('/products', function (req, res) {

    Wishlist.findOne({username: res.locals.user.username}, function (err, list) {

        list.items.forEach(function (title) {
            Product.find({title: title}, function (err, products) {
                if (err)
                    console.log(err);

                res.render('cat_products', {
                    title: "wishlists",
                    products: products
                });
            });
        })

    });

});
/*
 * GET update product
 */
router.get('/update/:product', function (req, res) {

    var slug = req.params.product;
    var cart = req.session.cart;
    var action = req.query.action;
    for (var i = 0; i < cart.length; i++) {
        if (cart[i].title == slug) {
            switch (action) {
                case "add":
                    if (cart[i].qty == 4) {
                        req.flash('error', 'Product quantity maximum is 4!');
                        res.redirect('back');
                        return;
                    }
                    cart[i].qty++;
                    break;
                case "remove":
                    cart[i].qty--;
                    if (cart[i].qty < 1)
                        cart.splice(i, 1);
                    break;
                case "clear":
                    cart.splice(i, 1);
                    if (cart.length == 0)
                        delete req.session.cart;
                    break;
                default:
                    console.log('update problem');
                    break;
            }
            break;
        }
    }

    req.flash('success', 'Cart updated!');
    res.redirect('/cart/checkout');
});
/*
 * GET clear cart
 */
router.get('/clear', function (req, res) {

    delete req.session.cart;
    req.flash('success', 'Cart cleared!');
    res.redirect('/cart/checkout');
});
/*
 * GET buy now
 */
router.get('/buynow', function (req, res) {
    var username = "";
    var productname = "";
    var quantity = 0;
    var price = 0;
    var image = "";
    var sub = 0;
    var total = 0;
    console.log(res.locals.user.username);
    if (req.isAuthenticated()) {
        username = res.locals.user.username;
        var cart = new Cart({
            username: username,
            isordered: true,
            status: "open"
        });
        req.session.cart.forEach(function (element) {
            console.log(element.title);
            productname = element.title;
            quantity = element.qty;
            price = element.price;
            image = element.image;
            total = 0;
            sub = parseFloat(quantity * price).toFixed(2)
            total += sub;
            cart.cartItems.push(
                    {
                        title: productname,
                        quantity: quantity,
                        price: total,
                        image: image
                    });
        });
    }
    cart.save();
    delete req.session.cart;
    req.flash('success', 'Order Placed!');
    res.redirect('/cart/checkout');
    //res.sendStatus(200);

});
// Exports
module.exports = router;


