/**
 * app.js - Main server config file for urologyServer
 * Tony Andrys
 */

// Database Connection Params
var DB_NAME = 'mapp';
var DB_USERNAME = 'root';
var DB_PASSWORD = 'dbA29$';

// ==========================================================================
// BASE SETUP
// ==========================================================================

// Load in required packages
var express = require('express');
var bodyParser = require('body-parser');
var DataTypes = require('sequelize');
var crypto = require('crypto');
var Sequelize = require('sequelize');

// Initialize Express & bodyParser, configure basic server params
var app = express();
app.use(bodyParser());

var env = app.get('env') == 'development' ? 'dev' : app.get('env');
var port = process.env.PORT || 8080;

// ==========================================================================
// IMPORT MODELS
// ==========================================================================
var sequelize;

// enable dev mode for debugging, load mysql params in database.json
var env = "dev"

// FIXME: Config file does not import - hardcoded SQL connection variables as a temp fix
var config = require('./database.json')[env];
var config = config.password ? config.password : null;

// db connect
var sequelize = new Sequelize(
	DB_NAME,
	DB_USERNAME,
	DB_PASSWORD,
	{
		logging: console.log,
		define: {
			timestamps: false
		}
	}
);

// Define PATIENT Model
var Patient = sequelize.define('patient', {
	mapp_id: Sequelize.STRING,				// MAPP ID associated with the patient
	authcode: Sequelize.STRING,				// Authentication code used to retrieve this profile
	last_active: Sequelize.DATE 			// DATETIME of last transaction with the server
}, {
	instanceMethods: {
		retrieveAll: function(onSuccess, onError) {
			Patient.findAll({}, {raw: true})
			.success(onSuccess).error(onError);
		},
		retrieveById: function(patient_id, onSuccess, onError) {
			Patient.find({where: {id: patient_id}}, {raw: true})
			.success(onSuccess).error(onError);
		},
		add: function(onSuccess, onError) {
			var mapp_id = this.mapp_id;
			var authcode = this.authcode;
			var last_active = sequelize.fn('NOW');
			Patient.build({mapp_id: mapp_id, authcode: authcode, last_active: last_active})
				.save()
				.success(onSuccess).error(onError);
		},
		updateById: function(patient_id, onSuccess, onError) {
			var id = patient_id;
			var mapp_id = this.mapp_id;
			var authcode = this.authcode;
			var last_active = this.last_active;
			Patient.update({mapp_id: mapp_id, authcode: authcode, last_active:last_active}, {where: {id: id}})
				.success(onSuccess).error(onError);
		},
		removeById: function(patient_id, onSuccess, onError) {
			Patient.destroy({where: {id: patient_id}})
				.success(onSuccess).error(onError);
		}
	}
});

