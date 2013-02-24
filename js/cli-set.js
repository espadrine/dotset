var set = require('./set');
var content = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  content += '' + chunk;
});
process.stdin.on('end', function() {
  process.stdout.write(JSON.stringify(set.parse(content), null, 2));
});
