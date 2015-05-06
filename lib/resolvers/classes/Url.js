var Base = require('./Base');
var Q = require('q');
var path = require('path');
var temp = require('temp');
var request = require('request');
var fs = require('graceful-fs');
var extract = require('../../utils/extract');

temp.track();

function Url(decEndpoint) {
    Base.call(this, decEndpoint);
    this.target = path.resolve(process.cwd(), this.target);
}
Url.prototype = new Base();

Url.prototype._createTempDir = function (url){
    var deferred = Q.defer();
    temp.mkdir('storage', function(err, dirPath) {
        if(err){
            return deferred.reject(err);
        }
        deferred.resolve({
            dirPath: dirPath,
            url: url
        });
    });
    return deferred.promise;
};
Url.prototype._download = function (data){
    var deferred = Q.defer();
    var options = {
        url: data.url,
        headers: {
            'User-Agent': 'request'
        }
    };
    var mimetype = data.url.indexOf('.tar.gz') !== -1 ? '.tar.gz' : path.extname(data.url);
    var file = path.join(data.dirPath, 'archive' + mimetype);

    request(options)
        .pipe(fs.createWriteStream(file))
        .on('error', deferred.reject)
        .on('close', function (){
            deferred.resolve(file);
        });
    return deferred.promise;
};
Url.prototype._checkout = function (){
    var deferred = Q.defer();
    var self = this;
    this._createTempDir(this.source)
        .then(function (data) {
            self._download(data)
                .then(function (file){
                    extract(file, self.target)
                        .then(function (){
                            deferred.resolve();
                        })
                        .fail(function (err){
                            console.log(err);
                            deferred.reject(err);
                        });
                })
                .fail(function (err){
                    deferred.reject(err);
                });
        });
    return deferred.promise;
};

module.exports = Url;