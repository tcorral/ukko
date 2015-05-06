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

function getConfigPath(configPath){
    var _path;
    if(configPath && configPath.indexOf('/') === 0){
        _path = configPath
    }else{
        _path = path.join(process.cwd(), configPath || 'package.json');
    }
    return _path;
}
module.exports = {
    getSaveReportFlag: function (configPath) {
        var _path = getConfigPath(configPath);
        var configObj;
        var saveReportFlag;
        try{
            configObj = require(_path)['ukko-conf'];
            saveReportFlag = configObj['save-reports'] || false;
        }catch(er){
            saveReportFlag = false
        }
        return saveReportFlag;
    },
    get: function (configPath){
        var _path;
        if(typeof configPath === 'string'){
            _path = getConfigPath(configPath);
        }
        var commonConf;
        var ukkoConf;
        var configObj;
        try{
            if(_path){
                configObj = require(_path)['ukko-conf'];
            }else{
                configObj = configPath;
            }

            commonConf = configObj['dependencies'] || {};
            ukkoConf = configObj[env] || {};
            ukkoConf = getMergedObjects(commonConf, ukkoConf);
        }catch(er){
            ukkoConf = {};
        }
        if(Object.keys(ukkoConf).length === 0){
            throw new Error('Config is missing, please check your path and/or check that your config ' +
                            'file has a proper "ukko-conf" property with your environments configuration. ' +
                            'See README.md for more information.');
        }
        return ukkoConf;
    }
};