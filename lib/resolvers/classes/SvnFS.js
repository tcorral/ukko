var FS = require('./FS');
var Q = require('q');
var cmd = require('../../utils/cmd');
var svnInfo = require('svn-info');
var which = require('which');
var hasSvn;

try{
    which.sync('svn');
    hasSvn = true
}catch(er){
    hasSvn = false;
}


var SvnFS = function (decEndpoint){
    FS.call(this, decEndpoint);
};
SvnFS.prototype = new FS();
SvnFS.prototype._update = function (){
    if(!hasSvn){
        throw new Error('svn is not installed or not in the PATH');
    }
    var deferred = Q.defer();
    console.log(this.source);
    svnInfo(this.source, function (err, info){
        if(err){
            return deferred.reject(err);
        }
        cmd('svn', ['checkout', info.url])
            .then(function (){
                deferred.resolve();
            });
    });

    return deferred.promise;
};

module.exports = SvnFS;