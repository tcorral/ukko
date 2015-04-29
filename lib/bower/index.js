var fs = require('fs');
var path = require('path');
var bowerJsonPath = path.join(process.cwd(),  'bower.json');

var getInstalledData = function (_path) {
    return JSON.parse(fs.readFileSync((_path || bowerJsonPath)));
};
var getDependencyNames = function () {
    return Object.keys(getInstalledData().installed || {});
};

module.exports = {
    getInstalledData: getInstalledData,
    getBowerCommand: function (_key, argumentsToInstall){
        var dependencyNames  = getDependencyNames();
        var command = 'install';
        _key = _key.replace(/\//g, '__');
        if(dependencyNames.indexOf(_key) !== -1){
            command = 'update';
            argumentsToInstall.shift(); // Check what bower update does seems that is something wrong when updating.
                                        // It creates all the repos inside each dependency in bower.json
            argumentsToInstall.unshift([_key]);
        }
        return command;
    },
    saveDependencies: function (installed, key, configPath){
        var installedData = getInstalledData(configPath);
        var keysInInstalled = Object.keys(installed);
        var _key = keysInInstalled[0];
        installedData.installed = installedData.installed || {};
        if (_key) {
            installedData.installed[key.replace(/\//g, '__')] = installed[_key].endpoint.source;
        }
        fs.writeFileSync((configPath || bowerJsonPath), JSON.stringify(installedData, null, '    '));
    },
    saveToUpdate: function (key){
        var installedData = getInstalledData();
        installedData.dependencies = {};
        key = key.replace(/\//g, '__');
        installedData.dependencies[key] = installedData.installed[key];
        fs.writeFileSync(bowerJsonPath, JSON.stringify(installedData, null, '    '));
    },
    cleanDependencies: function () {
        var installedData = getInstalledData();
        delete installedData.dependencies;
        fs.writeFileSync(bowerJsonPath, JSON.stringify(installedData, null, '    '));
    }
};