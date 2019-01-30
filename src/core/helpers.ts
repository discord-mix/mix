import {PromiseOr} from "@atlas/xlib";

/**
 * Represents a class with disposable resources.
 */
export interface IDisposable<T = any> {
    dispose(): PromiseOr<T>;
}

/**
 * Represents a class with the ability to persist data and/or resources.
 */
export interface IVolatile<T = any> {
    save(): PromiseOr<T>;
}

export interface ITimeoutAttachable {
    setTimeout(action: any, time: number): PromiseOr<NodeJS.Timeout>;
    setInterval(action: any, time: number): PromiseOr<NodeJS.Timeout>;
}

/**
 * Represents a class with the ability of loading stored resources.
 */
export interface ISyncable<T = any> {
    sync(): PromiseOr<T>;
}
