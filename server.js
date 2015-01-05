/**
 * server.js - SAMPLE REST IMPLEMENTATION -- NOT PART OF UROLOGYSERVER
 * Tony Andrys
 **/

 // Stack:
 // Node.js
 // Express 4
 // MySQL

// ==========================================================================
// BASE SETUP
// ==========================================================================
var express = require('express'),
	bodyParser = require('body-parser');

var app = express();
app.use(bodyParser());

var env = app.get('env') == 'development' ? 'dev' : app.get('env');
var port = process.env.PORT || 8080;

// ==========================================================================
// IMPORT MODELS
// ==========================================================================

// Sequelize is the module that accesses the database
var Sequelize = require('sequelize');

// database configuration
var env = "dev";
var config = require('./database.json')[env];
var password = config.password ? config.password : null;

// db connection - read authentication info from database.json and initalize 
var sequelize = new Sequelize(
	config.database,
	config.user,
	config.password,
	{
		logging: console.log,
		define: {
			timestamps: false
		}
	}
);
var crypto = require('crypto');
var DataTypes = require('sequelize');

/* 
 * USER Model 
 */
var User = sequelize.define('users', {
	username: DataTypes.STRING,
	password: DataTypes.STRING
}, {
	instanceMethods: {
		retrieveAll: function(onSuccess, onError) {
			User.findAll({}, {raw: true})
			.success(onSuccess).error(onError);
		},
		retrieveById: function(user_id, onSuccess, onError) {
			User.find({where: {id: user_id}}, {raw:true})
				.success(onSuccess).error(onError);
		},
		add: function(onSuccess, onError) {
			var username = this.username;
			var password = this.password;
			var shasum = crypto.createHash('sha1');
			shasum.update(password);
			password = shasum.digest('hex');

			User.build({username: username, password: password })
				.save().success(onSuccess).error(onError);
		},
		updateById: function(user_id, onSuccess, onError) {
			var id = user_id;
			var username = this.username;
			var password = this.password;
			var shasum = crypto.createHash('sha1');
			shasum.update(password);
			password = shasum.digest('hex');

			User.update({username: username, password: password}, {where: {id: id} })
				.success(onSuccess).error(onError);
		},
		removeById: function(user_id, onSuccess, onError) {
			User.destroy({where: {id: user_id}})
				.success(onSuccess).error(onError);
		}
	}
});

// ==========================================================================
// IMPORT ROUTES
// ==========================================================================
var router = express.Router();

/** 
 * Routes that end in /users
 */
router.route('/users')

// Create a new user 
// POST -> http://localhost:8080/api/users
.post(function(req, res) {

	// BodyParser automagically takes care of these
	var username = req.body.username;
	var password = req.body.password;

	// Build the user object - this basic model is passed to .add() to be salted and written to the database
	var user = User.build({username: username, password: password});

	// Writes success message to response stream if successful, writes the error if unsuccessful.
	user.add(function(success) {
		res.json({message: 'User created!'});
	},
	function(err) {
		res.send(err);
	});
});

/**
 * Routes that end in /users/:user_id
 */
router.route('/users/:user_id')

// Update a user (accessed via PUT http://localhost:8080/api/users/:user_id)
.put(function(req, res) {
	var user = User.build();

	user.username = req.body.username;
	user.password = req.body.password;

	user.updateById(req.params.user_id, function(success) {
		console.log(success);
		if (success) {
			res.json({message: 'User updated!'});
		} else {
			res.send(401, "User not found");
		}
	}, function(error) {
		res.send("User not found.");
	});
})

// Get a user by ID (accessed via GET http://localhost:8080/api/users/:user_id)
.get(function(req, res) {
	var user = User.build();

	user.retrieveById(req.params.user_id, function(users) {
		if (users) {
			res.json(users);
		} else {
			res.send(401, "User not found");
		}
	}, function(error) {
		res.send("User not found");
	});
})

// Delete a user by id (accessed at DELETE http://localhost:8080/api/users/:user_id)
.delete(function(req, res) {
	var user = User.build();

	user.removeById(req.params.user_id, function(users) {
		if (users) {
			res.json({message: 'User removed!'});
		} else {
			res.send(401, "User not found");
		}
	}, function(error) {
		res.send("User not found");
	});
});

// Middleware to use for all REST requests
router.use(function(req, res, next) {
	// do logging
	console.log('Processing request...');
	next();
});

// ==========================================================================
// REGISTER ROUTES
// ==========================================================================
app.use('/api', router);

// ==========================================================================
// START SERVER
// ==========================================================================
app.listen(port);
console.log("Server is running on port " + port);
