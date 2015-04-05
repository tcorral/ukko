var path = require('path');
var env = process.env.NODE_ENV || (process.env.npm_config_production ? "production" : "development");

module.exports = {
    get: function (configPath){
        var _path = path.join(process.cwd(), configPath || 'package.json');
        var ukkoConf = require(_path)['ukko-conf'];
        return ukkoConf ? ukkoConf[env] : {};
    }
};