var replaceFile = require('replace-in-file');
var package = require("./package.json");
const moment = require('moment-timezone');

var timestamp = moment(new Date()).tz('America/Chicago').format("MMDDYYYYhhmmssAz");
var buildVersion = package.version;

const options = {
	files: [
		'src/environments/environment.ts',
		'src/environments/environment.local.ts',
		'src/environments/environment.demo.ts',
		'src/environments/environment.dev.ts',
		'src/environments/environment.qa.ts',
		'src/environments/environment.stage.ts',
		'src/environments/environment.prod.ts'
	],
	from: /version: '(.*)'/g,
	to: "version: '"+ buildVersion + "'",
	allowEmptyPaths: false,
};

const options2 = {
	files: [
		'src/environments/environment.ts',
		'src/environments/environment.local.ts',
		'src/environments/environment.demo.ts',
		'src/environments/environment.dev.ts',
		'src/environments/environment.qa.ts',
		'src/environments/environment.stage.ts',
		'src/environments/environment.prod.ts'
	],
	from: /timestamp: '(.*)'/g,
	to: "timestamp: '"+ timestamp + "'",
	allowEmptyPaths: false,
};

try {
	let changeFiles = replaceFile.sync(options, options2);
	 if (changeFiles == 0) {
		throw "Please make sure file have version";
	 }
	console.log('Build version set: ' + buildVersion);
	console.log('Timestamp set: ' + timestamp);
}
catch (error) {
	console.error('Error occurred:', error);
	throw error
}