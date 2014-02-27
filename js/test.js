var assert = require('assert');
var set = require('./set');

assert.deepEqual(set.parse('\
# Comments. They\'re actually useful.\n\
name: "DotSet: The Settings File Format"\n\
version: 1.0\n\
That simple?: yes\n\
Can I nest?:\n\
  - You can nest lists…\n\
  - and: obviously\n\
    objects: too!'),
{
  "name": "DotSet: The Settings File Format",
  "version": 1,
  "That simple?": true,
  "Can I nest?": [
    "You can nest lists…",
    {
      "and": "obviously",
      "objects": "too!"
    }
  ]
},
"Parser doesn't work on the front-page example.");


assert.equal(set.stringify({
  "name": "The Settings File Format",
  "version": 1.0,
  "That simple?": true,
  "Can I nest?": [
    "You can nest lists…",
    {
      "and": "obviously",
      "objects": "too!"
    }
  ]
}, 2),
'\
name: "The Settings File Format"\n\
version: 1\n\
That simple?: yes\n\
Can I nest?:\n\
  - "You can nest lists…"\n\
  - and: "obviously"\n\
    objects: "too!"\n\n\n',
"Stringifier doesn't work on the front-page example.");

assert.deepEqual(set.parse('\
1: "one"\n\
2: "two"'), {
  "1": "one",
  "2": "two"
},
"Parser supports numbers as keys.");

assert.deepEqual(set.parse('\
string: by default'), {
  "string": "by default"
},
"Non-dictionary primitives are strings by default.");

assert.deepEqual(set.parse('\
- key: "value"'), [
  { "key": "value" }
],
"Arrays can contain dictionaries on the same line.");

assert.deepEqual(set.parse('\
- key: value\n\
- key:value'), [
  { "key": "value" },
  "key:value"
],
"A key must be followed by `:` *and at least a space*.");

assert.deepEqual(set.parse('\
- key : value'), [
  { "key": "value" }
],
"Whitespace before `:` is ignored.");

assert.deepEqual(set.parse('\
":": value\n\
"more": value'), {
  ":": "value",
  "more": "value"
},
"Dictionary keys can be strings.");
