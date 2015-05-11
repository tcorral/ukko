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
                        grunt.file.delete('trunk');
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
                                grunt.file.delete('trunk');
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
                        grunt.file.delete('trunk');
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
                                grunt.file.delete('trunk');
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
                grunt.file.delete('trunk');
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
                grunt.file.delete('trunk');
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
                grunt.file.delete('trunk');
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
                grunt.file.delete('trunk');
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
                        grunt.file.delete('trunk');
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
                grunt.file.delete('trunk');
                test.done();
            }
        });
    },
    installAndCommandsReposFS: function (test) {
        ukko.installOrUpdate({
            data: {
                "dependencies": {
                    "test/generated/repos/airbnb/javascript": {
                        endpoint: "test/expected/installAllRepos/repos/airbnb/javascript",
                        commands: [
                            'ls -la',
                            'cd .'
                        ]
                    }
                }
            },
            onEnd: function () {
                validLink(path.join(cwd, '/test/generated/repos/airbnb/javascript'))
                    .then(function (result){
                        test.ok(result[0] !== false);
                        grunt.file.delete('test/generated');
                        grunt.file.delete('trunk');
                        test.done();
                    });
            }
        });
    },
    installAndPreCommandsReposFS: function (test) {
        ukko.installOrUpdate({
            data: {
                "dependencies": {
                    "test/generated/repos/airbnb/javascript": {
                        endpoint: "test/expected/installAllRepos/repos/airbnb/javascript",
                        commands: {
                            pre: [
                                'ls -la',
                                'cd .'
                            ]
                        }
                    }
                }
            },
            onEnd: function () {
                validLink(path.join(cwd, '/test/generated/repos/airbnb/javascript'))
                    .then(function (result){
                        test.ok(result[0] !== false);
                        grunt.file.delete('test/generated');
                        grunt.file.delete('trunk');
                        test.done();
                    });
            }
        });
    },
    installAndPostCommandsReposFS: function (test) {
        ukko.installOrUpdate({
            data: {
                "dependencies": {
                    "test/generated/repos/airbnb/javascript": {
                        endpoint: "test/expected/installAllRepos/repos/airbnb/javascript",
                        commands: {
                            post: [
                                'ls -la',
                                'cd .'
                            ]
                        }
                    }
                }
            },
            onEnd: function () {
                validLink(path.join(cwd, '/test/generated/repos/airbnb/javascript'))
                    .then(function (result){
                        test.ok(result[0] !== false);
                        grunt.file.delete('test/generated');
                        grunt.file.delete('trunk');
                        test.done();
                    });
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
                grunt.file.delete('trunk');
                test.done();
            }
        });

    },
    installAllReposStash: function (test){
        ukko.installOrUpdate({
            data: {
                "dependencies": {
                    "test/generated/CXP/commons" : "ssh://git@"+process.env.STASH_SERVER+".com:7999/cxp/commons.git",
                    "test/generated/CXP/foundation": "ssh://git@"+process.env.STASH_SERVER+".com:7999/cxp/foundation.git",
                    "test/generated/CXP/content": "ssh://git@"+process.env.STASH_SERVER+".com:7999/cxp/content.git",
                    "test/generated/CXP/orchestrator": "ssh://git@git@"+process.env.STASH_SERVER+".com:7999/cxp/orchestrator.git",
                    "test/generated/CXP/portalClient": "ssh://git@"+process.env.STASH_SERVER+".com:7999/cxp/portalclient.git",
                    "test/generated/CXP/portalManager": "ssh://git@"+process.env.STASH_SERVER+".com:7999/cxp/portalManager.git"
                }
            },
            onEnd: function () {
                var stats = fs.statSync(path.join(process.cwd(), "test/generated/CXP/commons"));
                var stats2 = fs.statSync(path.join(process.cwd(), "test/generated/CXP/foundation"));
                var stats3 = fs.statSync(path.join(process.cwd(), "test/generated/CXP/content"));
                var stats4 = fs.statSync(path.join(process.cwd(), "test/generated/CXP/orchestrator"));
                var stats5 = fs.statSync(path.join(process.cwd(), "test/generated/CXP/portalClient"));
                var stats6 = fs.statSync(path.join(process.cwd(), "test/generated/CXP/portalManager"));
                test.ok(stats.isDirectory());
                test.ok(stats2.isDirectory());
                test.ok(stats3.isDirectory());
                test.ok(stats4.isDirectory());
                test.ok(stats5.isDirectory());
                test.ok(stats6.isDirectory());
                grunt.file.delete('test/generated');
                grunt.file.delete('trunk');
                test.done();
            }
        });
    },
    installAllReposStashObject: function (test){
        ukko.installOrUpdate({
            data: {
                "dependencies": {
                    "test/generated/CXP/commons" : {
                        endpoint: "ssh://git@"+process.env.STASH_SERVER+".com:7999/cxp/commons.git"
                    },
                    "test/generated/CXP/foundation": {
                        endpoint: "ssh://git@"+process.env.STASH_SERVER+".com:7999/cxp/foundation.git"
                    },
                    "test/generated/CXP/content": {
                        endpoint: "ssh://git@"+process.env.STASH_SERVER+".com:7999/cxp/content.git"
                    },
                    "test/generated/CXP/orchestrator": {
                        endpoint: "ssh://git@git@"+process.env.STASH_SERVER+".com:7999/cxp/orchestrator.git"
                    },
                    "test/generated/CXP/portalClient": {
                        endpoint: "ssh://git@"+process.env.STASH_SERVER+".com:7999/cxp/portalclient.git"
                    },
                    "test/generated/CXP/portalManager": {
                        endpoint: "ssh://git@"+process.env.STASH_SERVER+".com:7999/cxp/portalManager.git"
                    }
                }
            },
            onEnd: function () {
                var stats = fs.statSync(path.join(process.cwd(), "test/generated/CXP/commons"));
                var stats2 = fs.statSync(path.join(process.cwd(), "test/generated/CXP/foundation"));
                var stats3 = fs.statSync(path.join(process.cwd(), "test/generated/CXP/content"));
                var stats4 = fs.statSync(path.join(process.cwd(), "test/generated/CXP/orchestrator"));
                var stats5 = fs.statSync(path.join(process.cwd(), "test/generated/CXP/portalClient"));
                var stats6 = fs.statSync(path.join(process.cwd(), "test/generated/CXP/portalManager"));
                test.ok(stats.isDirectory());
                test.ok(stats2.isDirectory());
                test.ok(stats3.isDirectory());
                test.ok(stats4.isDirectory());
                test.ok(stats5.isDirectory());
                test.ok(stats6.isDirectory());
                grunt.file.delete('test/generated');
                grunt.file.delete('trunk');
                test.done();
            }
        });
    },
    installAllReposStashObjectCommands: function (test){
        ukko.installOrUpdate({
            data: {
                "detached-processes": [
                    'mvn jetty:run',
                    'gulp'
                ],
                "dependencies": {
                    "test/generated/CXP/commons" : {
                        endpoint: "https://" + process.env.STASH_USER + ":" + process.env.STASH_PASS + "@" + process.env.STASH_SERVER+ "/scm/cxp/commons.git",
                        commands: [
                            'cd test/generated/CXP/commons',
                            'mvn clean install -DskipTests'
                        ]
                    },
                    "test/generated/CXP/foundation": {
                        endpoint: "https://" + process.env.STASH_USER + ":" + process.env.STASH_PASS + "@" + process.env.STASH_SERVER+ "/scm/cxp/foundation.git",
                        commands: [
                            'cd test/generated/CXP/foundation',
                            'mvn clean install -DskipTests'
                        ]
                    },
                    "test/generated/CXP/content": {
                        endpoint: "https://" + process.env.STASH_USER + ":" + process.env.STASH_PASS + "@" + process.env.STASH_SERVER+ "/scm/cxp/content.git",
                        commands: [
                            'cd test/generated/CXP/content',
                            'mvn clean install -DskipTests',
                            'cd test/generated/CXP/content/contentservices-webapp',
                            'mvn jetty:run'
                        ]
                    },
                    "test/generated/CXP/orchestrator": {
                        endpoint: "https://" + process.env.STASH_USER + ":" + process.env.STASH_PASS + "@" + process.env.STASH_SERVER+ "/scm/cxp/orchestrator.git",
                        commands: [
                            'cd test/generated/CXP/orchestrator',
                            'mvn clean install',
                            'cd test/generated/CXP/orchestrator/orchestrator-webapp',
                            'mvn jetty:run'
                        ]
                    },
                    "test/generated/CXP/portalClient": {
                        endpoint: "https://" + process.env.STASH_USER + ":" + process.env.STASH_PASS + "@" + process.env.STASH_SERVER+ "/scm/cxp/portalclient.git",
                        commands: [
                            'cd test/generated/CXP/portalClient',
                            'gulp'
                        ]
                    },
                    "test/generated/CXP/portalManager": {
                        endpoint: "https://" + process.env.STASH_USER + ":" + process.env.STASH_PASS + "@" + process.env.STASH_SERVER+ "/scm/cxp/portalManager.git",
                        commands: [
                            'cd test/generated/CXP/portalManager',
                            'mvn clean install -DskipTests',
                            'cd test/generated/CXP/portalManager/dashboard',
                            'mvn jetty:run'
                        ]
                    }
                }
            },
            onEnd: function () {
                var stats = fs.statSync(path.join(process.cwd(), "test/generated/CXP/commons"));
                var stats2 = fs.statSync(path.join(process.cwd(), "test/generated/CXP/foundation"));
                var stats3 = fs.statSync(path.join(process.cwd(), "test/generated/CXP/content"));
                var stats4 = fs.statSync(path.join(process.cwd(), "test/generated/CXP/orchestrator"));
                var stats5 = fs.statSync(path.join(process.cwd(), "test/generated/CXP/portalClient"));
                var stats6 = fs.statSync(path.join(process.cwd(), "test/generated/CXP/portalManager"));
                test.ok(stats.isDirectory());
                test.ok(stats2.isDirectory());
                test.ok(stats3.isDirectory());
                test.ok(stats4.isDirectory());
                test.ok(stats5.isDirectory());
                test.ok(stats6.isDirectory());
                //grunt.file.delete('test/generated');
                grunt.file.delete('trunk');
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
                        grunt.file.delete('trunk');
                        test.done();
                    }
                });
            }
        });
    }
};