// SURVEY Model
var Submission = sequelize.define('submission', {
	survey_start: Sequelize.DATE,
	survey_end: Sequelize.DATE,
	pain_overall: Sequelize.INTEGER,
	area_head: Sequelize.INTEGER,
	area_body: Sequelize.INTEGER,
	area_perineum: Sequelize.INTEGER,
	area_le: Sequelize.INTEGER,
	area_ue: Sequelize.INTEGER,
	area_back: Sequelize.INTEGER,
	bother_value: Sequelize.INTEGER,
	urinary_question: Sequelize.BOOLEAN,
	urinary_pain: Sequelize.INTEGER,
	urinary_frequency: Sequelize.INTEGER,
	urinary_urgency: Sequelize.INTEGER,
	urinary_incontinence: Sequelize.INTEGER,
	urinary_slow_stream: Sequelize.INTEGER,
	stress_value: Sequelize.INTEGER,
	location: Sequelize.STRING,
}, {
	instanceMethods: {
		retrieveAll: function(onSuccess, onError) {
			Submission.findAll({}, {raw:true})
			.success(onSuccess).error(onError);
		},
		retrieveByMappId: function(mapp_id, onSuccess, onError) {
			Submission.find({where: {mapp_id: mapp_id}}, {raw:true})
			.success(onSuccess).error(onError);
		},
		add: function(onSuccess, onError) {
			var survey_start = this.survey_start;
			var survey_end = this.survey_end;
			var pain_overall = this.pain_overall;
			var area_head = this.area_head;
			var area_body = this.area_body;
			var area_perineum = this.area_perineum;
			var area_le = this.area_le;
			var area_ue = this.area_ue;
			var area_back = this.area_back;
			var bother_value = this.bother_value;
			var urinary_question = this.urinary_question;
			var urinary_pain = this.urinary_pain;
			var urinary_incontinence = this.urinary_incontinence;
			var urinary_urgency = this.urinary_urgency;
			var urinary_slow_stream = this.urinary_slow_stream;
			var stress_value = this.stress_value;
			var location = this.location;
			Submission.build({
				survey_start: survey_start,
				survey_end: survey_end,
				pain_overall: pain_overall, 
				area_head: area_head,
				area_body: area_body,
				area_perineum: area_perineum,
				area_le: area_le,
				area_ue: area_ue,
				area_back: area_back,
				bother_value: bother_value,
				urinary_question: urinary_question,
				urinary_pain: urinary_pain,
				urinary_incontinence: urinary_incontinence,
				urinary_urgency: urinary_urgency,
				urinary_slow_stream: urinary_slow_stream,
				stress_value: stress_value,
				location: location
			})
			.save().success(onSuccess).error(onError);
		}
	}
}); 


// ==========================================================================
// IMPORT ROUTES
// ==========================================================================
var router = express.Router();

/**
 * ROUTES: /submissions
 **/

 // Returns all Submissions in the database
router.route('/submissions')
.get(function(req, res) {
	var submission = Submission.build();
	var submissions = submission.retrieveAll(function(submissions) {
		if (submissions) {
			res.json(submissions);
		} else {
			res.send(401, "ERROR: No submissions in the database.");
		}
	});
})

/**
 * ROUTES: /submissions/:mapp_id
 **/
router.route('/submissions/:mapp_id')
.get(function(req, res) {
	var submission = Submission.build();
	// FIXME: This doesn't search correctly.
	submission.retrieveByMappId(req.params.mapp_id, function(submissions) {
		if (submissions) {
			res.json(submissions);
		} else {
			res.send(401, "No submissions match MAPP ID.");
		}
	}, function(error) {
		res.send("No submissions found.");
	});
});

/**
 * ROUTES: /patients
 **/
router.route('/patients')

// Create a new Patient
// POST -> http://localhost:8080/api/patients
.post(function(req, res) {

	// BodyParser automagically pulls these out of the JSON
	var mapp_id = req.body.mapp_id;
	var authcode = req.body.authcode;

	// Build a new Patient instance 
	var patient = Patient.build({mapp_id: mapp_id, authcode: authcode, last_active: null});

	// pass it to the Patient.add() method to be written to the db
	patient.add(function(success) {
		res.json({message: 'New Patient created!'});
	},
	function(err) {
		res.send(err);
	});
})

// Returns all Patients in the database
// GET -> http://localhost:8080/api/patients
.get(function(req, res) {
	var patient = Patient.build();
	var patients = patient.retrieveAll(function(patients) {
		if (patients) {
			res.json(patients);
		} else {
			res.send(401, "ERROR: No patients in the database.");
		}
	});
})

/**
 * ROUTES: /patients/:patient_id
 **/
router.route('/patients/:patient_id')

// Returns a Patient by ID
// GET -> http://localhost:8080/api/patients/:patient_id
.get(function(req, res) {
	var patient = Patient.build();
	patient.retrieveById(req.params.patient_id, function(patients) {
		if (patients) {
			res.json(patients);
		} else {
			res.send(401, "Patient not found.");
		}
	}, function(error) {
		res.send("Patient not found.");
	})
})

