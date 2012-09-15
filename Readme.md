The Settings File Format
========================

A format for settings.

- Direct mapping to JSON,
- Very readable,
- Easy to edit (think "no trailing comma error"),
- Simple to parse.

## Example

The following file `example.set`:

    String: "string."
    Number: 1
    Null: null
    Boolean: true
    List:
      - 1
      - null

… would correspond to this JSON:

    {
     "String": "string.",
     "Number": 1,
     "Null": null,
     "Boolean": true,
     "List": [1, null]
    }

## Why?

Because I hate to see projects use `.ini` files. It is ugly.

Because I hate to see projects use `.xml` files. It is even uglier.

Because YAML is overly complex to parse.

Because JSON is just fine, but people find it too raw to use it for settings.
