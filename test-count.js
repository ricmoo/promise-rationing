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

