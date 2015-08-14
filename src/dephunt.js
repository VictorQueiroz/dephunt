var _ 		= require('lodash');
var fs	 	= require('fs');
var path 	= require('path');

function getAllVendorFiles(bower, options) {
  if(_.isUndefined(options)) {
    options = {};
  }

  var dependencies = bower.dependencies;
  var bowerDir = path.join(path.dirname(__dirname), 'bower_components');
  var bowerRc = fs.existsSync('./.bowerrc') && JSON.parse(fs.readFileSync('./.bowerrc'));

  if(_.has(bowerRc, 'directory') && _.isString(bowerRc.directory)) {
    bowerDir = bowerRc.directory;
  }

  var vendorFiles = [];

  _.forEach(dependencies, function (value, key) {
    var dependencyDir = path.resolve(bowerDir, key);
    var bowerConfig = require(path.resolve(dependencyDir, 'bower.json'));
    var mainFile = bowerConfig.main;
    if(!mainFile) {
      return;
    }

    function resolveMainFile (file){
      return path.resolve(dependencyDir, file);
    }

    mainFile = _.isArray(mainFile) ? _.map(mainFile, resolveMainFile) : resolveMainFile(mainFile);

    if(_.isArray(mainFile)) {
      _.forEach(mainFile, function (file, index) {
        if(file.indexOf('*') > -1) {
          mainFile = mainFile.concat(glob.sync(file));
          mainFile.splice(index, 1);
        }
      });
    }

    vendorFiles = vendorFiles.concat(mainFile);
  });

  return !_.isEmpty(options) && _.filter(vendorFiles, function (mainFile) {
    if(options.ignore) {
      return _.every(options.ignore, function (regexp) {
        return !regexp.test(mainFile);
      });
    }
    return true;
  }) || vendorFiles;
}

var defaults = {
	bowerPath: path.join(process.cwd(), 'bower.json')
};

function readBower (bowerPath, options) {
	options = options || {};

	_.defaults(options, defaults);

	/**
	 * If the user provides us
	 * a bower file, put it into
	 * the options
	 */
	if(bowerPath) {
		options.bowerPath = bowerPath;
	}

	var vendorFiles = getAllVendorFiles(JSON.parse(fs.readFileSync(options.bowerPath)));

	vendorFiles = _.map(vendorFiles, (_.isFunction(options.path) && options.path) || function (vendorFile) {
		return vendorFile.replace(`${process.cwd()}/`, '');
	});

	return vendorFiles;
}

module.exports = readBower;