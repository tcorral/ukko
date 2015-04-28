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
module.exports = {
    get: function (configPath){
        var _path;
        var commonConf;
        var ukkoConf;
        var configObj;
        if(configPath && configPath.indexOf('/') === 0){
            _path = configPath
        }else{
            _path = path.join(process.cwd(), configPath || 'package.json');
        }
        try{
            configObj = require(_path)['ukko-conf'];
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