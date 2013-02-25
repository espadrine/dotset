var assert = require('assert');
var set = require('./set');

console.log(JSON.stringify(set.parse('\
# Comments. They\'re actually useful.\n\
name: "The Settings File Format"\n\
version: 1.0\n\
That simple?: yes\n\
Can I nest?:\n\
  - "You can nest lists…"\n\
  - and: "obviously"\n\
    objects: "too!"'), null, 2));

assert.deepEqual(set.parse('\
# Comments. They\'re actually useful.\n\
name: "The Settings File Format"\n\
version: 1.0\n\
That simple?: yes\n\
Can I nest?:\n\
  - "You can nest lists…"\n\
  - and: "obviously"\n\
    objects: "too!"'),
{
  "name": "The Settings File Format",
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
