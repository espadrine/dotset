// Copyright © Thaddee Tyl.
// MIT license should be bundled with this file.
(function (window, undefined) {

var SET = {};

// Parse code.
//

SET.parse = function (text) {
};


// Stringify code.
//

SET.stringify = function (object, indent) {
  var ws = "", i = 0;
  indent = indent || 0;
  for (i = 0; i < indent; i++) {
    ws += " ";
  }
  if (object === null || object === undefined) {
    return "null";
  } else if (object === true) {
    return "true";
  } else if (object === false) {
    return "false";
  } else if (typeof object === "number") {
    return new String(object);
  } else if (typeof object === "string") {
    return JSON.stringify(object);
  } else if (Object.prototype.toString.call(object) === '[object Array]') {
    var str = "";
    for (i = 0; i < object.length; i++) {
      str += "\n" + ws + "- " + SET.stringify(object[i], indent + 1);
    }
    return str;
  } else if (typeof object === "object") {
    var str = "";
    for (var e in object) {
      str += "\n" + ws + (new String(e)) + ": "
          + SET.stringify(object[e], indent + 1);
    }
    return str;
  } else {
    return "";
  }
};


if (!window.module) {
  // node.js environment.
  module.exports = SET;
} else {
  window.SET = SET;
}

}(this));
