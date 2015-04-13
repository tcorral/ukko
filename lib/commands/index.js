var utils = require('../utils');
var fs = require('fs');
var async = require('async');
var path = require('path');
var spawn = require('child_process').spawn;
var asyncHelper = require('../async-helper');

function getCommandsCallbacks(config) {
    var cwd = config.cwd,
        key = config.key,
        detachedProcesses = config.detachedProcesses,
        lastProcess = config.lastProcess,
        callbacks = asyncHelper.createArrayFunctionsAsync(function (command, cwd, callback){
            var isDetached = command.indexOf('::DETACHED::') !== -1;
            if(isDetached){
                command = command.replace('::DETACHED::', '');
            }
            var args = command.split(" ");
            var out = fs.openSync(path.join(cwd,'out.log'), 'a');
            var err = fs.openSync(path.join(cwd,'error.log'), 'a');
            var execution = spawn(args.shift(), args, {cwd: cwd, detached: true, stdio: ['ignore', out, err]});
            lastProcess._process = { command: command, cwd: cwd, pid: execution.pid };
            if(isDetached){
                execution.unref();
                detachedProcesses.processes.push({ command: command, cwd: cwd, pid: execution.pid });
            }
            execution.on('close', function (code) {
                if(code !== 0){
                    throw new Error('Something went wrong executing ' + command + ' in ' + cwd);
                }
                console.log(cwd + ' - ' + command + ' - child process exited with code ' + code);
                if(!isDetached){
                    callback();
                }
            });
            if(isDetached){
                callback();
            }
        }, config.commands, cwd, key);


    return callbacks;
}

module.exports = {
    getCommandsCallbacks: getCommandsCallbacks,
    getPreCommands: function (repo){
        var preCommands = [];
        if(utils.isObject(repo) && repo.commands && repo.commands.pre){
            if(Array.isArray(repo.commands.pre)){
                preCommands = repo.commands.pre;
            }else if(utils.isString(repo.commands.pre)) {
                preCommands = [repo.commands.pre];
            }
        }
        return preCommands;
    },
    getPostCommands: function (repo){
        var postCommands = [];
        if(utils.isObject(repo) && repo.commands){
            if(Array.isArray(repo.commands)){
                postCommands = repo.commands;
            } else if (utils.isString(repo.commands)){
                postCommands = [repo.commands];
            }else if(utils.isObject(repo.commands) && repo.commands.post){
                if(utils.isString(repo.commands.post)){
                    postCommands = [repo.commands.post];
                }else if(Array.isArray(repo.commands.post)){
                    postCommands = repo.commands.post;
                }
            }
        }
        return postCommands;
    },
    execute: function (config) {
        var arr = getCommandsCallbacks(config);
        async.series(arr, config.callback);
    }
};