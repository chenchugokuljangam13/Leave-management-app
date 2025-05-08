import { SFNClient, StartExecutionCommand, SendTaskSuccessCommand } from "@aws-sdk/client-sfn";
const stepFunction = new SFNClient({});

type Input1 = Record<string, string>
type Input2 = Record<string, string|Input1>

export async function sfsStartExecutionFun(
    stateMachineArn: string,
    input: Input2
) {
    await stepFunction.send(new StartExecutionCommand({
        stateMachineArn,
        input: JSON.stringify(input)
    }));
}

export async function sfsSendSuccessfulMsgFun(taskToken: string, status:string){
    await stepFunction.send(new SendTaskSuccessCommand({
        taskToken,
        output: JSON.stringify({ approvalStatus: status })
    }));
}