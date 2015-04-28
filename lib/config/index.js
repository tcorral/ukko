var path = require('path');
var env = process.env.NODE_ENV || (process.env.npm_config_production ? "production" : "development");

module.exports = {
    get: function (configPath){
        var _path;
        var ukkoConf;
        if(configPath && configPath.indexOf('/') === 0){
            _path = configPath
        }else{
            _path = path.join(process.cwd(), configPath || 'package.json');
        }
        try{
            ukkoConf = require(_path)['ukko-conf'][env];
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