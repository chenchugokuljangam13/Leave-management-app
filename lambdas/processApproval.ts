import { SFNClient, SendTaskSuccessCommand } from "@aws-sdk/client-sfn";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const sfn = new SFNClient({region:'us-east-1'});

export const processApprovalHandler = async (event:APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log(event);
  const status = event.queryStringParameters?.status;
  const taskToken = event.queryStringParameters?.taskToken;
  if (!status || !taskToken) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Missing required query parameters: 'status' and 'taskToken'",
      }),
    };
  }
  try {
    // resume the step function by using task token
    await sfn.send(new SendTaskSuccessCommand({
    taskToken,
    output: JSON.stringify({ approvalStatus: status })
    }));
    return {
      statusCode: 200,
      body: `you have ${status} the leave request`
    }
  } catch(error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to send task status to Step Functions"
      }),
    }
  }
}
