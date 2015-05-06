var FS = require('./FS');
var cmd = require('../../utils/cmd');
var which = require('which');

try{
    which.sync('git');
    hasGit = true
}catch(er){
    hasGit = false;
}

var GitFS = function (decEndpoint){
    FS.call(this, decEndpoint);
};
GitFS.prototype = new FS();
GitFS.prototype._update = function (){
    if(!hasGit){
        throw new Error('git is not installed or not in the PATH');
    }
    return cmd('git', ['pull'], { cwd: this.target });
};

module.exports = GitFS;