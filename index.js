var path = require('path');
var async = require('async');
var utils = require('./lib/utils');
var getRepoType = require('./lib/utils/getRepoType');
var resolvers = require('./lib/resolvers');

var installOrUpdate = function (config) {
    if (!config) {
        throw new Error('Config object is needed to make ukko work as expected. Please review your code and fix it.');
    }
    var configPath = config.configPath;
    var repos = config.repos;
    var onEnd = config.onEnd || function () {};
    var detachedProcesses = {processes: []};
    var confEnvironment = utils.getConfigEnvironment(configPath || config.data);
    var lastProcess = {_process: null};
    var endPointKeys = utils.getRepos(repos, confEnvironment);
    require('./lib/safe-exit')(detachedProcesses, lastProcess);

    async.eachSeries(endPointKeys, function (key, callback){
        var decEndpoint = confEnvironment[key];
        var source = (confEnvironment[key].endpoint || confEnvironment[key]);
        getRepoType((confEnvironment[key].endpoint || confEnvironment[key]), decEndpoint)
            .then(function (resolution){
                var resolver = resolution[0];
                var decEndpoint = { source: source, target: key };
                new resolvers[resolver](decEndpoint)
                    .install(callback);
            })
            .fail(function (err){
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
