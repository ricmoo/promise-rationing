Promise Rationing
=================

Promises are quite useful, but `Promise.all()` executes all promises in parallel, which is fine most of the time, but sometimes there are scarce resources that need to rationed (such as file descriptors, database connections, et cetera).

The `promise-rationing` library provides a familiar API to execute promise-compatible functions as promises, while limiting the number of concurrent functions running.

## Promise Compatible Function

A promise requires a function which takes in two functions, a `resolve` function and a `reject` function.

The returned object from `.all()` is a completely bona fide `Promise`, which can then be `.then`-ed and such.

**NOTE:** Why must we pass in a function and not a promise? Once a promise is created it begins executing immediately, which is what is trying to be prevented.

Example: Waiters
----------------

Try this out. There are never more than 4 waiters *doing there thing* at a time, and once one finishes, the next gets its turn.

```javascript
var promiseRationing = require('./index.js');

function waiter(i) {
    return function(resolve, reject) {
        console.log('Start ' + i);
        var t0 = (new Date()).getTime()
        setTimeout(function () {
            resolve('r' + i);
            console.log('End ' + i + ' after ' + ((new Date()).getTime() - t0) + 'ms');
        }, 5000 * Math.random());
    };
}

var waiters = [];
for (var i = 0; i < 10; i++) {
    waiters.push(waiter(i));
}

var promise = promiseRationing.all(waiters, 4);

promise.then(function (values) {
    console.log("Resolve", values);
}, function (error) {
    console.log("Error", error);
});
```

### The output
```
/Users/promise-rationing> node test-waiters.js 

Start 0
Start 1
Start 2
Start 3
End 0 after 904ms
Start 4
End 2 after 1791ms
Start 5
End 3 after 3039ms
Start 6
End 1 after 4382ms
Start 7
End 4 after 3565ms
Start 8
End 5 after 3095ms
Start 9
End 7 after 2484ms
End 8 after 2425ms
End 9 after 2200ms
End 6 after 4650ms
Resolve [ 'r0', 'r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8', 'r9' ]
```

Example: Processing MANY files
------------------------------

If you have a directory of 1000's of files, each of which you wish to process, simply creating a promise for each file would likely result in your operating system running out of file descriptors, as each promise begins immediately.

To handle this situation, we queue up all the files for processing, but limit to 20 functions at a time.

```javascript
var fs = require('fs');
var util = require('util');

var promiseRationing = require('./index.js');

// This function will return a promize-compatible function that will return the filesize
function badFileSizeFunction(path) {
    return function(resolve, reject) {
        fs.readFile(path, function(error, data) {
            if (error) {
                reject(error.message);

            } else {
                console.log(util.format('Read "%s"... (%d bytes)', path, data.length));
                resolve(data.length);
            }
        });
    }
}

// Find all the files in /etc that end in .conf
var filenames = fs.readdirSync('/etc/');
var readers = [];
for (var i = 0; i < filenames.length; i++) {
    var path = '/etc/' + filenames[i];
    if (path.match(/\.conf$/)) {
        readers.push(badFileSizeFunction(path));
    }
}

// Do our promise magic
var promise = promiseRationing.all(readers, 4);

promise.then(function (values) {
    console.log("Resolve", values);
}, function (error) {
    console.log("Error", error);
});
```

### The Output

```
/Users/promise-rationing> node test-count.js 

Read "/etc/asl.conf"... (1051 bytes)
Read "/etc/autofs.conf"... (1935 bytes)
Read "/etc/dnsextd.conf"... (2378 bytes)
Read "/etc/ftpd.conf"... (54 bytes)
Read "/etc/kern_loader.conf"... (0 bytes)
Read "/etc/newsyslog.conf"... (1318 bytes)
Read "/etc/man.conf"... (4574 bytes)
Read "/etc/iscsid.conf"... (296 bytes)
Read "/etc/nfs.conf"... (43 bytes)
Read "/etc/notify.conf"... (303 bytes)
Read "/etc/ntp-restrict.conf"... (414 bytes)
Read "/etc/ntp.conf"... (23 bytes)
Read "/etc/ntp_opendirectory.conf"... (23 bytes)
Read "/etc/pf.conf"... (1027 bytes)
Read "/etc/resolv.conf"... (241 bytes)
Read "/etc/rtadvd.conf"... (891 bytes)
Read "/etc/syslog.conf"... (96 bytes)
Resolve [ 1051, 1935, 2378, 54, 296, 0, 4574, 1318, 43, 303, 414, 23,
  23, 1027, 241, 891, 96 ]
```


Testing
-------

There are the two demo files provided above, but better testing must be added at some point...


Donations
---------

Obviously, it's all licensed under the MIT license, so use it as you wish; but if you'd like to buy me a coffee, I won't complain. =)

- Bitcoin - `18UDs4qV1shu2CgTS2tKojhCtM69kpnWg9`
- Dogecoin - `DQe5fTQWzKsd2hBpEoRh8ubmq5eTJ5HjXz`
- Testnet3 - `mmr3CkfqSjbgbzzLfuhZw7sEH5VbEi2vJt`

