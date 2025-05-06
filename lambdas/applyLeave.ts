import { DynamoDBClient} from "@aws-sdk/client-dynamodb";
import { SFNClient, StartExecutionCommand } from "@aws-sdk/client-sfn";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {DynamoDBDocumentClient, PutCommand} from "@aws-sdk/lib-dynamodb";

const dynamo = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamo);
const stepFunctions = new SFNClient({});
const TABLE_NAME = process.env.TABLE_NAME!;
const STATE_MACHINE_ARN = process.env.STATE_MACHINE_ARN!;

// Generates unique id
const getShortCode= (): string => {
  let chars = "";
  for (let i = 65; i <= 90; i++) chars += String.fromCharCode(i); 
  for (let i = 97; i <= 122; i++) chars += String.fromCharCode(i); 
  for (let i = 48; i <= 57; i++) chars += String.fromCharCode(i); 

  let res = "";
  for (let i = 0; i <= 7; i++) {
      const randomInd = Math.floor(Math.random() * chars.length);
      res += chars.charAt(randomInd);
  }
  console.log("res")
  return res;
}

export const applyLeaveHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!TABLE_NAME) {
      throw new Error("Missing required environment variables");
    }
    const body = JSON.parse(event.body || "{}");
    if (!body.leaveType || !body.startDate || !body.endDate || !body.approverEmail) {
      return { statusCode: 400, body: JSON.stringify({ message: "Missing required fields" }) };
    }
    // generates unique id
    const leaveID = `LEAVE-${getShortCode()}`;
    // it will we used in further states to send in emails and trigger endpoint
    const apiBaseUrl = `https://${event.requestContext.domainName}/${event.requestContext.stage}`;
    // add the leave details item in Dynamo Db
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        leaveID: leaveID,
        userEmail: body.employeeEmail,
        approverEmail: body.approverEmail,
        leaveType: body.leaveType,
        startDate: body.startDate,
        endDate: body.endDate,
        reason: body.reason || "Not provided" ,
        status: "PENDING"
      }
    }));
    // It will invoke the step function to start execute
    await stepFunctions.send(new StartExecutionCommand({
      stateMachineArn: STATE_MACHINE_ARN,
      input: JSON.stringify({
        leaveID: leaveID,
        userEmail: body.employeeEmail,
        approverEmail: body.approverEmail,
        leaveDetails: {
          leaveType: body.leaveType,
          startDate: body.startDate,
          endDate: body.endDate,
          reason: body.reason || "Not provided"
        },
        apiBaseUrl: apiBaseUrl,
      })
    }));
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: "Leave applied", leaveID
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error"
      })
    };
  }
};
