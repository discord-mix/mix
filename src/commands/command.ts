import ChatEnv from "../core/chat-env";
import Context, {IContext} from "./command-context";
import {IFragment, IMeta} from "../fragments/fragment";
import {Message, RichEmbed} from "discord.js";
import Bot from "../core/bot";
import {IDisposable} from "../core/helpers";
import {PromiseOr} from "@atlas/xlib";

export type CommandExeHandler<TArgs extends object = object, TReturn = any> = (context: Context, args: TArgs, api: any) => TReturn;

/**
 * Restriction to common Discord groups.
 */
export enum RestrictGroup {
    ServerOwner,
    ServerModerator,
    BotOwner
}

export type DefaultValueResolver = (message: Message) => string;

export type ArgumentTypeChecker = (argument: string, message: Message) => boolean;

/**
 * Type                 : Internal check
 * RegExp               : Inline check
 * IArgumentTypeChecker : Provided type check by method
 */
export type ArgumentType = Type | ArgumentTypeChecker | RegExp | string;

export interface ICustomArgType {
    readonly name: string;
    readonly check: ArgumentTypeChecker | RegExp;
}

export type RawArguments = Array<string | number | boolean>;

export type DefiniteArgument = string | number | boolean;

export enum Type {
    /**
     * Represents a string. Input will not be converted.
     */
    String,

    /**
     * Represents an integer number. Input will be (attempted) parsed into an integer.
     */
    Integer,

    /**
     * Represents an unsigned integer, or a non-negative integer number. Input will be (attempted) parsed.
     */
    UnsignedInteger,

    /**
     * Represents a non-zero integer number. Input will be (attempted) parsed.
     */
    NonZeroInteger,

    /**
     * @todo Missing implementation.
     * Represents a positive integer number. Input will be (attempted) parsed.
     */
    PositiveInteger,

    /**
     * Represents a boolean value. Input will be parsed into a boolean.
     */
    Boolean
}

/**
 * Represents common Discord argument types.
 */
export enum InternalArgType {
    /**
     * Represents a user ID or a Twitter Snoflake.
     */
    Snowflake = "snowflake",

    /**
     * Represents a guild member.
     */
    Member = "member",

    /**
     * Represents a boolean value.
     */
    State = "state",

    /**
     * Represents a guild channel.
     */
    Channel = "channel",

    /**
     * Represents a guild member role.
     */
    Role = "role"
}

export interface IArgumentResolver {
    readonly name: string;
    readonly resolve: (argument: DefiniteArgument, message: Message) => any;
}

export interface IArgument {
    readonly name: string;
    readonly type: ArgumentType;
    readonly description?: string;
    readonly defaultValue?: DefiniteArgument | DefaultValueResolver;
    readonly required?: boolean;

    // TODO: CRTICAL: X2 : Must verify that the same short switch isn't already being used by another argument of the same command.
    readonly switchShortName?: string;
}

export type SpecificConstraints = Array<string | RestrictGroup>;

/**
 * Limitations and restrictions by which the execution environment and the command issuer must abide to.
 */
export interface IConstraints {
    selfPermissions: any[];
    issuerPermissions: any[];
    environment: ChatEnv;
    auth: number;
    specific: SpecificConstraints;
    cooldown: number;
}

export const DefaultCommandRestrict: IConstraints = {
    auth: 0,
    cooldown: 0,
    environment: ChatEnv.Anywhere,
    issuerPermissions: [],
    selfPermissions: [],
    specific: []
};

/**
 * Represents a command exeuction result status.
 */
export enum CommandStatus {
    /**
     * The command executed successfully.
     */
    OK,

    /**
     * The command execution failed.
     */
    Failed
}

export interface ICommandResult {
    readonly responses: Array<string | RichEmbed>;
    readonly status: CommandStatus | number;
}

export type CommandRunner<T = ICommandResult | any> = (context: IContext, args: any) => T;

export type CommandRelay<T = any> = (context: Context, args: T, command: IGenericCommand) => void;

/**
 * Represents a command middleware function that will determine whether the command execution sequence may continue.
 */
export type CommandGuard<T = any> = (context: Context, args: T, command: IGenericCommand) => boolean;

export interface IGenericCommand<T extends object = object> extends IFragment, IDisposable {
    readonly minArguments: number;
    readonly maxArguments: number;
    readonly meta: IMeta;
    readonly aliases: string[];
    readonly args: IArgument[];
    readonly constraints: IConstraints;
    readonly exclude: string[];
    readonly singleArg: boolean;
    readonly isEnabled: boolean;
    readonly undoable: boolean;
    readonly connections: CommandRelay[];
    readonly dependsOn: string[];
    readonly guards: CommandGuard[];

    undo(oldContext: Context, message: Message, args: T): PromiseOr<boolean>;
    enabled(): PromiseOr<boolean>;
    run(context: Context, args: T): ICommandResult | any;
    isExcluded(query: string): boolean;
}

export abstract class GenericCommand<T extends object = object> implements IGenericCommand<T> {
    public readonly meta: IMeta = {
        // Leave empty intentionally so the fragment validator complains.
        name: ""
    };

    public readonly aliases: string[] = [];
    public readonly args: IArgument[] = [];
    public readonly constraints: IConstraints = Object.assign({}, DefaultCommandRestrict);
    public readonly exclude: string[] = [];
    public readonly singleArg: boolean = false;
    public readonly isEnabled: boolean = true;
    public readonly undoable: boolean = false;
    public readonly connections: CommandRelay[] = [];
    public readonly dependsOn: string[] = [];
    public readonly guards: CommandGuard[] = [];

    protected readonly bot: Bot;

    protected constructor(bot: Bot) {
        /**
         * @type {Bot}
         * @protected
         * @readonly
         */
        this.bot = bot;
    }

    // TODO: Implement/shouldn't be negative response?
    public async undo(oldContext: Context, message: Message, args: T): Promise<boolean> {
        await message.reply("That action cannot be undone");

        return false;
    }

    public dispose(): void {
        //
    }

    /**
     * @return {Promise<boolean>} Whether the command can be enabled.
     */
    public async enabled(): Promise<boolean> {
        return true;
    }

    public abstract run(context: Context, args: T): ICommandResult | any;

    /**
     * @return {number} The minimum amount of required arguments that this command accepts.
     */
    public get minArguments(): number {
        return this.args.filter((arg: IArgument) => arg.required).length;
    }

    /**
     * @return {number} The maximum amount of arguments that this command accepts.
     */
    public get maxArguments(): number {
        return this.args.length;
    }

    /**
     * @param {string} query
     * @return {boolean} Whether the query is excluded.
     */
    public isExcluded(query: string): boolean {
        return this.exclude.includes(query);
    }
}

/**
 * @extends GenericCommand
 */
export abstract class Subcommand<T extends object = object> extends GenericCommand<T> {
    //
}

/**
 * Base command class. The 'meta.name' property must be set.
 * @extends GenericCommand
 */
export default abstract class Command<T extends object = object> extends GenericCommand<T> {
    public readonly subcommands: Subcommand<T>[] = [];

    /**
     * @todo canExecute should default boolean, same concept as Service
     * @param {Context} context
     * @return {boolean} Whether this command may be executed
     */
    public canExecute(context: Context): boolean {
        return true;
    }
}
