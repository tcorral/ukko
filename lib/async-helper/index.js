var async = require('async');
module.exports = {
    createArrayFunctionsAsync: function (fn, items) {
        var args = Array.prototype.slice.call(arguments, 2);
        var callbacks = items.map(function (item) {
            return async.apply.apply(async.apply, [fn, item].concat(args));
        });
        return callbacks;
    }

};