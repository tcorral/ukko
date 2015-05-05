var path = require('path');
var async = require('async');
var utils = require('./lib/utils');
var validLink = require('./lib/utils/checkLink');
var createLink = require('./lib/utils/createLink');

var installOrUpdate = function (config) {
    if (!config) {
        throw new Error('Config object is needed to make ukko work as expected. Please review your code and fix it.');
    }
    var configPath = config.configPath;
    var repos = config.repos;
    var onEnd = config.onEnd || function () {};
    var detachedProcesses = {processes: []};
    var confEnvironment = utils.getConfigEnvironment(configPath);
    var lastProcess = {_process: null};
    var endPointKeys = utils.getRepos(repos, confEnvironment);
    require('./lib/safe-exit')(detachedProcesses, lastProcess);

    async.eachSeries(endPointKeys, function (key, callback){
        var source = path.resolve(process.cwd(), (confEnvironment[key].endpoint || confEnvironment[key]));
        var target = path.resolve(process.cwd(), key);
        validLink(target)
            .then(function (result){
                console.log('source:' + source, 'target:' + target);
                if(result[0] === false){
                    createLink(source, target).then(function (){
                        callback();
                    });
                }else{
                    callback();
                }

            });
    }, function (err){
        if(err){
            throw err;
        }
        onEnd();
    });
};

module.exports = {
    installOrUpdate: installOrUpdate
};
