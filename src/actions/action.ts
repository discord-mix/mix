export enum ActionType {
    // Misc
    StartTyping,
    StopTyping,

    // Bot
    BotSetUsername,
    BotSetAvatar,
    BotSetState,
    BotSetStatus,

    // Messages
    Message,
    MessageUpdate,
    MessageDelete,
    RichEmbed,
    Reply,
    PrivateReply,
    PrivateMessage,
    PrivateRichEmbed,
    OkEmbed,
    FailEmbed,

    // Paginated Messages
    PaginatedOkEmbed,

    // Reactions
    ReactionAdd,
    ReactionRemove,
    ReactionRemoveAll,

    // Roles
    RoleCreate,
    RoleDelete,
    RoleUpdate,

    // Guild
    GuildLeave,
    GuildMemberKick,
    GuildMemberBan,
    GuildMemberUpdateRoles,
    GuildMemberRemoveRole,
    GuildMemberAddRole,
    GuildRename
}

export interface IAction<T = any> {
    readonly type: ActionType;
    readonly args: T;
}
