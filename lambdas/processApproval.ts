import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {sfsSendSuccessfulMsgFun} from './utils/sfsHelper'

export const processApprovalHandler = async (event:APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const status = event.queryStringParameters?.status;
  const taskToken = event.queryStringParameters?.taskToken;
  if (!status || !taskToken) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Missing required query parameters: status and taskToken",
      }),
    };
  }
  try {
    // resume the step function by using task token
    await sfsSendSuccessfulMsgFun(taskToken, status)
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
