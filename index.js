var path = require('path');
var fs = require('fs');
var async = require('async');
var utils = require('./lib/utils');
var mystiquex = require('mystiquex');
var errors = require('./lib/errors');

var installOrUpdate = function (config) {
    if (!config) {
        console.log(errors.configObjectMissing);
        throw new Error(errors.configObjectMissing);
    }
    var repos = config.repos;
    var onEnd = config.onEnd || function () {};
    var confEnvironment = utils.getConfigEnvironment(utils.getConfig(config));
    var endPointKeys = utils.getRepos(repos, confEnvironment);

    if (!confEnvironment || endPointKeys.length === 0) {
        console.log(errors.wrongConfig);
        throw new Error(errors.wrongConfig);
    }

    async.eachSeries(endPointKeys, function (key, callback){
        console.log('Checking ' + key + ' endpoint');
        var source = (confEnvironment[key].endpoint || confEnvironment[key]);
        var decEndpoint = { source: source, target: key, commands: (confEnvironment[key].commands || {}), "testAuth": confEnvironment[key].testAuth };
        var detachedProcesses = utils.getDetachedProcesses(utils.getConfig(config));
        var saveReports = utils.getSaveReportFlag(utils.getConfig(config));
        var commandsLength = utils.getCommandsLength(utils.getConfig(config));
        var target = path.resolve(process.cwd(), key);
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
