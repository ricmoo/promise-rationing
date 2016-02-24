var promiseRationing = require('./index.js');

function waiter(i) {
    return function(resolve, reject) {
        console.log('Start ' + i);
        var t0 = (new Date()).getTime()
        setTimeout(function () {
            //if (i == 3) {
            //    reject('r' + i);
            //} else {
                resolve('r' + i);
            //}
            console.log('End ' + i + ' after ' + ((new Date()).getTime() - t0) + 'ms');
        }, 5000 * Math.random());
    };
}

var waiters = [];
for (var i = 0; i < 10; i++) {
    waiters.push(waiter(i));
}

var promise = promiseRationing.all(waiters, 4);
console.log(promise);

promise.then(function (values) {
    console.log("Resolve", values);
}, function (error) {
    console.log("Error", error);
});

