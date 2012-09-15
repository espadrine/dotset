var set = require('./parse');

console.log(set.stringify({
  "String": "string.",
  "Number": 1,
  "Null": null,
  "Boolean": true,
  "List": [1, null]
}));
