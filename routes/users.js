var express = require('express');
var router = express.Router();
var passport = require('passport');
var bcrypt = require('bcryptjs');

// Get Users model
var User = require('../models/user');
var Cart = require('../models/cart');
var Address = require('../models/address');
var Card = require('../models/card');

/*
 * GET register
 */
router.get('/register', function (req, res) {

    res.render('register', {
        title: 'Register'
    });

});

/*
 * POST register
 */
router.post('/register', function (req, res) {

    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    req.checkBody('name', 'Name is required!').notEmpty();

    req.checkBody('name', 'Name should nt contain numbers/spl chars!').matches(/^[_A-z]*((-|\s)*[_A-z])*$/, 'i');
    req.checkBody('email', 'Email is required!').isEmail();
    req.checkBody('username', 'Username is required!').notEmpty();
    req.checkBody('password', 'Password is required!').notEmpty();
    req.checkBody('password', 'Password should contain at least an uppercase and a lowercase character, a number and a special character!').matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{1,}$/, "i");
    req.checkBody('password2', 'Passwords do not match!').equals(password);

    var errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            errors: errors,
            user: null,
            title: 'Register'
        });
    } else {
        User.findOne({email: email}, function (err, user) {
            if (err)
                console.log(err);

            if (user) {
                req.flash('danger', 'Email exists, choose another!');
                res.redirect('/users/register');
            } else {
                var user = new User({
                    name: name,
                    email: email,
                    username: username,
                    password: password,
                    admin: 0
                });

                bcrypt.genSalt(10, function (err, salt) {
                    bcrypt.hash(user.password, salt, function (err, hash) {
                        if (err)
                            console.log(err);

                        user.password = hash;

                        user.save(function (err) {
                            if (err) {
                                console.log(err);
                            } else {
                                req.flash('success', 'You are now registered!');
                                res.redirect('/users/login')
                            }
                        });
                    });
                });
            }
        });
    }

});

/*
 * GET login
 */
router.get('/login', function (req, res) {

    if (res.locals.user)
        res.redirect('/products');

    res.render('login', {
        title: 'Log in'
    });

});

/*
 * POST login
 */
