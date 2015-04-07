var getHandler = function (detachedProcesses, lastProcess) {
    return function () {
        try{
            detachedProcesses.processes.forEach(function (_process){
                console.log('Killing process: ' + _process.pid + ' - ' + _process.command + ' in ' + _process.cwd);
                process.kill(_process.pid);
                console.log('Killed');
            });
            detachedProcesses.processes = [];
        }catch(er){
            try{
                console.log('Killing process: ' + lastProcess._process.pid + ' - ' + lastProcess._process.command + ' in ' + lastProcess._process.cwd);
                process.kill(lastProcess._process.pid);
                console.log('Killed');
            }catch(er2){}
        }
        process.exit(0);
    };
};
module.exports = function (detachedProcesses, lastProcess) {
    var handler = getHandler(detachedProcesses, lastProcess);
    process.on('uncaughtException', handler);
    process.on('exit', handler);
    process.on('SIGINT', handler);
};
