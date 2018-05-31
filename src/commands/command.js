import ChatEnvironment from "../core/chat-environment";

const Typer = require("@raxor1234/typer/typer");

export default class Command {
    /**
     * @param {Object} data
     */
    constructor(data) {
        // Setup the command from the provided object
        this.setup(data);
    }

    /**
     * @todo [CRITICAL] Reflect default data changes throughout project
     * Setup the command from an object
     * @param {Object} data
     */
    setup(data) {
        /**
         * @type {String}
         * @readonly
         */
        this.name = data.meta.name;

        /**
         * @type {String}
         * @readonly
         */
        this.description = data.meta.desc ? data.meta.desc : "No description provided";

        /**
         * @type {Array<String>}
         * @readonly
         */
        this.aliases = data.meta.aliases ? data.meta.aliases : [];

        /**
         * @type {Function}
         * @readonly
         */
        this.executed = data.executed;

        /**
         * @type {Function}
         * @readonly
         */
        this.canExecute = data.canExecute ? data.canExecute : null;

        /**
         * @type {Object}
         * @readonly
         */
        this.args = data.meta.args ? data.meta.args : {};

        /**
         * @type {Boolean}
         * @readonly
         */
        this.isEnabled = data.restrict.enabled !== undefined ? data.restrict.enabled : true;

        /**
         * @type {Number}
         * @readonly
         */
        this.cooldown = data.restrict.cooldown ? data.restrict.cooldown : 0;

        /**
         * @type {Array<Number>}
         */
        this.permissions = data.restrict.permissions ? data.restrict.permissions : [];

        /**
         * @type {ChatEnvironment|Array<ChatEnvironment>}
         * @readonly
         */
        this.environment = data.restrict.env !== undefined ? data.restrict.env : ChatEnvironment.Anywhere;

        // TODO: Default auth level to 'default'
        /**
         * @type {AccessLevelType}
         * @readonly
         */
        this.auth = data.restrict.auth !== undefined ? data.restrict.auth : 0;
    }

    /**
     * @return {Number} The minimum amount of required arguments that this command accepts
     */
    get maxArguments() {
        const keys = Object.keys(this.args);

        let counter = 0;

        for (let i = 0; i < keys.length; i++) {
            if (this.args[keys[i]].startsWith("!")) {
                counter++;
            }
        }

        return counter;
    }

    /**
     * Validate a command module
     * @param {Object} data The module to validate
     * @return {Boolean} Whether the module is valid
     */
    static validate(data) {
        const methods = Typer.validate({
            executed: "!function",
            meta: "!object",
            canExecute: "function",
            restrict: "object"
        }, data);

        const meta = Typer.validate({
            name: "!string",
            desc: "string",
            args: "object",
            aliases: ":array",
            isEnabled: "boolean",
        }, data.meta, {
            array: (val) => val instanceof Array
        });

        const restrict = Typer.validate({
            auth: "number",
            permissions: ":array",
            env: "number"
        }, data.restrict, {
            array: (val) => val instanceof Array
        });

        return (methods && meta && restrict);
    }
}
