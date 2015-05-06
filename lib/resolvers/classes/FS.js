var Base = require('./Base');
var Q = require('q');
var path = require('path');

function FS(decEndpoint){
    Base.call(this, decEndpoint);
    this.source = path.resolve(process.cwd(), this.source);
    this.target = path.resolve(process.cwd(), this.target);
    this.cwd = this.target;
}
FS.prototype = new Base();
FS.prototype._checkout = function (){
    var deferred = Q.defer();
    deferred.resolve();
    return deferred.promise;
};
FS.prototype._update = FS.prototype._checkout;

module.exports = FS;