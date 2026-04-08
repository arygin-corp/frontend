var replaceFile = require('replace-in-file');
var package = require("./../package.json");

var engineer = package.Engineer ;

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
	from: /engineer: '(.*)'/g,
	to: "engineer: '" + engineer + "'",
	allowEmptyPaths: false,
};

try {
	let changedFiles = replaceFile.sync(options);
	if (changedFiles == 0) {
		throw "Please make sure that the file '" + options.files + "' has \"engineer: ''\"";
	}
	console.log('Engineer: ' + engineer);
} catch (error) {
	console.error('Error occurred:', error);
	throw error
}