var Base = require('./Base');
var Q = require('q');
var path = require('path');
var cmd = require('../../utils/cmd');
var which = require('which');
var hasGit;

try{
    which.sync('git');
    hasGit = true
}catch(er){
    hasGit = false;
}

function Git(decEndpoint){
    if(decEndpoint){
        Base.call(this, decEndpoint);
        this.target = path.resolve(process.cwd(), this.target);
        if(!hasGit){
            throw new Error('git is not installed or not in the PATH');
        }
    }
}
Git.prototype = new Base();
Git.prototype._checkout = function (){
    return cmd('git', ['clone', this.source, this.target]);
};
Git.prototype._update = function (){
    return cmd('git', ['pull'], { cwd: this.target });
};
module.exports = Git;