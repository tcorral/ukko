var validLink = require('../../utils/checkLink');
var createLink = require('../../utils/createLink');
var Q = require('q');
var async = require('async');
var cmd = require('../../utils/cmd');

var executeCommands = function (instance, type, cwd){
    var deferred = Q.defer();
    var commands = instance[type + 'Commands'] || [];

    async.eachSeries(commands, function (command, callback){
        var commandParts = command.split(' ');
        var mainCommand = commandParts.shift();
        var options = { cwd: (cwd || instance.target) };
        if(type === 'pre' && !cwd){
            options.cwd = process.cwd();
        }
        cmd(mainCommand, commandParts,options)
            .then(function (stdout, stderr){
                callback();
            })
    }, function (){
        deferred.resolve();
    });

    if(!commands){
        deferred.resolve();
    }
    return deferred.promise;
};

var Base = function (decEndpoint){
    if(decEndpoint){
        var commands = decEndpoint.commands;
        this.source = decEndpoint.source;
        this.target = decEndpoint.target;
        this.cwd = decEndpoint.cwd;
        this.preCommands = [];
        this.postCommands = [];
        if(commands){
            this.preCommands = commands.pre || [];
            this.postCommands = commands.post || commands;
        }
    }
};
Base.prototype = {
    checkout: function (callback){
        var self = this;
        executeCommands(this, 'pre', this.cwd)
            .then(function (){
                self._checkout()
                    .then(function (){
                        executeCommands(self, 'post', self.cwd)
                            .then(function (){
                                createLink(self.source, self.target)
                                    .then(function (){
                                        callback();
                                    })
                                    .fail(function (er){
                                        console.log(er);
                                    })
                            });
                    });
            });
    },
    update: function (callback) {
        var self = this;
        executeCommands(this, 'pre', this.target)
            .then(function (){
                self._update()
                    .then(function (){
                        executeCommands(self, 'post', self.target)
                            .then(function (){
                                callback();
                            });
                    });
            });
    },
    _checkout: function (){
        throw new Error('Checkout method should be implemented.');
    },
    _update: function (){
        throw new Error('Update method should be implemented.');
    },
    install: function (callback){
        var self = this;
        return validLink(this.target)
            .then(function (result){
                if(result[0] === false){
                    console.log('checkout');
                    self.checkout(callback);
                }else{
                    console.log('update');
                    self.update(callback);
                }
            });
    }
};

module.exports = Base;