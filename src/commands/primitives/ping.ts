import {CommandOptions} from "../command";
import CommandExecutionContext from "../command-execution-context";

const command: CommandOptions = {
    meta: {
        name: "ping",
        desc: "View the latency and heartbeat of the bot"
    },

    executed: (context: CommandExecutionContext): void => {
        context.ok(`:ping_pong: ${context.bot.client.ping}ms`); // TODO: Missing heartbeat
    }
};

export default command;