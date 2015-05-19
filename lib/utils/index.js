var fs = require('fs'),
    path = require('path'),
    temp = require('temp'),
    config = require('../config');

function checkType(obj, type) {
    return Object.prototype.toString.call(obj) === "[object " + type + "]";
}
function isString(obj) {
    return checkType(obj, "String");
}
function isObject(obj) {
    return checkType(obj, "Object");
}
function deleteFolder(path) {
    var curPath;
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolder(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}

function copyRecursiveSync(src, dest) {
    var exists = fs.existsSync(src),
        stats = exists && fs.statSync(src),
        isDirectory = exists && stats.isDirectory();
    if (exists && isDirectory) {
        if(!fs.existsSync(dest)){
            fs.mkdirSync(dest);
        }
        fs.readdirSync(src).forEach(function(childItemName) {
            copyRecursiveSync(path.join(src, childItemName),
                path.join(dest, childItemName));
        });
    } else {
        if(!fs.existsSync(dest)){
            fs.linkSync(src, dest);
        }
    }
}

function getConfigEnvironment (configPath){
    return config.get(configPath);
}

function getSaveReportFlag(configPath){
    return config.getSaveReportFlag(configPath);
}

function getDetachedProcesses(configPath){
    return config.getDetachedProcesses(configPath);
}

function addPathToGitIgnore(_path){
    var stats = fs.statSync(path.join(process.cwd(), '.git'));
    var gitIgnorePath;
    var contents = '';
    var lines;
    var matches;
    if(stats.isDirectory()){
        gitIgnorePath = path.join(process.cwd(), '.gitignore');

        try{
            contents = fs.readFileSync(gitIgnorePath, 'utf-8');
        }catch(er){}

        lines = contents.split('\r\n');
        matches = lines.filter(function (line) {
            return line === _path;
        });
        if(matches.length === 0){
            lines.push(_path);
        }
        fs.writeFileSync(gitIgnorePath, lines.join('\r\n'));
    }
}

function getCommandsLength(configPath){
    return config.getCommands(configPath)
        .then(function (commands){
            return commands.length;
        });
}

module.exports = {
    isObject: isObject,
    isString: isString,
    getCommandsLength: getCommandsLength,
    getSaveReportFlag: getSaveReportFlag,
    getDetachedProcesses: getDetachedProcesses,
    getConfigEnvironment: getConfigEnvironment,
    addPathToGitIgnore: addPathToGitIgnore,
    getConfig: function (config){
        var pathOrData = config.configPath || config.data || 'package.json';
        return pathOrData;
    },
    getRepos: function (repos, confEnvironment) {
        var reposInNPMConfig = process.env.npm_config_repos;
        var endPointKeys;
        if(Array.isArray(repos)){
            endPointKeys = repos;
        }else if(isString(repos)){
            endPointKeys = repos.split(' ');
        }else if(typeof repos === "undefined"){
            if(reposInNPMConfig){
                endPointKeys = reposInNPMConfig.split(' ');
            }else{
                endPointKeys = Object.keys(confEnvironment || {});
            }
        }
        return  endPointKeys;
    }
};