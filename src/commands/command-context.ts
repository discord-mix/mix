import {DMChannel, Guild, Message, Snowflake, TextChannel} from "discord.js";
import {ChannelType} from "../actions/action-interpreter";
import Bot from "../core/bot";
import Log from "../core/log";
import BotMessages from "../core/messages";
import ResponseHelper from "../core/response-helper";
import Util from "../core/util";
import EmojiMenu from "../emoji-menu/emoji-menu";
import EditableMessage from "../message/editable-message";
import {IStore} from "../state/store";
import {PromiseOr} from "@atlas/xlib";

export interface IContextOptions {
    readonly msg: Message;
    readonly bot: Bot;
    readonly label: string | null;
}

export type TextBasedChannel = TextChannel | DMChannel;

export interface IContext<T extends TextBasedChannel = TextBasedChannel> extends ResponseHelper {
    readonly msg: Message;
    readonly label: string | null;
    readonly store: IStore;
    readonly g: Guild;
    readonly c: T;
    readonly triggeringMessageId: Snowflake;

    joinArguments(): string;
    reply(message: string): PromiseOr<Message | Message[] | null>;
    privateReply(message: string): PromiseOr<Message | Message[]>;
    createRequest(channel: TextBasedChannel, message: string, from: Snowflake, timeout: number): PromiseOr<string | null>;
    request(message: string, timeout?: number): PromiseOr<string | null>;
    requestDM(message: string, timeout?: number): PromiseOr<string | null>;
    promptDM(message: string, timeout: number): PromiseOr<boolean | null>;
}

/**
 * Represents the environment in which a command was executed.
 */
export default class Context<T extends TextBasedChannel = TextBasedChannel> extends ResponseHelper implements IContext {
    public readonly bot: Bot;
    public readonly msg: Message;
    public readonly label: string | null;

    /**
     * @param {IContextOptions} options
     */
    public constructor(options: IContextOptions) {
        if (options.msg.channel.type !== "text") {
            throw Log.error(BotMessages.CONTEXT_EXPECT_TEXT_CHANNEL);
        }

        super(options.msg.channel as TextChannel, options.bot, options.msg.author);

        /**
         * @type {Message}
         * @readonly
         */
        this.msg = options.msg;

        /**
         * @type {IBot}
         * @readonly
         */
        this.bot = options.bot;

        /**
         * @type {string}
         * @readonly
         */
        this.label = options.label;
    }

    /**
     * Access the bot's store.
     * @return {IStore}
     */
    public get store(): IStore {
        return this.bot.store;
    }

    /**
     * The guild in which the command was triggered.
     */
    public get g(): Guild {
        return this.msg.guild;
    }

    /**
     * The channel in which the command was triggered.
     */
    public get c(): T {
        return this.msg.channel as any;
    }

    /**
     * The ID of the triggering message.
     * @return {Snowflake}
     */
    public get triggeringMessageId(): Snowflake {
        return this.msg.id;
    }

    /**
     * Join all command arguments into a single string.
     * @return {string}
     */
    public joinArguments(): string {
        if (!this.label) {
            return this.msg.content;
        }

        return this.msg.content.substr(this.label.length + 1);
    }

    /**
     * @param {string} message
     * @return {Promise<Message | Message[] | null>}
     */
    public async reply(message: string): Promise<Message | Message[] | null> {
        return await this.msg.reply(Util.escapeText(message, this.bot.client.token));
    }

    /**
     * Reply to the command issuer through DMs.
     * @param {string} message
     * @return {Promise<Message | Message[]>}
     */
    public async privateReply(message: string): Promise<Message | Message[]> {
        return await this.msg.author.send(Util.escapeText(message, this.bot.client.token));
    }

    /**
     * Request an input from the user.
     * @param {string} message The message to send.
     * @param {Snowflake} from The user to expect response from.
     * @param {number} [timeout=7500] The time to wait until automatic cancellation.
     * @return {Promise<string | null>}
     */
    public async createRequest(channel: TextBasedChannel, message: string, from: Snowflake, timeout: number = 7500): Promise<string | null> {
        if (channel.type !== ChannelType.DM && channel.type !== ChannelType.Text) {
            throw Log.error(`Expecting channel '${channel.id}' to be either DMs or text-based`);
        }

        return new Promise<string | null>(async (resolve) => {
            const responseTimeout: NodeJS.Timeout = await this.bot.setTimeout(() => {
                this.bot.client.removeListener("message", listener);
                resolve(null);
            }, timeout);

            const listener: any = (msg: Message) => {
                if (msg.author.id !== from || msg.channel.id !== channel.id || !msg.content || typeof msg.content !== "string" || msg.content.startsWith("|")) {
                    return;
                }

                this.bot.clearTimeout(responseTimeout);
                resolve(msg.content);
            };

            this.bot.client.on("message", listener);
            await channel.send(message);
        });
    }

    /**
     * @param {string} message
     * @param {Promise<number | undefined>} timeout
     * @return {Promise<string | null>}
     */
    public async request(message: string, timeout?: number): Promise<string | null> {
        return this.createRequest(this.msg.channel as TextChannel | DMChannel, message, this.msg.author.id, timeout);
    }

    /**
     * @param {string} message
     * @param {number | undefined} timeout
     * @return {Promise<string | null>}
     */
    public async requestDM(message: string, timeout?: number): Promise<string | null> {
        return this.createRequest(await this.msg.author.createDM(), message, this.msg.author.id, timeout);
    }

    /**
     * @param {string} message
     * @param {number} [timeout=7500]
     * @return {Promise<boolean | null>}
     */
    public async promptDM(message: string, timeout: number = 7500): Promise<boolean | null> {
        const response: EditableMessage | null = await this.send(message);

        if (!response) {
            return false;
        }

        return await Util.createTimedAction<Promise<boolean>>(this.bot, (): Promise<boolean> => {
            return new Promise<boolean>((resolve) => {
                // TODO: Debugging?
                new EmojiMenu(response.msg.id, this.msg.author.id, [
                    {
                        emoji: "white_check_mark",

                        clicked: () => {
                            Log.debug("Check clicked!");
                            resolve(true);
                        }
                    },
                    {
                        emoji: "regional_indicator_x",

                        clicked: () => {
                            Log.debug("X clicked!");
                            resolve(false);
                        }
                    }
                ]);
            });
        }, timeout, null);
    }
}
