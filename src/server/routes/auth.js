var express = require('express');
var router = express.Router();

var knex = require('../db/knex');
// var queries = require('../db/queries');
var helpers = require('../lib/helpers');


/* 

curl --data "email=test@test.com&password=test" http://localhost:3000/auth/login

*/
router.post('/login', function(req, res, next) {
  var email = req.body.email;
  var password = req.body.password;
  var role = req.body.role;

  knex('users').where('email', email)
  .then(function (user) {
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Email does not exist'
      });
    } else {
      var match = helpers.comparePassword(req.body.password, user[0].password);
      if (!match) {
        return res.status(401).json({
          status: 'fail',
          message: 'Password is not correct'
        });
      }
      delete user[0].password;
      var token = helpers.generateToken(user);
      res.status(200).json({
        status: 'success',
        data: {
          token: token,
          user: user[0]
        }
      });
    }
  })
  .catch(function (err) {
    return next(err);
  });
});
//deleted helpers.ensureAdmin argument
/* 

curl --data "email=test@test.com&password=test&role=teacher" http://localhost:3000/auth/register

*/
router.post('/register', function(req, res, next) {
  console.log(req.body);
  var email = req.body.email;
  var password = req.body.password;
  var role = req.body.role;
  var phone = req.body.phone;
  var firstName = req.body.firstName;
  var lastName = req.body.lastName;
  var schoolid = req.body.schoolID;
  var image = req.body.image;
  
  knex('users').where('email', email)
    .then(function(data) {
      if(data.length) {
        return res.status(409).json({
          status: 'fail',
          message: 'Email already exists'
        });
      } else {
        var hashedPassword = helpers.hashing(password);
        knex('users')
        .returning('*') //might have to remove this
        .insert({
          email: email,
          password: hashedPassword,
          role: role,
          phone: phone,
          firstName: firstName,
          lastName: lastName,
          schoolid: schoolid,
          image: image
        })
        .then(function(user) {
          var token = helpers.generateToken(user);
          delete user.password;
          res.status(200).json({
            status: 'success',
            data: {
              token: token,
              user: user
            }
          });
        })
        .catch(function(err) {
          return next(err);
        });
      }
    })
    .catch(function(err){
      return next(err);
    });
});


// if (process.env.NODE_ENV === 'development') {
//   router.get('/make-admin', helpers.ensureAuthenticated,
//     function(req, res, next) {
//     queries.makeAdmin(req.user.id)
//     .then(function(books){
//       req.flash('messages', {
//         status: 'success',
//         value: 'You are now an admin!'
//       });
//       res.redirect('/');
//     })
//     .catch(function(err){
//       return next(err);
//     });
//   });
// }


module.exports = router;