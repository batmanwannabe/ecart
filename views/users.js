var express = require('express');
var router = express.Router();
var passport = require('passport');
var bcrypt = require('bcryptjs');

// Get Users model
var User = require('../models/user');
var Cart = require('../models/cart');
var Address = require('../models/address');

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
    req.checkBody('password', 'Password does not meet requirements!').matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{1,}$/, "i");
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
        successRedirect: '/',
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
        req.flash('error', 'inputs does not meet requirements!');
        res.redirect('/users/add-address');
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
        req.flash('error', 'inputs does not meet requirements!');
        res.redirect('/users/profile');
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
    req.checkBody('password', 'Password does not meet requirements!').matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{1,}$/, "i");
    //req.checkBody('password2', 'Passwords do not match!').equals(password);
    var name = req.body.name;
    var password = req.body.password;
    var password2 = req.body.password2;
    console.log(password);
    console.log(password2);

    var errors = req.validationErrors();

    if (errors) {
        console.log(errors);
        req.flash('error', 'Password doe not meet requirements!');
        res.redirect('/users/edit-profile');
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


