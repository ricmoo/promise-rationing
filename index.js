function all(iterable, limit) {

    // Must be able to run at least one at a time
    if (!limit || limit < 1 || typeof(limit) !== 'number') {
        return Promise.reject('limit must be greater than 0');
    }

    limit = parseInt(limit);


    // We launch all the promises, stalling them with the pending functions
    var pending = [];
    var error = false;
    var queueMe = function(func) {
        return new Promise(function(resolve, reject) {
            new Promise(function(blockResolve, neverReject) {
                pending.push(blockResolve)

            }).then(function() {
                if (error) { return; }

                // after unblocking, we call the original function
                func(function() {
                    if (error) { return; }

                    // Provide the original function with its arguments
                    resolve.apply(this, Array.prototype.slice.apply(arguments));

                    // Nudge next promise to begin
                    if (pending.length) {
                        pending.shift()();
                    }
                }, function () {
                    // Handle errors
                    reject.apply(this, Array.apply(null, arguments));
                    error = true;
                });
            });
        });
    }

    // Create and queue ever callback as a stalled promise
    var callbacks = [];
    for (var k in iterable) {
        callbacks.push(queueMe(iterable[k]));
    }

    // Bootstrap the initial limit promises
    for (var i = 0; i < limit; i++) {
        if (pending.length === 0) { break; }
        pending.shift()();
    }

    // Wait for all of them to return
    return Promise.all(callbacks);
}

module.exports = {
    all: all,
}

