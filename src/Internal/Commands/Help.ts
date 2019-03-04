import {RichEmbed} from "discord.js";
import Command from "../../Commands/Command";
import Context from "../../Commands/Context";
import {ReadonlyCommandMap} from "../../Commands/CommandRegistry";
import {Description, Name} from "../../Decorators/General";

@Name("help")
@Description("View available commands and their descriptions")
export default class extends Command {
    public async run($: Context): Promise<void> {
        // TODO: Decorator commands broke it (can't .map through a Map)

        const commandMap: ReadonlyCommandMap = $.bot.registry.getAll();
        const commands: Command[] = [];

        for (const [base, command] of commandMap) {
            if (command instanceof Command) {
                commands.push(command);
            }
        }

        const commandsString: string = commands
            .map((command: Command) => `**${command.meta.name}**: ${command.meta.description}`)
            .join("\n");

        if ($.bot.options.dmHelp) {
            await (await $.sender.createDM()).send(new RichEmbed()
                .setColor("GREEN")
                .setDescription(commandsString)).catch(async (error: Error) => {

                    if (error.message === "Cannot send messages to this user") {
                        await $.fail("You're not accepting direct messages.");
                    }
                    else {
                        await $.fail(`I was unable to send you my commands. (${error.message})`);
                    }
                });
        }
        else {
            await $.ok(commandsString, "Help - Available Commands");
        }
    }
}