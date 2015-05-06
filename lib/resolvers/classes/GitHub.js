//var Git = require('./Git');
//module.exports = Git;
var Q = require('q');
var temp = require('temp');
var path = require('path');
var Git = require('./Git');
var mout = require('mout');
var cmd = require('../../utils/cmd');
var request = require('request');
var extract = require('../../utils/extract');
var fs = require('graceful-fs');

temp.track();

function GitHub (decEndpoint){
    Git.call(this, decEndpoint);
    var pair = GitHub.getOrgRepoPair(decEndpoint.source);
    this.org = pair.org;
    this.repo = pair.repo;
    this._public = mout.string.startsWith(this._source, 'git://');
}
GitHub.prototype = new Git();
GitHub.getOrgRepoPair = function (url) {
    var match;

    match = url.match(/(?:@|:\/\/)github.com[:\/]([^\/\s]+?)\/([^\/\s]+?)(?:\.git)?\/?$/i);
    if (!match) {
        return null;
    }

    return {
        org: match[1],
        repo: match[2]
    };
};
GitHub.prototype.getLastCommit = function (){
    var deferred = Q.defer();
    var url = 'https://api.github.com/repos/' + this.org +'/' + this.repo + '/git/refs/heads/master';
    var options = {
        url: url,
        headers: {
            'User-Agent': 'request'
        }
    };
    request(options, function (error, response, body){
        if(error){
            return deferred.reject(error);
        }
        if (response.statusCode == 200) {
            deferred.resolve(JSON.parse(body));
        }
    });
    return deferred.promise;
};
GitHub.prototype._download = function (data){
    var deferred = Q.defer();
    var options = {
        url: data.url,
        headers: {
            'User-Agent': 'request'
        }
    };
    var file = path.join(data.dirPath, 'archive.tar.gz');

    request(options)
        .pipe(fs.createWriteStream(file))
        .on('error', deferred.reject)
        .on('close', function (){
            deferred.resolve(file);
        });
    return deferred.promise;
};
GitHub.prototype._createTempDir = function (url){
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
GitHub.prototype._checkout = function (){
    var deferred = Q.defer();
    var self = this;
    var tarballUrl = 'https://github.com/' + this.org + '/' + this.repo + '/archive/{{tag}}.tar.gz';

    if(!this.public){
        return cmd('git', ['clone',  this.source, '-b', 'master', '--progress', this.target])
            .fail(function (err){
                console.log(err);
            });
    }

    this.getLastCommit()
        .then(function (data) {
            var url = tarballUrl.replace('{{tag}}', data.object.sha);
            self._createTempDir(url)
                .then(function (data) {
                    self._download(data)
                        .then(function (file){
                            extract(file, self.target)
                                .then(function (){
                                    deferred.resolve();
                                })
                                .fail(function (err){
                                    deferred.reject(err);
                                });
                        })
                        .fail(function (err){
                            deferred.reject(err);
                        });
                });
        })
        .fail(function (err){
            deferred.reject(err);
        });

    return deferred.promise;
};

module.exports = GitHub;