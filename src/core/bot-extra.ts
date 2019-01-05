import {UserGroup} from "../commands/command";
import {Snowflake, Message, Client} from "discord.js";
import {IArgumentResolver, ICustomArgType, Reducer, IDisposable, PromiseOr, ISettings, ICommandStore, IConsoleInterface, ActionInterpreter, ITaskManager, IStore, Settings, IActionInterpreter} from "..";
import {EventEmitter} from "events";
import {ITimeoutAttachable} from "./helpers";
import {ITemp} from "./temp";
import {IServiceManager} from "../services/service-manager";
import {ICommandHandler} from "../commands/command-handler";
import Language, {ILanguage} from "../language/language";
import {IOptimizer} from "../optimization/optimizer";
import {IFragmentManager} from "../fragments/fragment-manager";
import {IPathResolver} from "./path-resolver";
import {IStatsCounter} from "./stat-counter";

export interface IBotModules {
    readonly store: IStore;
    readonly paths: IPathResolver;
    readonly temp: ITemp;
    readonly client: Client;
    readonly serviceManager: IServiceManager;
    readonly commandStore: ICommandStore;
    readonly commandHandler: ICommandHandler;
    readonly consoleInterface: IConsoleInterface;
    readonly language: ILanguage;
    readonly statsCounter: IStatsCounter;
    readonly actionInterpreter: IActionInterpreter;
    readonly taskManager: ITaskManager;
    readonly optimizer: IOptimizer;
    readonly fragmentManager: IFragmentManager;
}

// TODO: Already made optional by Partial?
export interface IBotOptions<T> {
    readonly settings: ISettings;
    readonly prefixCommand?: boolean;
    readonly internalCommands?: InternalCommand[];
    readonly userGroups?: UserGroup[];
    readonly owner?: Snowflake;
    readonly options?: Partial<IBotExtraOptions>;
    readonly argumentResolvers?: IArgumentResolver[];
    readonly argumentTypes?: ICustomArgType[];
    readonly languages?: string[];
    readonly initialState?: T;
    readonly reducers?: Reducer<T>[];
    readonly modules?: IBotModules;
}

export type Action<T = void> = () => T;

export interface IBotEmojiOptions {
    readonly success: string;
    readonly error: string;
}

/**
 * Extra options used by the bot
 */
export interface IBotExtraOptions {
    readonly asciiTitle: boolean;
    readonly consoleInterface: boolean;
    readonly allowCommandChain: boolean;
    readonly updateOnMessageEdit: boolean;
    readonly checkCommands: boolean;
    readonly autoDeleteCommands: boolean;
    readonly ignoreBots: boolean;
    readonly autoResetAuthStore: boolean;
    readonly logMessages: boolean;
    readonly dmHelp: boolean;
    readonly emojis: IBotEmojiOptions;
    readonly optimizer: boolean;
}

/**
 * Events fired by the bot
 */
export enum EBotEvents {
    SetupStart = "setupStart",
    LoadingInternalFragments = "loadInternalFragments",
    LoadedInternalFragments = "loadedInternalFragments",
    LoadingServices = "loadServices",
    LoadedServices = "loadedServices",
    LoadingCommands = "loadCommands",
    LoadedCommands = "loadedCommands",
    Ready = "ready",
    HandleMessageStart = "handleMessageStart",
    HandleMessageEnd = "handleMessageEnd",
    HandleCommandMessageStart = "handleCommandMessageStart",
    HandleCommandMessageEnd = "handleCommandMessageEnd",
    Restarting = "restartStart",
    Restarted = "restartCompleted",
    Disconnecting = "disconnecting",
    Disconnected = "disconnected",
    ClearingTemp = "clearingTemp",
    ClearedTemp = "clearedTemp",
    HandlingCommand = "handlingCommand",
    CommandError = "commandError",
    CommandExecuted = "commandExecuted"
}

/**
 * Possible states of the bot
 */
export enum BotState {
    Disconnected,
    Connecting,
    Restarting,
    Suspended,
    Connected
}

export enum InternalCommand {
    CLI = "cli",
    Eval = "eval",
    Help = "help",
    Ping = "ping",
    Prefix = "prefix",
    Reflect = "reflect",
    Restart = "restart",
    Throw = "throw",
    Usage = "usage"
}

export type BotToken = string;

export type Snowflake = string;

export interface IBot<TState = any, TActionType = any> extends EventEmitter, IDisposable, ITimeoutAttachable {
    postStats(): PromiseOr<void>;
    suspend(suspend: boolean): this;
    triggerCommand(base: string, referer: Message, ...args: string[]): PromiseOr<any>;
    clearTimeout(timeout: NodeJS.Timeout): boolean;
    clearAllTimeouts(): number;
    clearInterval(interval: NodeJS.Timeout): boolean;
    clearAllIntervals(): number;
    handleMessage(msg: Message, edited: boolean): PromiseOr<boolean>;
    handleCommandMessage(message: Message, content: string, resolvers: any): PromiseOr<void>;
    connect(): PromiseOr<this>;
    restart(reloadModules: boolean): PromiseOr<this>;
    disconnect(): PromiseOr<this>;
    clearTemp(): void;

    readonly settings: ISettings;
    readonly temp: ITemp;
    readonly services: IServiceManager;
    readonly commandStore: ICommandStore;
    readonly commandHandler: ICommandHandler;
    readonly console: IConsoleInterface;
    readonly prefixCommand: boolean;
    readonly internalCommands: InternalCommand[];
    readonly userGroups: UserGroup[];
    readonly owner?: Snowflake;
    readonly options: IBotExtraOptions;
    readonly language?: Language;
    readonly argumentResolvers: IArgumentResolver[];
    readonly argumentTypes: ICustomArgType[];
    readonly disposables: IDisposable[];
    readonly actionInterpreter: ActionInterpreter;
    readonly tasks: ITaskManager;
    readonly timeouts: NodeJS.Timeout[];
    readonly intervals: NodeJS.Timeout[];
    readonly languages?: string[];
    readonly state: BotState;
    readonly suspended: boolean;
    readonly client: Client;
    readonly optimizer: IOptimizer;
    readonly fragments: IFragmentManager;
    readonly paths: IPathResolver;
    readonly store: IStore<TState, TActionType>;
}