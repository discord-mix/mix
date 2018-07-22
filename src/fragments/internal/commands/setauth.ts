import Command from "../../../commands/command";
import CommandContext from "../../../commands/command-context";
import JsonAuthStore from "../../../commands/auth-stores/json-auth-store";
import {GuildMember} from "discord.js";

export default class SetAuth extends Command {
    readonly meta = {
        name: "setauth",
        description: "Manage authentication levels"
    };

    readonly args = {
        user: "!:member",
        auth: "!number"
    };

    constructor() {
        super();

        // Owner only
        this.restrict.auth = -1;
    }

    public async executed(context: CommandContext): Promise<void> {
        if (context.arguments[1] < 0) {
            await context.fail("Authorization level must be higher than zero.");

            return;
        }

        const member: GuildMember = <GuildMember>context.arguments[0];

        const result: boolean = (<JsonAuthStore>context.bot.authStore).setUserAuthority(
            context.message.guild.id,
            member.id,
            context.arguments[1]
        );

        await (<JsonAuthStore>context.bot.authStore).save();

        if (!result) {
            await context.fail("That authorization level does not exist.");

            return;
        }

        await context.ok(`<@${member.id}> now has authorization level of **${context.arguments[1]}**.`);
    }
};
