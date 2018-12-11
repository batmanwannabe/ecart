var express = require('express');
var router = express.Router();

// Get Product model
var Product = require('../models/product');
var Cart = require('../models/cart');
var Cards = require('../models/card');
var Addresses = require('../models/address');
var User = require('../models/user');

/*
 * GET add product to cart
 */
router.get('/add/:product', function (req, res) {

    var slug = req.params.product;

    Product.findOne({slug: slug}, function (err, p) {
        if (err)
            console.log(err);

        if (typeof req.session.cart == "undefined") {
            req.session.cart = [];
            req.session.cart.push({
                title: slug,
                qty: req.query.q,
                price: ((parseFloat(p.price).toFixed(2)) - ((parseFloat(p.price).toFixed(2)) * (10) / 100)),
                image: '/product_images/' + p._id + '/' + p.image
            });
        } else {
            var cart = req.session.cart;
            var newItem = true;

            for (var i = 0; i < cart.length; i++) {
                if (cart[i].title == slug) {
                    if (cart[i].qty == 4) {
                        req.flash('error', 'Product quantity maximum is 4!');
                        res.redirect('back');
                        return;
                    }
                    cart[i].qty++;
                    newItem = false;
                    break;
                }
            }

            if (newItem) {
                cart.push({
                    title: slug,
                    qty: req.query.q,
                    price: ((parseFloat(p.price).toFixed(2)) - ((parseFloat(p.price).toFixed(2)) * (10) / 100)),
                    image: '/product_images/' + p._id + '/' + p.image
                });
            }
        }
        if (req.isAuthenticated()) {
            Cart.remove({username: res.locals.user.username, isordered: false}, function (err, cart) {

            });

            username = res.locals.user.username;
            var cart = new Cart({
                username: username,
                isordered: false,
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
            cart.save();

        }
//        console.log(req.session.cart);
        req.flash('success', 'Product added!');
        res.redirect('back');
    });

});

/*
 * GET checkout page
 */
router.get('/checkout', function (req, res) {

    var isLoggedIn = req.isAuthenticated() ? true : false;
    if (req.session.cart && req.session.cart.length == 0) {
        delete req.session.cart;
        res.redirect('/cart/checkout');
    } else {
        res.render('checkout', {
            title: 'Checkout',
            cart: req.session.cart,
            isLoggedIn: isLoggedIn
        });
    }

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
    if (req.isAuthenticated()) {
        Cart.remove({username: res.locals.user.username, isordered: false}, function (err, cart) {

        });
        if (typeof req.session.cart == "undefined") {
            username = res.locals.user.username;
            var cart = new Cart({
                username: username,
                isordered: false,
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
            cart.save();
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
    if (req.isAuthenticated()) {
        Cart.remove({username: res.locals.user.username, isordered: false}, function (err, cart) {

        });


    }
});

/*
 * GET buy now
 */
router.get('/buynow', function (req, res) {
    if (req.isAuthenticated()) {
        Addresses.find({username: res.locals.user.username}, function (err, addresses) {
            Cards.find({username: res.locals.user.username}, function (err, cards) {
                res.render('placeorder', {
                    title: 'Place Order',
                    cart: req.session.cart,
                    cards: cards,
                    addresses: addresses
                });
            });
        });
    } else {
        req.flash('error', 'You must be logged in to place order');
        res.redirect('/cart/checkout');
    }
//    var username = "";
//    var productname = "";
//    var quantity = 0;
//    var price = 0;
//    var image = "";
//    var sub = 0;
//    var total = 0;
//    console.log(res.locals.user.username);
//    if (req.isAuthenticated()) {
//        username = res.locals.user.username;
//        var cart = new Cart({
//            username: username,
//            isordered: true,
//            status: "open"
//        });
//
//        req.session.cart.forEach(function (element) {
//            console.log(element.title);
//            productname = element.title;
//            quantity = element.qty;
//            price = element.price;
//            image = element.image;
//            total = 0;
//
//            sub = parseFloat(quantity * price).toFixed(2)
//            total += sub;
//            cart.cartItems.push(
//                    {
//                        title: productname,
//                        quantity: quantity,
//                        price: total,
//                        image: image,
//                        status: "open",
//                        deliverydate: ""
//                    });
//        });
//
//    }
//    cart.save();
//    delete req.session.cart;
//    if (req.isAuthenticated()) {
//        Cart.remove({username: res.locals.user.username, isordered: false}, function (err, cart) {
//
//        });
//
//
//    }
//    req.flash('success', 'Order Placed!');
//    res.redirect('/cart/checkout');



});
/*
 * Post buy now
 */
router.post('/buynow', function (req, res) {



    if (req.body.card == 'newcard') {
        req.checkBody('name', 'Name is required').notEmpty();
        req.checkBody('number', ' Card Number is required').notEmpty();
        req.checkBody('expmonth', 'Card Expiry month is required').notEmpty();
        req.checkBody('expyear', 'Card Expiry Year is required').notEmpty();
        req.checkBody('number', ' Card Number should be a number').isDecimal();
        req.checkBody('expmonth', 'Card Expiry month should be a number').isDecimal();
        req.checkBody('expyear', 'Card Expiry Year should be a number').isDecimal();
        req.checkBody('number', ' Card Number should be a 16 digit number').matches(/^\w{16,16}$/);
        req.checkBody('expmonth', 'Card Expiry month should be a 2 digit number').matches(/^\w{2,2}$/);
        req.checkBody('expyear', 'Card Expiry Year should be a 4 digit number').matches(/^\w{4,4}$/);

        var month = req.body.expmonth;
        var year = req.body.expyear;
        console.log(month);

        var expiryDate = new Date(year.toString() + '-' + month.toString() + '-01');
        console.log(expiryDate);
        if (expiryDate < new Date()) {

            Addresses.find({username: req.user.username}, function (err, addresses) {
                Cards.find({username: req.user.username}, function (err, cards) {
                    User.findOne({username: req.user.username}, function (err, user) {
                        res.render('placeorder', {
                            title: 'Place Order',
                            cart: req.session.cart,
                            cards: cards,
                            addresses: addresses,
                            user: user
                        });
                    });

                });
            });
        }

        //req.checkBody('expmonth' + '/' + 'expyear', 'Card Expired').matches(/^((0[1-9])|(1[0-2]))\/((18)|([1-2][0-9]))$/, 'i');
    }
    if (req.body.addresss == 'newaddress')
    {
        req.checkBody('address', 'Address line 1 is required').notEmpty();
        req.checkBody('city', 'city should nt contain numbers/spl chars!').matches(/^^[_A-z0-9]*((-|\s)*[_A-z0-9])*$/, 'i');
        req.checkBody('zipcode', 'pincode should be 6 digit number!').matches(/^[0-9]{6,6}$/, 'i');
        req.checkBody('phone', 'phone should be 10 digit number!').matches(/^[0-9]{10,10}$/, 'i');
    }


    var errors = req.validationErrors();

    if (errors) {
        Addresses.find({username: req.user.username}, function (err, addresses) {
            Cards.find({username: req.user.username}, function (err, cards) {
                User.findOne({username: req.user.username}, function (err, user) {
                    res.render('placeorder', {
                        title: 'Place Order',
                        cart: req.session.cart,
                        cards: cards,
                        addresses: addresses,
                        errors: errors,
                        user: user
                    });
                });

            });
        });

        //res.redirect('/users/add-address');
    } else {
        var username = "";
        var productname = "";
        var quantity = 0;
        var price = 0;
        var image = "";
        var sub = 0;
        var total = 0;
        //console.log(req.user.username);

        if (req.isAuthenticated()) {
            username = req.user.username;
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
                            image: image,
                            status: "open",
                            deliverydate: ""
                        });
            });

        }
        cart.save();
        delete req.session.cart;
        if (req.isAuthenticated()) {
            Cart.remove({username: req.user.username, isordered: false}, function (err, cart) {

            });


        }
        req.flash('success', 'Order Placed!');
        res.redirect('/orders/myorders');

    }

});

// Exports
module.exports = router;


