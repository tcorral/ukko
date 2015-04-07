var bower = require('bower');
var path = require('path');
var async = require('async');
var Bower = require('./lib/bower');
var utils = require('./lib/utils');
var Commands = require('./lib/commands');

var installOrUpdate = function (config){
    var configPath = config.configPath;
    var repos = config.repos;
    var force = config.force;
    var onEnd = config.onEnd || function () {};
    var detachedProcesses = { processes: [] };
    var confEnvironment = utils.getConfigEnvironment(configPath);
    var lastProcess = { _process: null };
    var correctCallbacks = [];
    var postCallbacks = [];
    var endPointKeys = utils.getRepos(repos, confEnvironment);
    require('./lib/safe-exit')(detachedProcesses, lastProcess);
    async.eachSeries(endPointKeys, function (key, callback) {
        // Execute preinstall
        Commands.execute({
            cwd: process.cwd(),
            key: key,
            detachedProcesses: detachedProcesses,
            lastProcess: lastProcess,
            commands: Commands.getPreCommands(confEnvironment[key]),
            callback: function () {
                var argumentsToBower = [];
                var _path = path.resolve(process.cwd(), key);
                var command;
                var originalKey = key;
                var settingsObj = {save: false};
                var optionsObj = {
                    interactive: false,
                    directory: key
                };
                if(force){
                    optionsObj["force-latest"] = true;
                }
                if (utils.isString(confEnvironment[key])) {
                    argumentsToBower.push([confEnvironment[key]], settingsObj, optionsObj);
                } else if (utils.isObject(confEnvironment[key])) {
                    argumentsToBower.push([confEnvironment[key].endpoint], settingsObj, optionsObj);
                }
                command = Bower.getBowerCommand(key, argumentsToBower);

                if (command === 'update') {
                    key = key.replace(/\//g, '__');
                    Bower.saveToUpdate(key);
                }
                bower.commands[command].apply(bower, argumentsToBower)
                    .on('log', function (data) {
                        var log = data && data.level && console[data.level] ? console[data.level] : console.log;
                        log(data.message);
                    })
                    .on('error', function () {
                        console.warn('error', arguments);
                    })
                    .on('end', function (installed) {
                        if(command === 'install'){
                            Bower.saveDependencies(installed, key);
                        }
                        Bower.cleanDependencies();
                        correctCallbacks.push((function (installed, _path) {
                            return function (_callback) {
                                utils.correctParentFolder(installed, _path, function () {
                                    Bower.cleanDependencies();
                                });
                                _callback();
                            };
                        }(installed, _path)));

                        postCallbacks.push.apply(postCallbacks, (function (cwd, key) {
                            return Commands.getCommandsCallbacks({
                                cwd: cwd,
                                detachedProcesses: detachedProcesses,
                                lastProcess: lastProcess,
                                commands: Commands.getPostCommands(confEnvironment[key]),
                                callback: function (_callback) {
                                    _callback();
                                }
                            });
                        }(_path, originalKey)));

                        // Follow next step.
                        callback();
                    });
            }
        });
    }, function () {
        async.series(correctCallbacks, function () {
            async.series(postCallbacks, function (){
                onEnd();
            })
        });
    });
};

module.exports = {
    installOrUpdate: installOrUpdate
};
