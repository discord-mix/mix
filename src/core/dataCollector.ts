import {Guild, GuildMember} from "discord.js";
import Log from "./log";

export enum MemberDataType {
    Username,
    Status,
    State,
    Avatar,
    Nickname,
    Roles,
    Everything
}

export enum MemberType {
    User,
    Bot,
    Everyone
}

export type ConditionCallback = (member: GuildMember) => boolean;

export interface IDataCollector {
    collect(dataType: MemberDataType): this;
    from(memberType: MemberType): this;
    where(condition: ConditionCallback): this;
    finish(): GuildMember[];
}

// TODO: Should also be able to call a callback function every X iterations.
export default class DataCollector implements IDataCollector {
    protected readonly guild: Guild;
    protected readonly collectionType: MemberDataType;

    protected fromType: MemberType;
    protected whereCondition?: ConditionCallback;

    public constructor(guild: Guild) {

        this.guild = guild;
        this.collectionType = MemberDataType.Everything;
        this.fromType = MemberType.Everyone;
    }

    public collect(dataType: MemberDataType): this {
        // TODO

        return this;
    }

    public from(memberType: MemberType): this {
        this.fromType = memberType;

        return this;
    }

    public where(condition: ConditionCallback): this {
        this.whereCondition = condition;

        return this;
    }

    /**
     * Collect accomulated data.
     */
    public finish(): GuildMember[] {
        const members: GuildMember[] = this.guild.members.array();

        const result: GuildMember[] = [];

        for (const member of members) {
            if (this.fromType === MemberType.User && member.user.bot) {
                continue;
            }
            else if (this.fromType === MemberType.Bot && !member.user.bot) {
                continue;
            }

            result.push(member);
        }

        if (this.whereCondition) {
            result.filter(this.whereCondition);
        }

        if (this.collectionType !== MemberDataType.Everything) {
            result.map((member) => {
                // TODO: Checks should be outside for better performance?
                switch (this.collectionType) {
                    case MemberDataType.Avatar: {
                        return member.user.avatarURL;
                    }

                    case MemberDataType.Nickname: {
                        return member.nickname;
                    }

                    case MemberDataType.Roles: {
                        return member.roles;
                    }

                    case MemberDataType.State: {
                        return member.user.presence.status;
                    }

                    case MemberDataType.Status: {
                        return member.user.presence.game;
                    }

                    default: {
                        throw Log.error(`Invalid collection type: ${this.collectionType}`);
                    }
                }
            });
        }

        return result;
    }
}
