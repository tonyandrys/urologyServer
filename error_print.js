/**
 * error_print.js
 * A node module that lives to print errors in a noticable way. 
 * Tony Andrys
 */

/**
 * Prints an error message in a centered box of asterisks, just like the ol' days (when I was 2).
 * @param  {String} error_msg message to print
 * @param  {Function} callback  formatted message ready to shove into stdout
 */

module.exports.box = function(error_msg, callback) {
	if (error_msg < 1) {
		callback("error_print.js: Cannot print a zero length error_message.");
	} else {
		// build borders (note: top border == bottom border, 4 chars longer than error_msg for padding)
		var border = ""; 
		for (i=0; i<(error_msg.length + 4); i++) {
			border += '*';
		}
		// build & send to callback
		callback(null, (border + '\n\n' + '* ' + error_msg + ' *' + '\n' + border + '\n\n'));
	}
}