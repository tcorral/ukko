var Q = require('q');
var path = require('path');
var fs = require('graceful-fs');

function checkGitRepo(source) {
    console.log('Checking git repo in: ' + source);
    var deferred = Q.defer();
    if (/^git(\+(ssh|https?))?:\/\//i.test(source) || /\.git\/?$/i.test(source) || /^git@/i.test(source)) {
        console.log('Is a git repo in: ' + source);
        deferred.resolve(true);
    }else{
        console.log('Is not a git repo in: ' + source);
        deferred.reject();
    }
    return deferred.promise;
}
function checkGitHubRepo(source){
    console.log('Checking github repo in: ' + source);
    var deferred = Q.defer();
    var match;
    match = source.match(/(?:@|:\/\/)github.com[:\/]([^\/\s]+?)\/([^\/\s]+?)(?:\.git)?\/?$/i);
    if (match) {
        console.log('Is a github repo in: ' + source);
        deferred.resolve(true);
    }else{
        console.log('Is not a git repo in: ' + source);
        deferred.reject();
    }
    return deferred.promise;
}
function checkSvnRepo(source) {
    console.log('Checking svn repo in: ' + source);
    var deferred = Q.defer();
    if (/^svn(\+(ssh|https?|file))?:\/\//i.test(source)) {
        console.log('Is a svn repo in: ' + source);
        deferred.resolve(true);
    }else{
        console.log('Is not a svn repo in: ' + source);
        deferred.reject();
    }
    return deferred.promise;
}
function checkUrlRepo(source) {
    console.log('Checking url repo in: ' + source);
    var deferred = Q.defer();
    if (/^https?:\/\//i.exec(source)) {
        console.log('Is a url repo in: ' + source);
        deferred.resolve(true);
    }else{
        console.log('Is not a url repo in: ' + source);
        deferred.reject();
    }
    return deferred.promise;
}
function checkCVSFsRepo(source, directory) {
    console.log(source, directory);
    var absolutePath = path.resolve(process.cwd(), source);
    var deferred = Q.defer();
    fs.stat(path.join(absolutePath, directory), function (stats){
        try{
            if(stats.isDirectory()) {
                deferred.resolve(true);
            }else{
                deferred.reject();
            }
        }catch(er){
            deferred.reject();
        }
    });

    return deferred.promise;
}
function checkGitFsRepo(source) {
    console.log('Checking git-fs repo in: ' + source);
    var deferred = Q.defer();
    checkCVSFsRepo(source, '.git')
        .then(function (){
            console.log('Is a git-fs repo in: ' + source);
            deferred.resolve(true);
        })
        .fail(function (){
            console.log('Is not a git-fs repo in: ' + source);
            deferred.reject();
        });
    return deferred.promise;
}
function checkSvnFsRepo(source) {
    console.log('Checking svn-fs repo in: ' + source);
    var deferred = Q.defer();
    checkCVSFsRepo(source, '.svn')
        .then(function (){
            console.log('Is a svn-fs repo in: ' + source);
            deferred.resolve(true);
        })
        .fail(function (){
            console.log('Is not a svn-fs repo in: ' + source);
            deferred.reject();
        });
    return deferred.promise;
}
function checkAbsolutePath(source){
    source = path.resolve(process.cwd(), source);
    var absolutePath = path.resolve(process.cwd(), source);
    console.log('Checking absolute path repo in: ' + source);
    var deferred = Q.defer();
    if (/^\.\.?[\/\\]/.test(source) || /^~\//.test(source) || path.normalize(source).replace(/[\/\\]+$/, '') === absolutePath) {
        console.log('Is an absolute path repo in: ' + source);
        deferred.resolve(true);
    }else{
        console.log('Is not an absolute path repo in: ' + source);
        deferred.reject();
    }
    return deferred.promise;
}
function checkSimpleFsRepo(source) {
    console.log('Checking simple fs repo in: ' + source);
    var deferred = Q.defer();
    var absolutePath = path.resolve(process.cwd(), source);
    fs.stat(absolutePath, function (){
        console.log('Is a simple fs repo in: ' + source);
        deferred.resolve(true);
    });
    return deferred.promise;
}

function getRepoType(source){
    var deferred = Q.defer();
    checkGitRepo(source)
        .then(function (){
            checkGitHubRepo(source)
                .then(function (){
                    deferred.resolve('GITHUB');
                })
                .fail(function (){
                    deferred.resolve('GIT');
                });
        })
        .fail(function (){
            checkSvnRepo(source)
                .then(function (){
                    deferred.resolve('SVN');
                })
                .fail(function (){
                    checkUrlRepo(source)
                        .then(function (){
                            deferred.resolve('URL');
                        })
                        .fail(function (){
                            checkAbsolutePath(source)
                                .then(function (){
                                    checkGitFsRepo(source)
                                        .then(function (){
                                            deferred.resolve('GIT-FS');
                                        })
                                        .fail(function (){
                                            checkSvnFsRepo(source)
                                                .then(function (){
                                                    deferred.resolve('SVN-FS');
                                                })
                                                .fail(function (){
                                                    checkSimpleFsRepo(source)
                                                        .then(function (){
                                                            deferred.resolve('FS');
                                                        });
                                                });
                                        });
                                })
                                .fail(function (){
                                    deferred.reject(new Error('Not an absolute or relative fail'))
                                });
                        });
                });
        });

    return deferred.promise;
}

module.exports = getRepoType;