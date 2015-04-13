var async = require('async');
var path = require('path');
var correctCWD = null;
module.exports = {
    createArrayFunctionsAsync: function (fn, items, cwd , key) {
        var args = Array.prototype.slice.call(arguments, 4);
        var callbacks = [];

        items.forEach(function (item){
            if(item.indexOf('cd ') === 0){
                correctCWD = path.resolve(path.join(key || cwd), item.replace('cd ', ''));
                return;
            }
            callbacks.push(async.apply.apply(async.apply, [fn, item, correctCWD || cwd].concat(args)));
        });
        correctCWD = null;
        return callbacks;
    }

};