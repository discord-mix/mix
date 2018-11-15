import Bot from "../core/bot";
import {IFragment, IFragmentMeta} from "../fragments/fragment";
import {IDisposable, DiscordEvent, SMIS} from "..";

// TODO: Move both enum and types elsewhere
export enum ProcessMsgType {
    Heartbeat,
    Stop,
    SmisProtocolHandshake,
    SmisProtocolRefuse,
    SmisProtocolAccept,
    StdOutPipe
}

export type IProcessMsg = {
    readonly type: ProcessMsgType;
    readonly data: any;
};

export type IRawProcessMsg = {
    readonly _d: any;
    readonly _t: ProcessMsgType;
}

export interface IServiceOptions {
    readonly bot: Bot;
    readonly api?: any;
}

export abstract class GenericService implements IFragment, IDisposable {
    public abstract meta: IFragmentMeta;
    public readonly fork: boolean = false;
    public readonly canStart: (() => boolean) | boolean = true;

    public stop(): void {
        //
    }

    public dispose(): void {
        //
    }

    public abstract start(): void;
}

export default abstract class Service<ApiType = undefined | any> extends GenericService {
    public readonly listeners: Map<DiscordEvent, any>;

    protected readonly bot: Bot;
    protected readonly api: ApiType;

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
         * @type {ApiType}
         * @readonly
         */
        this.api = options.api;

        /**
         * @type {Map<DiscordEvent, *>}
         * @readonly
         */
        this.listeners = new Map();
    }

    /**
     * 
     * @param {DiscordEvent} event
     * @param {*} handler
     * @return {this}
     */
    protected on(event: DiscordEvent, handler: any): this {
        this.bot.client.on(event, handler);
        this.listeners.set(event, handler);

        return this;
    }

    public dispose(): void {
        for (let [event, handler] of this.listeners) {
            this.bot.client.removeListener(event, handler);
        }
    }
}

export abstract class ForkedService extends GenericService {
    public readonly useSMIS: boolean = false;

    protected readonly smis?: SMIS;

    public onMessage(msg: IProcessMsg, sender: any): IProcessMsg[] | IProcessMsg | void {
        //
    }

    protected send(type: ProcessMsgType, data?: any): boolean {
        if (!process.send) {
            return false;
        }

        process.send({
            _t: type,
            _d: data
        });

        return true;
    }
}