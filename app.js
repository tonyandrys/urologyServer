/**
 * app.js - Main server config file for urologyServer
 * Tony Andrys
 */

// Database auth params
var DB_NAME = 'mapp';
var DB_USERNAME = 'root';
var DB_PASSWORD = 'AcrossinG1492';
var DB_PORT = 3306;

/* Initialize Sequelize and connect to database */
var Sequelize = require('sequelize');
var sequelize;

// TEST if async execution is the problem.. refactor with async library if successful
console.log('connectToDB()');
connectToDB(DB_NAME, DB_USERNAME, DB_PASSWORD, DB_PORT, function(err, seq) {
	if (err) throw err;
	sequelize = seq;

	// sync models next...
	console.log('syncModels()');
	syncModels(sequelize, function(err, seq) {
		if (err) throw err;
		sequelize = seq;

		// PATIENT Model
		// sequelize.define() - defines the type of data that should be stored in this model.
		var Patient = sequelize.define('patient', {
			MAPP_id: Sequelize.STRING,				// MAPP ID associated with the patient
			authcode: Sequelize.STRING,				// Authentication code used to retrieve this profile
			last_active: Sequelize.DATE 			// DATETIME of last transaction with the server
		});

		// Create & sync a new patient...
		console.log('createNewPatient()');
		createNewPatient(Patient, "#144ABCDEFGHIJKLMNOP", "1492", function(err, patient) {
			if (err) throw err;
		});


	});
});

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
			console.log('Instance NOT saved to the database: ' + err);
			callback(err);
		} else {
			console.log('Patient (MAPP_ID=' + MAPP_ID + ') instance written to database!');
			callback(null, patient);
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
				callback(err);
			} else {
				console.log('Table created!');
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





