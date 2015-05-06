'use strict';

var grunt = require('grunt');
var validLink = require('../lib/utils/checkLink');
var utils = require('../lib/utils');
var path = require('path');
var cwd = process.cwd();
var fs = require('fs');
var ukko = require('../');

exports.ukko = {
    noConfig: function (test) {
        test.throws(function (){
            ukko.installOrUpdate();
        });
        test.done();
    },
    installAllReposFS: function (test) {
        ukko.installOrUpdate({
            data: {
                "dependencies": {
                    "test/generated/repos/airbnb/javascript": "test/expected/installAllRepos/repos/airbnb/javascript"
                }
            },
            onEnd: function () {
                validLink(path.join(cwd, '/test/generated/repos/airbnb/javascript'))
                    .then(function (result){
                        test.ok(result[0] !== false);
                        grunt.file.delete('test/generated');
                        test.done();
                    });
            }
        });
    },
    updateAllReposFS: function (test) {
        ukko.installOrUpdate({
            data: {
                "dependencies": {
                    "test/generated/repos/airbnb/javascript": "test/expected/installAllRepos/repos/airbnb/javascript"
                }
            },
            onEnd: function () {
                ukko.installOrUpdate({
                    data: {
                        "dependencies": {
                            "test/generated/repos/airbnb/javascript": "test/expected/installAllRepos/repos/airbnb/javascript"
                        }
                    },
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
    installOneRepoFS: function (test){
        ukko.installOrUpdate({
            data: {
                "dependencies": {
                    "test/generated/repos/airbnb/javascript": "test/expected/installAllRepos/repos/airbnb/javascript"
                }
            },
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
    updateOneRepoFS:function (test) {
        ukko.installOrUpdate({
            data: {
                "dependencies": {
                    "test/generated/repos/airbnb/javascript": "test/expected/installAllRepos/repos/airbnb/javascript"
                }
            },
            repos: "test/generated/repos/airbnb/javascript",
            onEnd: function () {
                ukko.installOrUpdate({
                    data: {
                        "dependencies": {
                            "test/generated/repos/airbnb/javascript": "test/expected/installAllRepos/repos/airbnb/javascript"
                        }
                    },
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
    },
    installAllReposGIT: function (test) {
        ukko.installOrUpdate({
            data: {
                "dependencies": {
                    "test/generated/repos/tcorral/coffee" : "https://tcorral@bitbucket.org/tcorral/coffeescript-syntax-definition.git"
                }
            },
            onEnd: function () {
                var stats = fs.statSync(path.join(process.cwd(), "test/generated/repos/tcorral/coffee"));
                test.ok(stats.isDirectory());
                grunt.file.delete('test/generated');
                test.done();
            }
        });
    },
    installAllReposGITHUB: function (test) {
        ukko.installOrUpdate({
            data: {
                "dependencies": {
                    "test/generated/repos/tcorral/ddpp" : "https://github.com/tcorral/Design-Patterns-in-Javascript.git"
                }
            },
            onEnd: function () {
                var stats = fs.statSync(path.join(process.cwd(), "test/generated/repos/tcorral/ddpp"));
                test.ok(stats.isDirectory());
                grunt.file.delete('test/generated');
                test.done();
            }
        });
    },
    installAllReposURL_ZIP: function (test) {
        ukko.installOrUpdate({
            data: {
                "dependencies": {
                    "test/generated/repos/tcorral/ddpp" : "https://github.com/tcorral/Design-Patterns-in-Javascript/archive/master.zip"
                }
            },
            onEnd: function () {
                var stats = fs.statSync(path.join(process.cwd(), "test/generated/repos/tcorral/ddpp"));
                test.ok(stats.isDirectory());
                grunt.file.delete('test/generated');
                test.done();
            }
        });
    },
    installAllReposSVNFS: function (test) {
        ukko.installOrUpdate({
            data: {
                "dependencies": {
                    "test/generated/repos/tcorral/spamassassin" : "test/expected/spamassassin"
                }
            },
            onEnd: function () {
                var stats = fs.statSync(path.join(process.cwd(), "test/generated/repos/tcorral/spamassassin"));
                test.ok(stats.isDirectory());
                grunt.file.delete('test/generated');
                test.done();
            }
        });
    },
    updateAllReposSVNFS: function (test) {
        ukko.installOrUpdate({
            data: {
                "dependencies": {
                    "test/generated/repos/tcorral/spamassassin" : "test/expected/spamassassin"
                }
            },
            onEnd: function () {
                ukko.installOrUpdate({
                    data: {
                        "dependencies": {
                            "test/generated/repos/tcorral/spamassassin" : "test/expected/spamassassin"
                        }
                    },
                    onEnd: function () {
                        var stats = fs.statSync(path.join(process.cwd(), "test/generated/repos/tcorral/spamassassin"));
                        test.ok(stats.isDirectory());
                        grunt.file.delete('test/generated');
                        test.done();
                    }
                });
            }
        });
    },
     installAllReposGITFS: function (test) {
        ukko.installOrUpdate({
            data: {
                "dependencies": {
                    "test/generated/repos/tcorral/coffee" : path.join(process.cwd(), 'test/expected/coffee')
                }
            },
            onEnd: function () {
                var stats = fs.statSync(path.join(process.cwd(), "test/generated/repos/tcorral/coffee"));
                test.ok(stats.isDirectory());
                grunt.file.delete('test/generated');
                test.done();
            }
        });
    },
    installStash: function (test) {
        var source = "https://" + process.env.STASH_USER + ":" + process.env.STASH_PASS + "@" + process.env.STASH_SERVER + ".com/scm/lp/bloc.git";
        ukko.installOrUpdate({
            data: {
                "dependencies": {
                    "test/generated/repos/tcorral/bloc" : source
                }
            },
            onEnd: function () {
                var stats = fs.statSync(path.join(process.cwd(), "test/generated/repos/tcorral/bloc"));
                test.ok(stats.isDirectory());
                grunt.file.delete('test/generated');
                test.done();
            }
        });

    },
    updateAllReposGITFS: function (test){
        ukko.installOrUpdate({
            data: {
                "dependencies": {
                    "test/generated/repos/tcorral/coffee" : "test/expected/coffee"
                }
            },
            onEnd: function () {
                ukko.installOrUpdate({
                    data: {
                        "dependencies": {
                            "test/generated/repos/tcorral/coffee" : "test/expected/coffee"
                        }
                    },
                    onEnd: function () {
                        var stats = fs.statSync(path.join(process.cwd(), "test/generated/repos/tcorral/coffee"));
                        test.ok(stats.isDirectory());
                        grunt.file.delete('test/generated');
                        test.done();
                    }
                });
            }
        });
    }
};