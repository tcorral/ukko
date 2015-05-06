'use strict';

var grunt = require('grunt');
var validLink = require('../lib/utils/checkLink');
var utils = require('../lib/utils');
var path = require('path');
var cwd = process.cwd();
var ukko = require('../');

exports.ukko = {
    noConfig: function (test) {
        test.throws(function (){
            ukko.installOrUpdate();
        });
        test.done();
    },
    installAllRepos: function (test) {
        ukko.installOrUpdate({
            configPath: "test/fixtures/config.json",
            onEnd: function () {
                validLink(path.join(process.cwd(), '/test/generated/repos/airbnb/javascript'))
                    .then(function (result){
                        test.ok(result[0] !== false);
                        grunt.file.delete('test/generated');
                        test.done();
                    });
            }
        });
    },
    updateAllRepos: function (test) {
        ukko.installOrUpdate({
            configPath: "test/fixtures/config.json",
            onEnd: function () {
                ukko.installOrUpdate({
                    configPath: "test/fixtures/config.json",
                    onEnd: function () {
                        validLink(path.join(process.cwd(), '/test/generated/repos/airbnb/javascript'))
                            .then(function (result){
                                test.ok(result[0] !== false);
                                grunt.file.delete('test/generated');
                                test.done();
                            });
                    }
                });
            }
        });
    },
    installOneRepo: function (test){
        ukko.installOrUpdate({
            configPath: "test/fixtures/config.json",
            repos: "test/generated/repos/airbnb/javascript",
            onEnd: function () {
                validLink(path.join(process.cwd(), '/test/generated/repos/airbnb/javascript'))
                    .then(function (result){
                        test.ok(result[0] !== false);
                        grunt.file.delete('test/generated');
                        test.done();
                    });
            }
        });
    },
    updateOneRepo:function (test) {
        ukko.installOrUpdate({
            configPath: "test/fixtures/config.json",
            repos: "test/generated/repos/airbnb/javascript",
            onEnd: function () {
                ukko.installOrUpdate({
                    configPath: "test/fixtures/config.json",
                    repos: "test/generated/repos/airbnb/javascript",
                    onEnd: function () {
                        validLink(path.join(process.cwd(), '/test/generated/repos/airbnb/javascript'))
                            .then(function (result){
                                test.ok(result[0] !== false);
                                grunt.file.delete('test/generated');
                                test.done();
                            });
                    }
                });
            }
        });
    }
};