import {Bot} from "..";
import {Task} from "./task";
import Log from "../core/log";
import FragmentLoader, {IPackage} from "../fragments/fragment-loader";

export default class TaskManager {
    private readonly bot: Bot;
    private readonly tasks: Map<string, Task>;
    private readonly scheduler: Map<string, NodeJS.Timeout>;

    public constructor(bot: Bot) {
        this.bot = bot;
        this.tasks = new Map();
        this.scheduler = new Map();
    }

    public registerTask(task: Task): boolean {
        if (this.tasks.has(task.meta.name)) {
            return false;
        }

        this.tasks.set(task.meta.name, task);

        return true;
    }

    public enable(name: string): boolean {
        if (this.tasks.has(name)) {
            const task: Task = this.tasks.get(name) as Task;

            if (task.interval < 100) {
                Log.warn(`[TaskManager.enable] Refusing to enable task '${name}'; Interval must be 100ms or higher`);

                return false;
            }
            else if (task.canEnable(this.bot)) {
                task.enable(this.bot);

                this.scheduler.set(task.meta.name, setInterval(() => {
                    if (task.iterations >= task.maxIterations) {
                        this.disable(task.meta.name);
                    }
                    else if (task.canRun(this.bot)) {
                        task.run(this.bot);

                        (task as any).iterations++;
                        (task as any).lastIteration = Date.now();
                    }
                }, task.interval));

                return true;
            }
        }

        return false;
    }

    public unregisterAll(): this {
        for (let [name, task] of this.tasks) {
            this.disable(name);
        }

        return this;
    }

    public disable(name: string): boolean {
        if (!this.tasks.has(name)) {
            return false;
        }

        const task: Task = this.tasks.get(name) as Task;

        task.disable(this.bot);
        task.dispose();
        clearInterval(this.scheduler.get(task.meta.name) as NodeJS.Timeout);
        this.scheduler.delete(task.meta.name);

        return true;
    }

    public enableAll(): number {
        let enabled: number = 0;

        for (let [name, task] of this.tasks) {
            if (this.enable(name)) {
                enabled++;
            }
        }

        return enabled;
    }

    public isRegistered(name: string): boolean {
        return this.tasks.has(name);
    }

    public async loadAll(path: string): Promise<number> {
        const candidates: string[] | null = await FragmentLoader.pickupCandidates(path, true);

        if (candidates === null) {
            return 0;
        }

        const loaded: IPackage[] | null = await FragmentLoader.loadMultiple(candidates);

        if (loaded !== null) {
            for (let i: number = 0; i < loaded.length; i++) {
                this.registerTask(new (loaded[i].module as any)());
            }

            return loaded.length;
        }

        return 0;
    }
}