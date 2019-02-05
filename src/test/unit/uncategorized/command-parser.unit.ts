import {Unit, Test, Assert, Feed, Is, JsType, Does} from "unit";
import CommandParser from "../../../commands/command-parser";
import {Type} from "../../../commands/type";
import {RawArguments, InputArgument} from "../../../commands/command";

@Unit("Command Parser")
default class {
    @Test("getArguments(): should return valid arguments")
    public getArguments_returnValidArgs() {
        const result: RawArguments = CommandParser.getArguments("[prefix] john_doe apples 100", [
            {
                name: "name",
                type: Type.string
            },
            {
                name: "favoriteFood",
                type: Type.string
            },
            {
                name: "favoriteNumber",
                type: Type.integer
            }
        ]);

        Assert.equal(result[0], "john_doe");
        Assert.equal(result[1], "apples");
        Assert.equal(result[2], "100");
    }

    @Test("getArguments(): should parse command strings with double quote usage")
    public getArguments_parseWithDoubleQuotes() {
        const result: RawArguments = CommandParser.getArguments("[prefix] \"sir john doe\" apples 100", [
            {
                name: "name",
                type: Type.string
            },
            {
                name: "favoriteFood",
                type: Type.string
            },
            {
                name: "favoriteNumber",
                type: Type.integer
            }
        ]);

        Assert.that(result,
            Is.arrayOf(JsType.String),
            Does.haveLength(3)
        );

        Assert.equal(result[0], "sir john doe");
        Assert.equal(result[1], "apples");
        Assert.equal(result[2], "100");
    }

    @Test("getArguments(): should parse command strings with single quote usage")
    public getArguments_parseWithSingleQuotes() {
        const result: RawArguments = CommandParser.getArguments("[prefix] \'sir john doe\' apples 100", [
            {
                name: "name",
                type: Type.string
            },
            {
                name: "favoriteFood",
                type: Type.string
            },
            {
                name: "favoriteNumber",
                type: Type.integer
            }
        ]);

        Assert.that(result,
            Is.arrayOf(JsType.String),
            Does.haveLength(3)
        );

        Assert.equal(result[0], "sir john doe");
        Assert.equal(result[1], "apples");
        Assert.equal(result[2], "100");
    }

    @Test("getArguments(): should parse command strings with backquote usage")
    public getArguments_parseWithBackQuotes() {
        const result: RawArguments = CommandParser.getArguments("[prefix] \`sir john doe\` apples 100", [
            {
                name: "name",
                type: Type.string
            },
            {
                name: "favoriteFood",
                type: Type.string
            },
            {
                name: "favoriteNumber",
                type: Type.integer
            }
        ]);

        Assert.that(result,
            Is.arrayOf(JsType.String),
            Does.haveLength(3)
        );

        Assert.equal(result[0], "sir john doe");
        Assert.equal(result[1], "apples");
        Assert.equal(result[2], "100");
    }

    @Test("getArguments(): should parse command strings with multi-quote usage")
    public getArguments_parseWithMultiQuotes() {
        const result: RawArguments = CommandParser.getArguments("[prefix] \'sir john doe\' \"delicious apples\" \`more than 100\`", [
            {
                name: "name",
                type: Type.string
            },
            {
                name: "favoriteFood",
                type: Type.string
            },
            {
                name: "favoriteNumber",
                type: Type.integer
            }
        ]);

        Assert.that(result,
            Is.arrayOf(JsType.String),
            Does.haveLength(3)
        );

        Assert.equal(result[0], "sir john doe");
        Assert.equal(result[1], "delicious apples");
        Assert.equal(result[2], "more than 100");
    }

    @Test("getArguments(): should parse command strings with empty long flags")
    public getArguments_longEmptyFlags() {
        const result: InputArgument[] = CommandParser.getArguments("[prefix] --verbose --inspect", [
            {
                name: "verbose",
                type: Type.boolean
            },
            {
                name: "inspect",
                type: Type.boolean
            }
        ]);

        Assert.that(result,
            Is.arrayOf(JsType.Boolean),
            Does.haveLength(2)
        );

        Assert.equal(result[0], true);
        Assert.equal(result[1], true);
    }

    @Test("getArguments(): should parse command strings' long flags with explicit values")
    public getArguments_longFlagsExplicitValues() {
        const result: InputArgument[] = CommandParser.getArguments("[prefix] --verbose=false --inspect=true --continue=false", [
            {
                name: "verbose",
                type: Type.boolean
            },
            {
                name: "inspect",
                type: Type.boolean
            },
            {
                name: "continue",
                type: Type.boolean
            }
        ]);

        Assert.that(result,
            Is.arrayOf(JsType.Boolean),
            Does.haveLength(3)
        );

        Assert.equal(result[0], false);
        Assert.equal(result[1], true);
        Assert.equal(result[2], false);
    }

    @Test("getArguments(): should parse command strings with empty short flags")
    public getArguments_shortEmptyFlags() {
        const result: InputArgument[] = CommandParser.getArguments("[prefix] -v -i", [
            {
                name: "verbose",
                type: Type.boolean,
                flagShortName: "v"
            },
            {
                name: "inspect",
                type: Type.boolean,
                flagShortName: "i"
            }
        ]);

        Assert.that(result,
            Is.arrayOf(JsType.Boolean),
            Does.haveLength(2)
        );

        Assert.equal(result[0], true);
        Assert.equal(result[1], true);
    }

    @Test("getArguments(): should parse command strings' short flags with explicit values")
    public getArguments_shortFlagsExplicitValues() {
        const result: InputArgument[] = CommandParser.getArguments("[prefix] -v=false -i=true -c=false", [
            {
                name: "verbose",
                type: Type.boolean,
                flagShortName: "v"
            },
            {
                name: "inspect",
                type: Type.boolean,
                flagShortName: "i"
            },
            {
                name: "continue",
                type: Type.boolean,
                flagShortName: "c"
            }
        ]);

        Assert.that(result,
            Is.arrayOf(JsType.Boolean),
            Does.haveLength(3)
        );

        Assert.equal(result[0], false);
        Assert.equal(result[1], true);
        Assert.equal(result[2], false);
    }

    @Test("getArguments(): should throw when provided invalid arguments")
    @Feed(null, null)
    @Feed(undefined, undefined)
    @Feed(0, 1)
    @Feed(1, 0)
    @Feed(true, false)
    @Feed(false, true)
    public getArguments_throwOnInvalidParams(comamndString: any, schema: any) {
        Assert.throws(() => CommandParser.getArguments(comamndString, schema));
    }

    // TODO: More tests required.
}