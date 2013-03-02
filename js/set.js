// Copyright © Thaddee Tyl. MIT license.
(function (window, undefined) {

var SET = {};

// Parse code.
//

var whiteSpace = new RegExp('[\n\r \t\u0009\u0020\u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u200c\u200d\u202f\u205f\u2060\u3000\ufeff]');
var spaces = new RegExp('[ \t\u0009\u0020\u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u200c\u200d\u202f\u205f\u2060\u3000\ufeff]');
var newline = new RegExp('[\n\r]');
var stringEscape = new RegExp('["\\\/bfnrtu\n]');
var hexadecimal = new RegExp('[a-fA-F0-9]');
var digit = new RegExp('[0-9]');

function SetStream(text, filename) {
  this.text = text;
  this.filename = filename || '(set)';
}

SetStream.prototype = {
  text: '',
  filename: '',
  offset: 0,
  line: 0,
  column: 0,
  sol: 0,  // index of start of line.
  getChar: function() {
    var c = this.text[this.offset];
    if (c == '\n' || c == '\r') {
      this.column = 0;
      this.line ++;
    } else {
      this.column ++;
    }
    return this.text[this.offset++];
  },
  peekChar: function() {
    return this.text[this.offset];
  },
  skip: function(chars) {
    var rchars = new RegExp(chars);
    while (rchars.test(this.text[this.offset])) {
      if (!this.getChar()) { return; }
    }
  },
  skipWhitespace: function() {
    var i, ch, offset;
    for (;;) {
      this.skip(spaces);
      ch = this.peekChar();
      if (!ch) { return; }
      if (ch === '#') {
        // Comment!
        while (!newline.test(ch)) {
          if (!ch) { return; }
          ch = this.getChar();
        }
      }
      offset = this.offset;
      this.skip(newline);
      if (offset < this.offset) {
        // We did skip a newline.
        this.sol = this.offset;
      }
      ch = this.peekChar();
      if (!(whiteSpace.test(ch) || ch === "#")) {
        break;
      }
    }
  },
  currentIndent: function() {
    var i, sol;
    for (sol = i = this.sol; ; i++) {
      ch = this.text[i];
      if (ch !== " ") {
        break;
      }
    }
    return i - sol;
  },
  error: function(msg) {
    throw new Error(this.filename + ':' + this.line + ':' + this.column +
      ' ' + msg
    );
  },

  readPrimitive: function() {
    var ch, slice;
    this.skipWhitespace();
    ch = this.peekChar();
    if (ch === '"') {
      // String!
      return this.readString();
    }
    if (ch === '-') {
      ch = this.text[this.offset + 1];
      if (whiteSpace.test(ch)) {
        // Array!
        return this.readArray();
      } else {
        // Number!
        return this.readNumber();
      }
    }
    if (digit.test(ch)) {
      // Number!
      return this.readNumber();
    }
    slice = this.text.slice(this.offset, this.offset + 3);
    if (slice === "yes") {
      if (newline.test(this.text[this.offset + 3])) {
        // Boolean!
        for (i = 0; i < 3; i++) { this.getChar(); }
        return true;
      }
    }
    if (slice === "nil") {
      if (newline.test(this.text[this.offset + 3])) {
        // Null!
        for (i = 0; i < 3; i++) { this.getChar(); }
        return null;
      }
    }
    slice = this.text.slice(this.offset, this.offset + 2);
    if (slice === "no") {
      if (newline.test(this.text[this.offset + 2])) {
        // Boolean!
        for (i = 0; i < 2; i++) { this.getChar(); }
        return false;
      }
    }
    // Dictionary!
    return this.readDictionary();
  },

  // We are at the " of the string.
  readString: function() {
    var ch, start, end, i;
    start = end = this.offset;
    this.getChar();  // Go past the ".
    for (;;) {
      ch = this.getChar();
      if (!ch) { this.error("Unfinished string."); }
      if (ch === '\\') {
        ch = this.getChar();
        if (!stringEscape.test(ch)) {
          // ERROR
          this.error('Unescaped backslash.');
        } else if (ch === 'u') {
          // Unicode escape.
          for (i = 0; i < 4; i++) {
            ch = this.getChar();
            if (!hexadecimal.test(ch)) {
              // ERROR
              this.error('Invalid unicode escape.');
            }
          }
        }
      } else if (ch === '"') {
        end = this.offset;
        break;
      }
    }
    return JSON.parse(this.text.slice(start, end));
  },

  // We're at the start of a number.
  readNumber: function() {
    var ch, start, end;
    start = end = this.offset;
    ch = this.getChar();
    if (ch === '-') {
      ch = this.getChar();
    }
    if (ch === "0") {
      // Expect a dot.
      ch = this.getChar();  // skip the dot.
      if (ch !== ".") {
        // ERROR
        this.error('Number starting with 0 must be floating-point.');
      }
      this.skipNumberDecimals();
    } else if (digit.test(ch)) {
      for (;;) {
        ch = this.peekChar();
        if (!digit.test(ch)) {
          if (ch === ".") {
            this.getChar();  // skip the dot.
            this.skipNumberDecimals();
          }
          break;
        } else {
          this.getChar();
        }
      }
    } else {
      // ERROR
      this.error('Number started with - is invalid.');
    }
    this.skipExponent();
    end = this.offset;
    return JSON.parse(this.text.slice(start, end));
  },

  skipNumberDecimals: function() {
    var ch;
    for (;;) {
      ch = this.peekChar();
      if (!digit.test(ch)) {
        return;
      }
      this.getChar();
    }
  },

  skipExponent: function() {
    var ch;
    ch = this.peekChar();
    if (ch !== "e" && ch !== "E") {
      return;
    }
    this.getChar();
    ch = this.getChar();
    if (ch === "+" || ch === "-") {
      ch = this.getChar();
    }
    for (;;) {
      ch = this.peekChar();
      if (!digit.test(ch)) {
        return;
      }
      this.getChar();
    }
  },

  // Starts at -.
  readArray: function() {
    var ar, ch, indent;
    ar = [];
    indent = this.currentIndent();
    while (this.currentIndent() >= indent) {
      ch = this.getChar();
      if (!ch) { break; }
      if (ch !== "-") {
        this.error('Invalid array, found ' + JSON.stringify(ch) +
            ' instead of "-".');
      }
      indent = this.currentIndent();  // Readjust indentation.
      ar.push(this.readPrimitive());
      this.skipWhitespace();
    }
    return ar;
  },

  // Starts with a key.
  readDictionary: function() {
    var start, end, key, ch, indent, dict;
    dict = {};
    indent = this.currentIndent();
    while (this.currentIndent() >= indent) {

      ch = this.peekChar();
      if (ch === '"') {
        key = this.readString();
        this.getChar();  // skip :.
      } else {
        start = end = this.offset;
        for (;;) {
          ch = this.getChar();
          if (!ch) { break; }
          if (ch === ":") {
            break;
          }
        }
        end = this.offset - 1;
        key = this.text.slice(start, end);
      }
      if (!ch) { break; }

      indent = this.currentIndent();  // Readjust indentation.
      dict[key] = this.readPrimitive();
      this.skipWhitespace();
    }

    return dict;
  }
}


SET.parse = function (text) {
  // `toplevel` is the object returned.
  var input = new SetStream(text);
  return input.readPrimitive();
};


// Stringify code.
//

SET.stringify = function SET_STRINGIFY(object, sizeIndent) {
  return set_stringify(object, sizeIndent,
    0,    // indentation
    false // indent the first item
  );
};

function set_stringify(object, sizeIndent, indentation, noIndentFirstItem) {
  var indent = "", i = 0, str = "";
  sizeIndent = sizeIndent || 2;
  for (i = 0; i < indentation * sizeIndent; i++) {
    indent += " ";
  }
  if (object === null || object === undefined) {
    return "nil";
  } else if (object === true) {
    return "yes";
  } else if (object === false) {
    return "no";
  } else if (typeof object === "number") {
    return new String(object);
  } else if (typeof object === "string") {
    return JSON.stringify(object);
  } else if (object instanceof Array) {
    for (i = 0; i < object.length; i++) {
      str += ((noIndentFirstItem && i === 0)? "": indent) + "- "
          + set_stringify(object[i], sizeIndent, indentation + 1, true)
          + '\n';
    }
  } else if (typeof object === "object") {
    i = 0;
    for (var e in object) {
      str += ((noIndentFirstItem && i === 0)? "": indent) + wrapKey(e) + ":"
          + (typeof object[e] === "object"? "\n": " ")
          + set_stringify(object[e], sizeIndent, indentation + 1)
          + '\n';
      i = 1;
    }
  }
  return str;
};

function wrapKey(key) {
  if (key[0] === '-' || key[0] === '"') {
    return JSON.stringify(new String(key));
  } else if (key.indexOf(':') === -1) {
    return new String(key);
  }
  return JSON.stringify(new String(key));
}


if (!!window.module) {
  // node.js environment.
  module.exports = SET;
} else {
  window.SET = SET;
}

}(this));
