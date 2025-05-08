import {mockClient} from 'aws-sdk-client-mock';
import {sendApprovalEmailHandler} from '../../lambdas/sendApprovalEmail'
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
const sesMock = mockClient(SESClient);
interface Event {
    approvalStatus?: string,
    leaveDetails?: Record<string, string>,
    leaveID?: string,
    userEmail?: string,
    approverEmail?: string,
    taskToken?: string,
    apiBaseUrl?: string
  }
const event: Event = {}
describe('unit test for app handler', function() {
    beforeEach(() => {
        sesMock.reset();
    })
    test('fail case for missing params', async() => {
        const result = await sendApprovalEmailHandler(event);
        expect(result.statusCode).toBe(400);
        expect(JSON.parse(result.body).message).toEqual('Missing parameters in the Event')
    })
    test('It will send email successfully', async() => {
        const event1 = {
            approvalStatus: "pending",
            leaveDetails: {
                leaveType:'casual',
                startDate:'10-10-10',
                endDate:'11-11-11',
                reason:'vacation'
            },
            leaveID: "leave-fgtyhj",
            userEmail: "abc@example.com",
            approverEmail: "abc@example.com",
            taskToken: "y",
            apiBaseUrl: "www.world.com"
        }
        sesMock.on(SendEmailCommand).resolves({})
        const result = await sendApprovalEmailHandler(event1);
        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body).message).toEqual("Message sent to Approver");
    })
    test('It will fail because of internal server error', async() => {
        const event1 = {
            approvalStatus: "pending",
            leaveDetails: {
                leaveType:'casual',
                startDate:'10-10-10',
                endDate:'11-11-11',
                reason:'vacation'
            },
            leaveID: "leave-fgtyhj",
            userEmail: "abc@example.com",
            approverEmail: "abc@example.com",
            taskToken: "y",
            apiBaseUrl: "www.world.com"
        }
        sesMock.on(SendEmailCommand).rejects(new Error('some error while sending email'))
        const result = await sendApprovalEmailHandler(event1);
        expect(result.statusCode).toBe(500);
        expect(JSON.parse(result.body).message).toEqual("Failed to send email");
    })
})