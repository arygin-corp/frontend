var replaceFile = require('replace-in-file');
const moment = require('moment-timezone');

var timestamp = moment(new Date()).tz('America/Chicago').format("MM/DD/YYYY hh:mm:ss Az");

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
	from: /timestamp: '(.*)'/g,
	to: "timestamp: '" + timestamp + "'",
	allowEmptyPaths: false,
};

try {
	let changedFiles = replaceFile.sync(options);
	if (changedFiles == 0) {
		throw "Please make sure that the file '" + options.files + "' has \"timestamp: ''\"";
	}
	console.log('Build timestamp is set to: ' + timestamp);
} catch (error) {
	console.error('Error occurred:', error);
	throw error
}