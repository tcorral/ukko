var Q = require('q');
var path = require('path');
var fs = require('graceful-fs');

function checkGitRepo(source) {
    var deferred = Q.defer();
    if (/^git(\+(ssh|https?))?:\/\//i.test(source) || /\.git\/?$/i.test(source) || /^git@/i.test(source)) {
        deferred.resolve(true);
    }else{
        deferred.reject();
    }
    return deferred.promise;
}
function checkGitHubRepo(source){
    var deferred = Q.defer();
    var match;
    match = source.match(/(?:@|:\/\/)github.com[:\/]([^\/\s]+?)\/([^\/\s]+?)(?:\.git)?\/?$/i);
    if (match) {
        deferred.resolve(true);
    }else{
        deferred.reject();
    }
    return deferred.promise;
}
function checkSvnRepo(source) {
    var deferred = Q.defer();
    if (/^svn(\+(ssh|https?|file))?:\/\//i.test(source)) {
        deferred.resolve(true);
    }else{
        deferred.reject();
    }
    return deferred.promise;
}
function checkUrlRepo(source) {
    var deferred = Q.defer();
    if (/^https?:\/\//i.exec(source)) {
        deferred.resolve(true);
    }else{
        deferred.reject();
    }
    return deferred.promise;
}
function checkCVSFsRepo(source, directory) {
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
    var deferred = Q.defer();
    checkCVSFsRepo(source, '.git')
        .then(function (){
            deferred.resolve(true);
        })
        .fail(function (){
            deferred.reject();
        });
    return deferred.promise;
}
function checkSvnFsRepo(source) {
    var deferred = Q.defer();
    checkCVSFsRepo(source, '.svn')
        .then(function (){
            deferred.resolve(true);
        })
        .fail(function (){
            deferred.reject();
        });
    return deferred.promise;
}
function checkAbsolutePath(source){
    source = path.resolve(process.cwd(), source);
    var absolutePath = path.resolve(process.cwd(), source);
    var deferred = Q.defer();
    if (/^\.\.?[\/\\]/.test(source) || /^~\//.test(source) || path.normalize(source).replace(/[\/\\]+$/, '') === absolutePath) {
        deferred.resolve(true);
    }else{
        deferred.reject();
    }
    return deferred.promise;
}
function checkSimpleFsRepo(source) {
    var deferred = Q.defer();
    var absolutePath = path.resolve(process.cwd(), source);
    fs.stat(absolutePath, function (){
        deferred.resolve(true);
    });
    return deferred.promise;
}

function getRepoType(source, decEndpoint){
    var deferred = Q.defer();
    checkGitRepo(source)
        .then(function (){
            checkGitHubRepo(source)
                .then(function (){
                    deferred.resolve(['GITHUB', decEndpoint]);
                })
                .fail(function (){
                    deferred.resolve(['GIT', decEndpoint]);
                });
        })
        .fail(function (){
            checkSvnRepo(source)
                .then(function (){
                    deferred.resolve(['SVN', decEndpoint]);
                })
                .fail(function (){
                    checkUrlRepo(source)
                        .then(function (){
                            deferred.resolve(['URL', decEndpoint]);
                        })
                        .fail(function (){
                            checkAbsolutePath(source)
                                .then(function (){
                                    checkGitFsRepo(source)
                                        .then(function (){
                                            deferred.resolve(['GIT-FS', decEndpoint]);
                                        })
                                        .fail(function (){
                                            checkSvnFsRepo(source)
                                                .then(function (){
                                                    deferred.resolve(['SVN-FS', decEndpoint]);
                                                })
                                                .fail(function (){
                                                    checkSimpleFsRepo(source)
                                                        .then(function (){
                                                            deferred.resolve(['FS', decEndpoint]);
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