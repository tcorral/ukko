'use strict';

var grunt = require('grunt');
var path = require('path');
var cwd = process.cwd();
var ukko = require('../');
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
    var excludeDirs = ['.git'];
    var excludeFiles = ['.bower.json', 'ukko-error.log', 'ukko-output.log'];
    grunt.file.recurse( pathGenRepos, function (abspath, rootdir, subdir, filename) {
        var excluded = false;
        excludeDirs.forEach(function (dir){
            if (!excluded){
                if(subdir && subdir.indexOf('/' + dir)){
                    excluded = true;
                }
            }
        });
        excludeFiles.forEach(function (file){
            if (!excluded){
                if(filename === file){
                    excluded = true;
                }
            }
        });
        if(!excluded){
            console.log('ein');
            var genContent = grunt.file.read(abspath);
            var expPath = abspath.replace(pathGenRepos, expectedRepos);
            var expContent = grunt.file.read(expPath);
            test.equal(genContent, expContent);
        }
    });
};

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
                var genOut, genError;
                compareContent('repos', 'installAllRepos', test);
                var javascript3Folder = path.join(process.cwd(), 'test',
                                                            'generated', 'repos',
                                                            'airbnb', 'javascript3');
                var errorLogFilePath = path.join(javascript3Folder, 'ukko-error.log');
                var outputLogFilePath = path.join(javascript3Folder, 'ukko-output.log');

                test.equal(grunt.file.exists(errorLogFilePath), true);
                test.equal(grunt.file.exists(outputLogFilePath), true);

                genOut = grunt.file.read(outputLogFilePath);
                genError = grunt.file.read(errorLogFilePath);

                test.equal(genOut.length > 0, true);
                test.equal(genError.length, 0);

                clean();
                test.done();
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
                        var genOut, genError;
                        compareContent('repos', 'updateAllRepos', test);
                        var javascript3Folder = path.join(process.cwd(), 'test',
                            'generated', 'repos',
                            'airbnb', 'javascript3');
                        var errorLogFilePath = path.join(javascript3Folder, 'ukko-error.log');
                        var outputLogFilePath = path.join(javascript3Folder, 'ukko-output.log');

                        test.equal(grunt.file.exists(errorLogFilePath), true);
                        test.equal(grunt.file.exists(outputLogFilePath), true);

                        genOut = grunt.file.read(outputLogFilePath);
                        genError = grunt.file.read(errorLogFilePath);

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
        ukko.installOrUpdate({
            configPath: "test/fixtures/config.json",
            repos: "test/generated/repos/airbnb/javascript",
            onEnd: function () {
                compareContent('repos/airbnb/javascript', 'installOneRepo', test);
                var javascriptFolder = path.join(process.cwd(), 'test',
                    'generated', 'repos',
                    'airbnb', 'javascript');
                var errorLogFilePath = path.join(javascriptFolder, 'ukko-error.log');
                var outputLogFilePath = path.join(javascriptFolder, 'ukko-output.log');
                test.equal(grunt.file.exists(outputLogFilePath), false);
                test.equal(grunt.file.exists(errorLogFilePath), false);
                clean();
                test.done();
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
                        compareContent('repos/airbnb/javascript', 'updateOneRepo', test);
                        var javascriptFolder = path.join(process.cwd(), 'test',
                            'generated', 'repos',
                            'airbnb', 'javascript');
                        var errorLogFilePath = path.join(javascriptFolder, 'ukko-error.log');
                        var outputLogFilePath = path.join(javascriptFolder, 'ukko-output.log');
                        test.equal(grunt.file.exists(outputLogFilePath), false);
                        test.equal(grunt.file.exists(errorLogFilePath), false);
                        clean();
                        test.done();
                    }
                });
            }
        });
    }
};