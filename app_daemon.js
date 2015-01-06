/**
 * app_daemon.js
 * Starts urologyServer as a daemon
 *
 * SYNTAX:
 * node app_daemon.js start
 * node app_daemon.js stop
 */

var SERVER_FILE_NAME = "app.js";
var PROCESS_NAME = "urologyServer";
var PIDFILE_NAME = "urologyServer.pid";

var daemon = require("daemonize2").setup({
    main: SERVER_FILE_NAME,
    name: PROCESS_NAME,
    pidfile: PIDFILE_NAME
});

switch(process.argv[2]) {
    case "start":
        daemon.start();
        break;

    case "stop":
        daemon.stop();
        break;

    default:
        console.log("Usage: [start|stop]");
}