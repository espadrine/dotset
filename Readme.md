The Settings File Format
========================

A format for settings.

- It's just JSON,
- Very readable,
- Easy to edit (think "no trailing comma error"),
- Simple to parse.

In many ways, it's JSON with the CoffeeScript treatment.


## Example

The following file `example.set`:

    # Comments. They're actually useful.
    name: "The Settings File Format"
    version: 1.0
    That simple?: yes
    Can I nest?:
      - "You can nest lists…"
      - and: "obviously"
        objects: "too!"

… would correspond to this JSON:

    {
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
    }


## Formal

Each file is UTF-8 encoded.

Primitives:

- dictionary
- array
- string
- number
- boolean (`yes` or `no`)
- null (`nil`)

![String spec](http://json.org/string.gif)
![Number spec](http://json.org/number.gif)

dictionary:

    keyValue (newline keyValue)*

newline: ASCII character `0x0A` (or `0x0D`, but don't use it).

keyValue of indentation `indent`:

    (unquotedKey OR string) : unquotedPrimitive
    OR
    (unquotedKey OR string) : newline indent primitive

unquotedKey:

    (any unicode character but `:` and `-` and `"`)
    (any unicode character but `:`)*

unquotedPrimitive:

    any primitive but dictionary
    OR
    dictionary not starting with `"`

indent: sequence of ASCII characters `0x20`. Nothing else.

array of indentation `indent`:

    `-` primitive (newline indent `-` primitive)*


## Functional requirements

- Arrays must conserve order.
- Order of dictionary entries is meaningless.
- If a dictionary has duplicate entries, only keep the last one.
  Don't crash, don't throw.
- Numbers must be decoded in a format at least as precise as IEEE754.


## Why?

Because I hate to see projects use `.ini` files. It is ugly and poorly specified
(if at all).

Because I hate to see projects use `.xml` files. It is even uglier and supports
namespaces.

Because YAML is overly complex to parse.

Because JSON is just fine, but people find it too raw and hard to edit.


## I want my tabs! I want my CR-LF! I want my Big5!

Having just one possibility for invisible characters / encoding makes it easier
to not screw things up. The last thing anyone wants to screw up is the config
file.
