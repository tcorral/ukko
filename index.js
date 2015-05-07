var path = require('path');
var async = require('async');
var utils = require('./lib/utils');
var mystiquex = require('mystiquex');

var installOrUpdate = function (config) {
    if (!config) {
        throw new Error('Config object is needed to make ukko work as expected. Please review your code and fix it.');
    }
    var configPath = config.configPath;
    var repos = config.repos;
    var onEnd = config.onEnd || function () {};
    var confEnvironment = utils.getConfigEnvironment(configPath || config.data);
    var endPointKeys = utils.getRepos(repos, confEnvironment);

    async.eachSeries(endPointKeys, function (key, callback){
        var source = (confEnvironment[key].endpoint || confEnvironment[key]);
        var decEndpoint = { source: source, target: key, commands: (confEnvironment[key].commands || {}) };
        var detachedProcesses = utils.getDetachedProcesses(configPath || config.data);
        var saveReports = utils.getSaveReportFlag(configPath || config.data);
        var commandsLength = utils.getCommandsLength(configPath || config.data);
        mystiquex.getResolver(source, decEndpoint)
            .then(function (data) {
                var resolverInstance = new data.resolver(data.endpoint);
                resolverInstance.setPrefixLog('ukko');
                resolverInstance.setCommandsLength(commandsLength);
                resolverInstance.setDetachedProcesses(detachedProcesses);
                resolverInstance
                    .install(function (){
                        utils.addPathToGitIgnore(key);
                        if(!saveReports){
                            resolverInstance.removeReports();
                        }
                        callback();
                    });
            })
            .fail(function (err) {
                callback(err);
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