// Update a Patient by ID
// PUT -> http://localhost:8080/api/patients/:patient_id
.put(function(req, res) {
	var patient = Patient.build();

	patient.mapp_id = req.body.mapp_id;
	patient.authcode = req.body.authcode;

	patient.updateById(req.body.patient_id, function(success) {
		console.log(success);
		if (success) {
			res.json({message: 'Patient updated!'});
		} else {
			res.send(401, 'ERROR: Patient not found.');
		}
	}, function(error) {
		res.send("ERROR: Patient not found.");
	})
})

.delete(function(req, res) {
	var patient = Patient.build();

	patient.removeById(req.params.patient_id, function(patients) {
		if (patients) {
			res.json({message: 'Patient removed!'});
		} else {
			res.send(401, 'ERROR: Patient not found.');
		}
	}, function(error) {
		res.send('Patient not found.');
	})
})

// Middleware to use for all REST requests
router.use(function(req, res, next) {
	// log to console, then handle next request
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





























/**
 * Constructs a new Patient instance and syncs it to the database.
 * @param  {Patient}  Patient  [Object schema defined using sequelize.define()]
 * @param  {[type]}   MAPP_ID  [MAPP patient identifier]
 * @param  {[type]}   authcode [authcode/password]
 * @param  {Function} callback [created instance of Patient on success]
 */
function createNewPatient(Patient, MAPP_ID, authcode, callback) {
	
	// define Patient object
	var patient = Patient.build({
		MAPP_id: MAPP_ID,
		authcode: authcode,
		last_active: sequelize.fn('NOW')
	});

	// sync changes to database
	patient
	.save()
	.complete(function(err) {
		if (!!err) {
			console.log('ERROR: Instance NOT saved to the database: ' + err);
			callback(err);
		} else {
			callback(null, patient);
		}
	})
}

/**
 * Creates a fake submission for testing purposes only
 * FIXME: Remove 
 */
function createNewSubmission(Submission, callback) {
	var submission = Submission.build({
		survey_start: sequelize.fn('NOW'),
		survey_end: sequelize.fn('NOW'),
		pain_overall: 1,
		area_head: 1,
		area_body: 1,
		area_perineum: 1,
		area_le: 1,
		area_ue: 1,
		area_back: 1,
		bother_value: 1,
		urinary_question: true,
		urinary_pain: 9,
		urinary_frequency: 9,
		urinary_urgency: 9,
		urinary_incontinence: 9,
		urinary_slow_stream: 9,
		stress_value: 9,
		location: 'Home'
	});

	submission
	.save()
	.complete(function(err) {
		if (!!err) {
			console.log("ERROR: Submission instance NOT saved to database: " + err);
			callback(err);
		} else {
			callback(null, submission);
		}
	})
}

/**
 * Synchronizes data models defined in the sequelize instance (sequelize.define()) with the database.
 * @param  {[Sequelize]} sequelize [sequelize instance]
 * @param  {Function}    callback  [synchronized sequelize instance on success]
 */
function syncModels(sequelize, callback) {
	sequelize
		.sync({force: true})	// force=true removes all existing tables and recreates them
		.complete(function(err) {
			if (!!err) {
				console.log('ERROR: Models could not be synchronized!');
				callback(err);
			} else {
				callback(null, sequelize);
			}
		})
}

/**
 * Attempts to connect to the MySQL database.
 * @param  {[String]} db_name     [name of database]
 * @param  {[String]} db_username [MySQL user to connect as]
 * @param  {[String]} db_password [password for MySQL user]
 * @param  {[Number]} port        [port MySQL db is listening on]
 * @param  {Function} callback    [connected sequelize instance on success]
 */
function connectToDB(db_name, db_username, db_password, port, callback) {
	var sequelize = new Sequelize(db_name, db_username, db_password, {
		dialect: 'mysql',
		port: port,
		logging: console.log,
		define: {
			timestamps: false
		}
	});

	sequelize
	.authenticate()
	.complete(function(err) {
		if (!!err) {
			callback(err);
		} else {
			callback(null, sequelize);
		}
	})
}





