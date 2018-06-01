const colors = require("colors");
const fs = require("fs");

export default class Log {
    /**
     * @param {String} message
     * @param {String} color
     * @param {String} prefix
     */
    static async log(message: string, color: string = "white", prefix: string = "") {
        const date = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");

        // TODO: Make this next line work on the vps
        // process.stdout.write(`\x1B[2D[${date}] ${colors[color](message)}\n> `);
        console.log(`[${date}] ${colors[color](message)}`);

        if (prefix !== null) {
            message = `<${prefix.toUpperCase()}> ${message}`;
        }

        fs.writeFile("bot.log", `[${date}] ${message}\n`, {
            flag: "a"
        }, (error: any) => {
            if (error) {
                throw error;
            }
        });
    }

    /**
     * @param {String} message
     */
    static info(message: string) {
        Log.log(message, "cyan", "info");
    }

    /**
     * @param {String} message
     */
    static success(message: string) {
        Log.log(message, "green", "sucs");
    }

    /**
     * @param {String} message
     */
    static warn(message: string) {
        Log.log(message, "yellow", "warn");
    }

    /**
     * @param {String} message
     */
    static error(message: string) {
        Log.log(message, "red", "dang");
    }

    /**
     * @param {String} message
     */
    static throw(message: string) {
        Log.log(message, "red", "dang");
        process.exit(1);
    }

    /**
     * @param {String} message
     */
    static async verbose(message: string) {
        Log.log(message, "grey");
    }

    /**
     * @param {String} message
     */
    static debug(message: string) {
        Log.log(message, "magenta", "dbug");
    }
}