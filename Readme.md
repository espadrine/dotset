Dotset: The Settings File Format
================================

A format for settings.

- It's just JSON,
- Very readable,
- Easy to edit (think "no trailing comma error"),
- Simple to parse.

In many ways, it's JSON with the CoffeeScript treatment.

Also, it's a subset of YAML. YAML parsers parse dotset.


## Example

The following file `example.set`:

```yaml
    # Comments. They're actually useful.
    name: "Dotset: The Settings File Format"
    version: 1.0
    That simple?: yes
    Can I nest?:
      - You can nest lists…
      - and: obviously
        objects: too!
```

… would correspond to this JSON:

```javascript
    {
      "name": "Dotset: The Settings File Format",
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
```


## Formal

Each file is UTF-8 encoded.

Primitives:

- dictionary
- array
- string
- number
- boolean (`yes` or `no`)
- null (`null`)

- string: either rawString or the following.
![String spec](http://json.org/string.gif)

Also, Strings can escape newlines. Multiline strings for you.

![Number spec](http://json.org/number.gif)

- dictionary:

    keyValue (newline keyValue)*

- newline: ASCII character `0x0A` (or `0x0D`, but don't use it).

- keyValue of indentation `indent`:

    string : (whitespace)+ primitive
    OR
    string : (whitespace)+ newline indent primitive

- rawString:

    (any unicode character but `-` and `"` and digit)
    (any sequence of unicode character but (`:` (whitespace)+))*
    but not `yes`, `no`, `null`

- indent: sequence of ASCII characters `0x20`. Nothing else.

- non-empty array of indentation `indent`:

    `-` (whitespace)+ primitive (newline indent `-` (whitespace)+ primitive)*

- empty array:

    `[]`

- whitespace:

    (Unicode points 0x9 OR 0x20 OR 0xA0 OR 0x2000 - 0x200D OR 0x202F OR 0x205F
    OR 0x2060 OR 0x3000 OR 0xFEFF)+


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
