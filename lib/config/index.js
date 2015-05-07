var path = require('path');
var env = process.env.NODE_ENV || (process.env.npm_config_production ? "production" : "development");
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
    var _path;
    if(typeof configPath === 'string'){
        _path = getConfigPath(configPath);
    }
    var configObj;
    try{
        if(_path){
            configObj = require(_path)['ukko-conf'];
        }else{
            configObj = configPath;
        }
    }catch(er){
        configObj = {}
    }
    return configObj;
}

function getConfigPath(configPath){
    var _path;
    if(configPath && configPath.indexOf('/') === 0){
        _path = configPath
    }else{
        _path = path.join(process.cwd(), configPath || 'package.json');
    }
    return _path;
}

function getSaveReportFlag(configPath) {
    var ukkoConf = getConfigObject(configPath);
    return (ukkoConf['save-report'] || false);
}
function getDetachedProcesses(configPath){
    var ukkoConf = getConfigObject(configPath);
    return (ukkoConf['detached-processes'] || []);
}

function getCommands(configPath) {
    var ukkoConf = get(configPath);
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
}

function get(configPath){
    var configObj = getConfigObject(configPath);
    var commonConf = configObj['dependencies'] || {};
    var envConf = configObj[env] || {};
    var ukkoConf = getMergedObjects(commonConf, envConf);
    if(Object.keys(ukkoConf).length === 0){
        throw new Error('Config is missing, please check your path and/or check that your config ' +
            'file has a proper "ukko-conf" property with your environments configuration. ' +
            'See README.md for more information.');
    }

    return ukkoConf;
}

module.exports = {
    getCommands: getCommands,
    getDetachedProcesses: getDetachedProcesses,
    getSaveReportFlag: getSaveReportFlag,
    get: get
};