var fs = require('fs'),
    path = require('path'),
    microtime = require('microtime'),
    temp = require('temp'),
    config = require('../config');

function checkType(obj, type) {
    return Object.prototype.toString.call(obj) === "[object " + type + "]";
}
function isString(obj) {
    return checkType(obj, "String");
}
function isObject(obj) {
    return checkType(obj, "Object");
}
function deleteFolder(path) {
    var curPath;
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolder(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}

function copyRecursiveSync(src, dest) {
    var exists = fs.existsSync(src),
        stats = exists && fs.statSync(src),
        isDirectory = exists && stats.isDirectory();
    if (exists && isDirectory) {
        if(!fs.existsSync(dest)){
            fs.mkdirSync(dest);
        }
        fs.readdirSync(src).forEach(function(childItemName) {
            copyRecursiveSync(path.join(src, childItemName),
                path.join(dest, childItemName));
        });
    } else {
        if(!fs.existsSync(dest)){
            fs.linkSync(src, dest);
        }
    }
}
function getConfigEnvironment (configPath){
    return config.get(configPath);
}

module.exports = {
    isObject: isObject,
    isString: isString,
    getConfigEnvironment: getConfigEnvironment,
    getRepos: function (repos, confEnvironment) {
        var reposInNPMConfig = process.env.npm_config_repos;
        var endPointKeys;
        if(Array.isArray(repos)){
            endPointKeys = repos;
        }else if(isString(repos)){
            endPointKeys = repos.split(' ');
        }else if(typeof repos === "undefined"){
            if(reposInNPMConfig){
                endPointKeys = reposInNPMConfig.split(' ');
            }else{
                endPointKeys = Object.keys(confEnvironment || {});
            }
        }
        return  endPointKeys;
    },
    correctParentFolder: function (installed, _path, callback) {
        var source,
            keysInInstalled = Object.keys(installed),
            _key = keysInInstalled[0],
            tempFolderPath,
            info;

        if (_key) {
            source = installed[_key].canonicalDir;
            temp.track();

            tempFolderPath = '_' + microtime.now();
            info = temp.mkdirSync( tempFolderPath );

            fs.readdirSync(source).forEach(function(childItemName) {
                copyRecursiveSync(path.join(source, childItemName),
                    path.join(info, childItemName));
            });

            deleteFolder(source);

            fs.readdirSync(info).forEach(function(childItemName) {
                copyRecursiveSync(path.join(info, childItemName),
                    path.join(_path, childItemName));
            });

            callback(installed);
        }
    }
};