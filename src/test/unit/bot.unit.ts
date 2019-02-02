import {Unit, Test, Assert, Is, Does, Feed, Mock} from "unit";
import {init, testBot} from "../test-bot";
import {ArgResolvers} from "../../core/constants";
import DiscordEvent from "../../core/discord-event";
import TestData from "./test-data";

@Unit("Bot")
default class {
    @Test("should init and login")
    public async initAndLogin(): Promise<void> {
        // Mock client login
        testBot.client.login = Mock.fn(testBot.client.login)
            .once((): void => {
                (testBot.client.user as any) = {
                    id: TestData.id
                };

                testBot.client.emit(DiscordEvent.Ready);
            })

            .invoker;

        await init();

        Assert.that(testBot.client.user, Is.object);
    }

    @Test("should not be suspended")
    public notBeSuspended(): void {
        Assert.false(testBot.suspended);
    }

    @Test("should have no owner")
    public haveNoOwner(): void {
        Assert.that(testBot.owner, Is.undefined);
    }

    @Test("should have default argument resolvers")
    public defaultArgResolvers(): void {
        Assert.equal(testBot.argumentResolvers, ArgResolvers);
    }

    @Test("should not handle invalid messages")
    @Feed(undefined)
    @Feed(null)
    @Feed("")
    @Feed("test")
    @Feed([])
    public async notHandleInvalidMsgs(input: any): Promise<void> {
        Assert.false(await testBot.handle.message(input));
    }

    @Test("should have correct internal commands")
    public haveCorrectInternalCmds(): void {
        Assert.that(testBot.internalCommands,
            Is.array,
            Does.haveLength(3)
        );

        Assert.equal(testBot.internalCommands[0], "help");
        Assert.equal(testBot.internalCommands[1], "usage");
        Assert.equal(testBot.internalCommands[2], "ping");
    }
}
