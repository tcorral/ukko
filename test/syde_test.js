'use strict';

var grunt = require('grunt');
var path = require('path');
var cwd = process.cwd();
var syde = require('../');
var clean = function () {
    var pathBower = path.join(process.cwd(), 'bower.json');
    var bowerData = grunt.file.readJSON(pathBower);
    delete bowerData.installed;
    grunt.file.write(pathBower, JSON.stringify(bowerData, null, '    '));
    grunt.file.delete('test/generated');
    grunt.file.delete('error.log');
    grunt.file.delete('out.log');
};
var compareContent = function (repoPath, subFolder, test) {
    var pathGenRepos = path.join(process.cwd(), "test", "generated", repoPath);
    var expectedRepos = path.join(process.cwd(), "test", "expected", subFolder, repoPath);
    grunt.file.recurse( pathGenRepos, function (abspath, rootdir, subdir, filename) {
        if(filename !== '.bower.json'){
            var genContent = grunt.file.read(abspath);
            var expPath = abspath.replace(pathGenRepos, expectedRepos);
            var expContent = grunt.file.read(expPath);
            test.equal(genContent, expContent);
        }
    });
};

exports.syde = {
    installAllRepos: function (test) {
        syde.installOrUpdate({
            configPath: "test/fixtures/config.json",
            onEnd: function () {
                var genOut, genError;
                compareContent('repos', 'installAllRepos', test);
                test.equal(grunt.file.exists('out.log'), true);
                test.equal(grunt.file.exists('error.log'), true);

                genOut = grunt.file.read('out.log');
                genError = grunt.file.read('error.log');

                test.equal(genOut.length > 0, true);
                test.equal(genError.length, 0);

                clean();
                test.done();
            }
        });
    },
    updateAllRepos: function (test) {
        syde.installOrUpdate({
            configPath: "test/fixtures/config.json",
            onEnd: function () {
                syde.installOrUpdate({
                    configPath: "test/fixtures/config.json",
                    onEnd: function () {
                        var genOut, genError;
                        compareContent('repos', 'updateAllRepos', test);
                        test.equal(grunt.file.exists('out.log'), true);
                        test.equal(grunt.file.exists('error.log'), true);

                        genOut = grunt.file.read('out.log');
                        genError = grunt.file.read('error.log');

                        test.equal(genOut.length > 0, true);
                        test.equal(genError.length, 0);

                        clean();
                        test.done();
                    }
                });
            }
        });
    },
    installOneRepo: function (test){
        syde.installOrUpdate({
            configPath: "test/fixtures/config.json",
            repos: "test/generated/repos/airbnb/javascript",
            onEnd: function () {
                compareContent('repos/airbnb/javascript', 'installOneRepo', test);
                test.equal(grunt.file.exists('out.log'), false);
                test.equal(grunt.file.exists('erro.log'), false);
                clean();
                test.done();
            }
        });
    },
    updateOneRepo:function (test) {
        syde.installOrUpdate({
            configPath: "test/fixtures/config.json",
            repos: "test/generated/repos/airbnb/javascript",
            onEnd: function () {
                syde.installOrUpdate({
                    configPath: "test/fixtures/config.json",
                    repos: "test/generated/repos/airbnb/javascript",
                    onEnd: function () {
                        compareContent('repos/airbnb/javascript', 'updateOneRepo', test);
                        test.equal(grunt.file.exists('out.log'), false);
                        test.equal(grunt.file.exists('error.log'), false);
                        clean();
                        test.done();
                    }
                });
            }
        });
    },

};