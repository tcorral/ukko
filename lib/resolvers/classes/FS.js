var Base = require('./Base');
var Q = require('q');
var path = require('path');
var createLink = require('../../utils/createLink');

function FS(decEndpoint){
    if(decEndpoint){
        Base.call(this, decEndpoint);
        this.source = path.resolve(process.cwd(), this.source);
        this.target = path.resolve(process.cwd(), this.target);
        this.cwd = this.target;
    }
}
FS.prototype = new Base();
FS.prototype.createLink = function (callback){
    return createLink(this.source, this.target)
        .then(function (){
            callback();
        })
        .fail(function (er){
            console.log(er);
        })
};
FS.prototype._checkout = function (){
    var deferred = Q.defer();
    deferred.resolve();
    return deferred.promise;
};
FS.prototype._update = FS.prototype._checkout;

module.exports = FS;