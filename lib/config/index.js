var path = require('path');
var url = require('url');
var request = require('request');
var Q = require('q');
var env = process.env.NODE_ENV || (process.env.npm_config_production ? "production" : "development");
var errors = require('../errors');
var acceptedProtocols = [ 'http:', 'https:', 'ftp:'];

function getMergedObjects(){
    var oMerged = {};
    var args = Array.prototype.splice.call(arguments, 0);
    args.forEach(function (source){
        var key;
        for(key in source){
            if(source.hasOwnProperty(key)){
                oMerged[key] = source[key];
            }
        }
    });
    return oMerged;
}

function getConfigObject(configPath) {
    var deferred = Q.defer();
    var urlParts;
    var _path;
    if(typeof configPath === 'string'){
        _path = getConfigPath(configPath);
    }
    try{
        if(_path){
            urlParts = url.parse(_path);
            if(acceptedProtocols.indexOf(urlParts.protocol) !== -1){
                request(_path, function (error, response, body){
                    if (!error && response.statusCode == 200) {
                        return deferred.resolve(JSON.parse(body)['ukko-conf']);
                    }
                    deferred.resolve({});
                });
            }else{
                deferred.resolve(require(_path)['ukko-conf']);
            }
        }else{
            deferred.resolve(configPath);
        }
    }catch(er){
        deferred.resolve({});
    }
    return deferred.promise;
}

function getConfigPath(configPath){
    var _path;
    var urlParts = url.parse(configPath);
    if(acceptedProtocols.indexOf(urlParts.protocol) === -1){
        if(configPath && configPath.indexOf('/') === 0){
            _path = configPath;
        }else{
            _path = path.join(process.cwd(), configPath || 'package.json');
        }
    }else{
        _path = configPath;
    }
    return _path;
}

function getSaveReportFlag(configPath) {
    return getConfigObject(configPath)
        .then(function (ukkoConf){
            return (ukkoConf['save-report'] || false);
        });
}
function getDetachedProcesses(configPath){
    return getConfigObject(configPath)
        .then(function (ukkoConf){
            return (ukkoConf['detached-processes'] || []);
        });
}

function getCommands(configPath) {
    return get(configPath)
        .then(function (ukkoConf){
            var commands = [];
            var _commands;
            var iterationCommands;
            var key;
            for(key in ukkoConf){
                if(ukkoConf.hasOwnProperty(key)){
                    _commands = ukkoConf[key].commands;
                    iterationCommands = [];
                    if(_commands){
                        if(_commands.pre){
                            iterationCommands.push.apply(iterationCommands, _commands.pre);
                        }
                        if(_commands.post) {
                            iterationCommands.push.apply(iterationCommands, _commands.post);
                        }
                        if(iterationCommands.length === 0 && _commands.length > 0) {
                            iterationCommands.push.apply(iterationCommands, _commands);
                        }
                    }
                    commands.push.apply(commands, iterationCommands);
                }
            }
            return commands;
        });
}

function get(configPath){
    return getConfigObject(configPath)
        .then(function (configObj){
            if(Object.keys(configObj).length === 0){
                console.log(errors.configObjectMissing);
                throw new Error(errors.configObjectMissing);
            }
            var commonConf = configObj['dependencies'] || {};
            var envConf = configObj[env] || {};
            var ukkoConf = getMergedObjects(commonConf, envConf);
            if(Object.keys(ukkoConf).length === 0){
                console.log(errors.configMissing);
                throw new Error(errors.configMissing);
            }
            return ukkoConf;
        });
}

module.exports = {
    getCommands: getCommands,
    getDetachedProcesses: getDetachedProcesses,
    getSaveReportFlag: getSaveReportFlag,
    get: get
};