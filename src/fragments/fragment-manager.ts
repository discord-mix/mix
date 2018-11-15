import {EventEmitter} from "events";
import {Bot, Command, Log, Service, ForkedService} from "..";
import {IPackage} from "./fragment-loader";
import {DefaultCommandRestrict} from "../commands/command";

export default class FragmentManager extends EventEmitter {
    private readonly bot: Bot;

    public constructor(bot: Bot) {
        super();

        this.bot = bot;
    }

    /**
     * Enable and register fragments
     * @param {IFragment[]} packages
     * @param {boolean} [internal=false] Whether the fragments are internal
     * @return {Promise<number>} The amount of enabled fragments
     */
    public async enableMultiple(packages: IPackage[], internal: boolean = false): Promise<number> {
        let enabled: number = 0;

        for (let i: number = 0; i < packages.length; i++) {
            if (await this.enable(packages[i], internal)) {
                enabled++;
            }
        }

        return enabled;
    }

    public async enable(packg: IPackage, internal: boolean = false): Promise<boolean> {
        const mod: any = (packg.module as any).prototype;

        if (mod instanceof Command) {
            const command: any = new (packg.module as any)();

            // Command is not registered in internal commands
            if (internal && !this.bot.internalCommands.includes(command.meta.name)) {
                return false;
            }

            // TODO: Add a way to disable the warning
            if (!internal && command.meta.name === "eval") {
                Log.warn("Please beware that your eval command may be used in malicious ways and may lead to a full compromise of the local machine. To prevent this from happening, please use the default eval command included with Forge.");
            }

            // Overwrite command restrict with default values
            command.restrict = {
                ...DefaultCommandRestrict,
                ...command.restrict
            };

            if (await command.enabled()) {
                this.bot.commandStore.register({
                    module: command,
                    path: packg.path
                });

                return true;
            }
        }
        else if (mod instanceof Service || mod instanceof ForkedService) {
            const service: any = packg.module;

            this.bot.services.register(new service({
                bot: this,
                api: this.bot.getAPI()
            }));

            return true;
        }
        else {
            // TODO: Also add someway to identify the fragment
            Log.warn("[Bot.enableFragments] Unknown fragment instance, ignoring");
        }

        return false;
    }
}