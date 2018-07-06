import {CommandOptions} from "../../../commands/command";
import Permission from "../../../core/permission";
import CommandContext from "../../../commands/command-context";
import {GuildMember, Role} from "discord.js";

export default <CommandOptions>{
    meta: {
        name: "role",

        args: {
            role: "!string",
            member: "!:member"
        }
    },

    restrict: {
        issuerPerms: [Permission.ManageRoles, Permission.ManageGuild]
    },

    executed: (context: CommandContext): void => {
        if (!context.arguments[1]) {
            context.fail("No member found");

            return;
        }

        let role: Role = context.message.guild.roles.find("name", context.arguments[0]);

        if (!role) {
            role = context.message.guild.roles.find("name", ((<string>context.arguments[0]).charAt(0).toUpperCase() + (<string>context.arguments[0]).slice(1)))

            if (!role) {
                context.fail("Invalid role or does not exist.");

                return;
            }
        }

        const member = <GuildMember>context.arguments[1];

        if (!member.roles.exists("name", role.name)) {
            member.addRole(role).catch((error: Error) => {
                context.fail(`Operation failed. (${error.message})`);
            }).then(() => {
                context.ok(`Role <@&${role.id}> was successfully **added** to <@${member.id}>.`);
            });
        }
        else {
            member.removeRole(role).catch((error: Error) => {
                context.fail(`Operation failed. (${error.message})`);
            }).then(() => {
                context.ok(`Role <@&${role.id}> was successfully **removed** from <@${member.id}>.`);
            });
        }

    }
};