router.post('/login', function (req, res, next) {

//    passport.authenticate('local', {
//        successRedirect: '/',
//        failureRedirect: '/users/login',
//        failureFlash: true
//    })(req, res, next);
//    
    passport.authenticate('local', {
        successRedirect: '/products',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

/*
 * GET logout
 */
router.get('/logout', function (req, res) {

    req.logout();

    req.flash('success', 'You are logged out!');
    res.redirect('/users/login');

});

/*
 * GET profile
 */
router.get('/profile', function (req, res) {

    //req.logout();

    //req.flash('success', 'You are logged out!');
    User.findOne({username: res.locals.user.username}, function (err, user) {
        Address.find({username: user.username}, function (err, addresses) {
            res.render('profile', {
                title: 'Profile',
                user: user,
                addresses: addresses
            });
        })

    });
    //res.redirect('/users/login');

});
/*
 * GET profile
 */
router.get('/profile', function (req, res) {

    //req.logout();

    //req.flash('success', 'You are logged out!');
    User.findOne({username: res.locals.user.username}, function (err, user) {
        Address.find({username: res.local.user.username}, function (err, addresses) {
            res.render('profile', {
                title: 'Profile',
                user: user,
                addresses: addresses
            });
        })

    });
    //res.redirect('/users/login');

});
/*
 * GET add address
 */
router.get('/add-card', function (req, res) {

    res.render('add-card', {
        title: 'Add Card'
    });

});
/*
 * post add address
 */
router.post('/add-card', function (req, res) {

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


    var errors = req.validationErrors();

    if (errors) {
        console.log(errors);
        //req.session.errors = errors;
        //res.redirect('/users/add-card');
        User.findOne({username: req.user.username}, function (err, user) {
            res.render('add-card', {
                errors: errors,
                user: user,
                title: 'Add Card'
            });
        });

    } else {
        var name = req.body.name;
        var number = req.body.number;
        var expmonth = req.body.expmonth;
        var expyear = req.body.expyear;
        const expiryDate = new Date(expyear + '-' + expmonth + '-01');
        if (expiryDate < new Date()) {
            // Fails validation, show some error message to user
            req.flash('error', 'card expired');
            res.redirect('/users/add-card');
        } else {
            var card = new Card({
                username: req.user.username,

                name: name,
                number: number,
                expmonth: expmonth,
                expyear: expyear
            });
            card.save();
            req.flash('success', 'card added')
            res.redirect('/users/profile');
        }
    }

});

/*
 * GET all address
 */
router.get('/all-cards', function (req, res) {

    Card.find({username: req.user.username}, function (err, cards) {
        if (err)
            console.log(err);
        res.render('all_cards', {
            title: 'all cards',
            cards: cards
        });
    });


});
/*
 * GET edit address
 */
router.get('/delete-card/:cardid', function (req, res) {
    Card.findById(req.params.cardid, function (err, p) {
        p.remove();
        req.flash('success', 'card removed')
        res.redirect('/users/profile');
    });

});
/*
 * GET add address
 */
router.get('/add-address', function (req, res) {

    res.render('add-address', {
        title: 'Add Address'
    });

});

/*
 * post add address
 */
router.post('/add-address', function (req, res) {

    req.checkBody('address', 'Address line 1 is required').notEmpty();

    req.checkBody('city', 'city should nt contain numbers/spl chars!').matches(/^^[_A-z0-9]*((-|\s)*[_A-z0-9])*$/, 'i');
    req.checkBody('zipcode', 'pincode should be 6 digit number!').matches(/^[0-9]{6,6}$/, 'i');
    req.checkBody('phone', 'phone should be 10 digit number!').matches(/^[0-9]{10,10}$/, 'i');



    var errors = req.validationErrors();

    if (errors) {
        console.log(errors);
//        errors.forEach(function (error) {
//            if (error.param == 'address')
//                req.flash('error', 'Address line 1 is required!! ');
//            if (error.param == 'city')
//                req.flash('error', 'city should nt contain numbers/spl chars! ');
//            if (error.param == 'zipcode')
//                req.flash('error', 'pincode should be 6 digit number!! ');
//            if (error.param == 'phone')
//                req.flash('error', 'phone should be 10 digit number! ');
//        })
        //req.flash('error', 'inputs does not meet requirements!');
        User.findOne({username: req.user.username}, function (err, user) {
            res.render('add-address', {
                errors: errors,
                user: user,
                title: 'Add Address//'
            });
        });
        //res.redirect('/users/add-address');
    } else {
        var address = req.body.address;
        var city = req.body.city;
        var phone = req.body.phone;
        var state = req.body.state;
        var zipcode = req.body.zipcode;
        var addresss = new Address({
            username: req.user.username,

            state: state,
            phone: phone,
            zipcode: zipcode,
            address: address,
            city: city
        });
        addresss.save();
        req.flash('success', 'address added')
        res.redirect('/users/profile');
    }

});
/*
 * GET all address
 */
router.get('/all-address', function (req, res) {

    Address.find({username: req.user.username}, function (err, addresses) {
        if (err)
            console.log(err);
        console.log(addresses);
        console.log(req.body.username);
        res.render('all_address', {
            title: 'all address',
            addresses: addresses
        });
    });


});

/*
 * GET edit address
 */
router.get('/edit-address/:addressid', function (req, res) {
    Address.findById(req.params.addressid, function (err, p) {
        res.render('edit-address', {
            title: 'edit address',
            address: p
        });
    });

});
/*
 * post edit address
 */
router.post('/edit-address', function (req, res) {
    req.checkBody('address', 'Address line 1 is required').notEmpty();

    req.checkBody('city', 'city should nt contain numbers/spl chars!').matches(/^^[_A-z0-9]*((-|\s)*[_A-z0-9])*$/, 'i');
    req.checkBody('zipcode', 'pincode should be 6 digit number!').matches(/^[0-9]{6,6}$/, 'i');
    req.checkBody('phone', 'phone should be 10 digit number!').matches(/^[0-9]{10,10}$/, 'i');



    var errors = req.validationErrors();

    if (errors) {
        console.log(errors);
        Address.findById(req.body.id, function (err, p) {
            User.findOne({username: req.user.username}, function (err, user) {
                res.render('edit-address', {
                    title: 'edit address',
                    address: p,
                    errors: errors,
                    user: user
                });
            });
        });
    } else {
        var addresss = req.body.address;
        var city = req.body.city;
        var phone = req.body.phone;
        var state = req.body.state;
        var zipcode = req.body.zipcode;
        Address.findById(req.body.id, function (err, address) {
            address.zipcode = zipcode;
            address.state = state;
            address.phone = phone;
            address.city = city;
            address.address = addresss;
            address.save();
            res.redirect('/users/profile');
        });

    }



});

/*
 * GET add address
 */
router.get('/edit-profile', function (req, res) {
    User.findOne({username: req.user.username}, function (err, user) {
        if (err)
            console.log(err);
        res.render('edit-profile', {
            title: 'edit profile',
            user: user
        });
    });

});
/*
 * POST edit profile
 */
router.post('/edit-profile', function (req, res) {
    req.checkBody('name', 'Name is required!').notEmpty();

    req.checkBody('name', 'Name should nt contain numbers/spl chars!').matches(/^[_A-z]*((-|\s)*[_A-z])*$/, 'i');
    req.checkBody('password', 'Password is required!').notEmpty();
    req.checkBody('password', 'Password should contain at least an uppercase and a lowercase character, a number and a special character!').matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{1,}$/, "i");
    //req.checkBody('password2', 'Passwords do not match!').equals(password);
    var name = req.body.name;
    var password = req.body.password;
    var password2 = req.body.password2;
    console.log(password);
    console.log(password2);

    var errors = req.validationErrors();

    if (errors) {
        console.log(errors);
        User.findOne({username: req.user.username}, function (err, user) {
            if (err)
                console.log(err);
            res.render('edit-profile', {
                title: 'edit profile',
                user: user,
                errors: errors
            });
        });
    } else {
        User.findOne({username: req.body.username}, function (err, user) {
            if (err)
                console.log(err);


            user.name = name;

            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(password, salt, function (err, hash) {
                    if (err)
                        console.log(err);

                    user.password = hash;

                    user.save(function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            req.flash('success', 'You details are saved!');
                            res.redirect('/products')
                        }
                    });
                });
            });

        });
    }
});

// Exports
module.exports = router;


