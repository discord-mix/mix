import {Command} from "../..";
import {Name, Description} from "../../decorators/utility";

@Name("test-decorator-command")
@Description("A command for testing decorators")
export default class TestDecoratorCommand extends Command {
    public run(): void {
        //
    }
}
