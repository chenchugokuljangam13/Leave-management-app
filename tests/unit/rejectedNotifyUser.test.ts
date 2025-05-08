import {DynamoDBDocumentClient, UpdateCommand} from "@aws-sdk/lib-dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import {mockClient} from 'aws-sdk-client-mock';
import {notifyUserHandler} from '../../lambdas/rejectedNotifyUser'
process.env.TABLE_NAME = 'myTable';
const ddbMock = mockClient(DynamoDBDocumentClient);
const sesMock = mockClient(SESClient);
interface Event {
    approvalStatus?: string,
    leaveDetails?: Record<string, string>,
    leaveID?: string,
    userEmail?: string
}
const event: Event = {}

describe('unit test for the notify approver', function() {
    beforeEach(() => {
        ddbMock.reset();
        sesMock.reset();
    })
    test('if parameters not given', async() => {
        const result = await notifyUserHandler(event);
        expect(result.statusCode).toBe(400);
        expect(JSON.parse(result.body).message).toEqual("Missing required input fields")
    })
    test('If fails to update the data in DynamoDB', async() => {
        const event1 = {
            approvalStatus: "string",
            leaveDetails: {},
            leaveID: "string",
            userEmail: "string"
        }
        ddbMock.on(UpdateCommand).rejects(new Error('Error while Updating table'));
        const result = await notifyUserHandler(event1);
        expect(result.statusCode).toBe(500);
        expect(JSON.parse(result.body).message).toEqual("Data unable to send to DynamoDB");
    })
    test('If fails to send email', async() => {
        const event1 = {
            approvalStatus: "string",
            leaveDetails: {},
            leaveID: "string",
            userEmail: "string"
        }
        ddbMock.on(UpdateCommand).resolves({})
        sesMock.on(SendEmailCommand).rejects(new Error('Error while sending email'));
        const result = await notifyUserHandler(event1);
        expect(result.statusCode).toBe(500);
        expect(JSON.parse(result.body).message).toEqual("Failed to send mail to user");
    })
    test('Passes every test case', async() => {
        const event1 = {
            approvalStatus: "string",
            leaveDetails: {},
            leaveID: "string",
            userEmail: "string"
        }
        ddbMock.on(UpdateCommand).resolves({})
        sesMock.on(SendEmailCommand).resolves({});
        const result = await notifyUserHandler(event1);
        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body).message).toEqual("user notified successfully");
    })
})


