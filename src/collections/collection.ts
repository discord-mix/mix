import EventEmitter from "events";
import {default as _} from "lodash";

/**
 * @extends EventEmitter
 */
export default class ArrayCollection extends EventEmitter {
    private readonly items: any[];

    /**
     * @param {Array} items
     */
    public constructor(items: any[] = []) {
        super();

        /**
         * @type {Array<*>}
         * @private
         */
        this.items = items;
    }

    /**
     * Get an item in this collection by its index
     * @param {number} index
     * @return {*}
     */
    public at(index: number): any {
        return this.items[index];
    }

    /**
     * Remove an item from this collection by its index
     * @param {number} index
     * @return {boolean} Whether the item was removed
     */
    public removeAt(index: number): boolean {
        if (this.items[index] !== null && this.items[index] !== undefined) {
            this.emit("itemRemoved", this.items[index]);
            this.items.splice(index, 1);

            return true;
        }

        return false;
    }

    /**
     * Add an item to this collection
     * @param {*} item
     */
    public add(item: any): void {
        this.items.push(item);
        this.emit("itemAdded", item);
    }

    /**
     * Add an item to this collection only if it doesn't already exist
     * @param {*} item
     * @return {boolean} Whether the item was added
     */
    public addUnique(item: any): boolean {
        if (!this.contains(item)) {
            this.add(item);

            return true;
        }

        return false;
    }

    /**
     * Determine whether this collection contains an item
     * @param {*} item
     * @return {boolean}
     */
    public contains(item: any): boolean {
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i] === item) {
                return true;
            }
        }

        return false;
    }

    /**
     * Find an item in this collection
     * @param {string} path
     * @param {*} value
     */
    public find(path: string, value: any): any {
        for (let i = 0; i < this.items.length; i++) {
            if (_.get(this.items[i], path) === value) {
                return this.items[i];
            }
        }

        return null;
    }
}

export class GenericCollection<KeyType, ValueType> extends Map<KeyType, ValueType> {
    private cachedValueArray: ValueType[] | null;
    private cachedKeyArray: KeyType[] | null;

    public constructor(iterable: any) {
        super(iterable);

        this.cachedValueArray = null;
        this.cachedKeyArray = null;
    }

    private resetCache(): this {
        this.cachedKeyArray = null;
        this.cachedValueArray = null;

        return this;
    }

    public set(key: KeyType, value: ValueType): this {
        this.resetCache();
        super.set(key, value);

        return this;
    }

    public delete(key: KeyType): boolean {
        this.resetCache();

        return super.delete(key);
    }

    public array(): ValueType[] {
        if (this.cachedValueArray !== null) {
            return this.cachedValueArray;
        }

        const result: ValueType[] = [...this.values()];

        if (this.cachedValueArray === null) {
            this.cachedValueArray = result;
        }

        return result;
    }

    public keysArray(): KeyType[] {
        if (this.cachedKeyArray !== null) {
            return this.cachedKeyArray;
        }

        const result: KeyType[] = [...this.keys()];

        if (this.cachedKeyArray === null) {
            this.cachedKeyArray = result;
        }

        return result;
    }

    public first(): ValueType | null {
        return this.values().next().value || null;
    }

    public firstKey(): KeyType | null {
        return this.keys().next().value || null;
    }
}