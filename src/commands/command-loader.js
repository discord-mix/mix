import Command from "./command";
import Log from "../core/log";

const fs = require("fs");
const path = require("path");

export default class CommandLoader {
    /**
     * @param {CommandManager} commandManager
     */
    constructor(commandManager) {
        /**
         * @type {CommandManager}
         * @private
         * @readonly
         */
        this.commandManager = commandManager;
    }

    /**
     * Load all the commands from path
     * @returns {Promise}
     */
    async reloadAll() {
        // TODO: Implement
        // Note: relative path | Remove a module from cache
        // delete require.cache[require.resolve(`./${commandName}.js`)];

        return new Promise((resolve) => {
            Log.verbose(`[CommandLoader.loadAll] Loading commands`);

            this.commandManager.unloadAll();

            fs.readdir(this.commandManager.path, (error, files) => {
                let loaded = 0;

                files.forEach((file) => {
                    const moduleName = path.basename(file, ".js");

                    if (!file.startsWith("@")) {
                        const modulePath = path.join(this.commandManager.path, moduleName);

                        let module = require(modulePath);

                        // Support for ES6-compiled modules
                        if (module.default && typeof module.default === "object") {
                            module = module.default;
                        }

                        // Validate the command before registering it
                        if (Command.validate(module)) {
                            this.commandManager.register(new Command(module));
                            loaded++;
                        }
                        else {
                            Log.warn(`[CommandLoader.loadAll] Skipping invalid command: ${moduleName}`);
                        }
                    }
                    else {
                        Log.verbose(`[CommandLoader.loadAll] Skipping command: ${moduleName}`);
                    }
                });

                Log.success(`[CommandLoader.loadAll] Loaded a total of ${loaded} command(s)`);
                resolve();
            });
        });
    }

    load(pth) {
        // TODO
    }
}
