import Bot from "../core/bot";
import {DiscordEvent} from "../decorators/utility";
import {GenericService, IService, IServiceOptions} from "./generic-service";

export default abstract class Service extends GenericService implements IService {
    public readonly listeners: Map<DiscordEvent, any>;

    protected readonly bot: Bot;

    /**
     * @todo Just accept bot and api, no need for Options obj
     * @param {IServiceOptions} options
     */
    protected constructor(options: IServiceOptions) {
        super();

        /**
         * @type {Bot}
         * @readonly
         */
        this.bot = options.bot;

        /**
         * @type {Map<DiscordEvent, *>}
         * @readonly
         */
        this.listeners = new Map();
    }

    public dispose(): void {
        for (const [event, handler] of this.listeners) {
            this.bot.client.removeListener(event, handler);
        }
    }

    /**
     * Whether the service is running
     * @return {boolean}
     */
    public get running(): boolean {
        // TODO: This is just template-future-code (does NOT work!)
        // ... Need someway to check if the service is actually running (not just saved + stopped)
        return this.bot.services.contains(this.meta.name);
    }

    /**
     * @param {DiscordEvent} event
     * @param {*} handler
     * @return {this}
     */
    protected on(event: DiscordEvent, handler: any): this {
        this.bot.client.on(event, handler);
        this.listeners.set(event, handler);

        return this;
    }
}
