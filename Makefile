all: test package

test:
	node js/test

package:
	cat example.set | node js/cli-set.js > package.json

.PHONY: all test package
