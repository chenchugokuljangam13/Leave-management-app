import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {ddbPutCommandHelper} from './utils/ddbHelpers'
import {idGeneratorFun} from './utils/idGenerator'
import {sfsStartExecutionFun} from './utils/sfsHelper'
const TABLE_NAME = process.env.TABLE_NAME!;
const STATE_MACHINE_ARN = process.env.STATE_MACHINE_ARN!;

export const applyLeaveHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || "{}");
    const userEmail = body.employeeEmail;
    const approverEmail = body.approverEmail;
    const leaveType = body.leaveType;
    const startDate = body.startDate;
    const endDate = body.endDate;
    const reason = body.reason || "Not provided";


    if (!leaveType || !startDate || !endDate || !approverEmail || !userEmail) {
      return { statusCode: 400, body: JSON.stringify({ message: "Missing required fields" }) };
    }

    // generates unique id
    const leaveID = `LEAVE-${idGeneratorFun()}`;

    // it will we used in further states to send in emails and trigger endpoint
    const apiBaseUrl = `https://${event.requestContext.domainName}/${event.requestContext.stage}`;
    const item = {
      leaveID,
      userEmail,
      approverEmail,
      leaveType,
      startDate,
      endDate,
      reason,
      status: "Pending"
  }
    // add the leave details item in Dynamo Db
    await ddbPutCommandHelper(
      TABLE_NAME,
      item);
    // It will invoke the step function to start execute
    const inputForSFS = {
      leaveID,
      userEmail,
      approverEmail,
      leaveDetails: {leaveType,
        startDate,
        endDate,
        reason
      },
      apiBaseUrl
    }
    await sfsStartExecutionFun(STATE_MACHINE_ARN,inputForSFS)
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: `Leave applied ${leaveID}`
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
