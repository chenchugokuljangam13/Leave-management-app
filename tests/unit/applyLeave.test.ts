import {applyLeaveHandler} from '../../lambdas/applyLeave';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { SFNClient, StartExecutionCommand } from "@aws-sdk/client-sfn";
import {mockClient} from 'aws-sdk-client-mock'
process.env.TABLE_NAME = 'myTable';
const ddbMock = mockClient(DynamoDBDocumentClient);
const sfsMock = mockClient(SFNClient);
const event:APIGatewayProxyEvent = 
        {
            body: '',
            headers: {},
            multiValueHeaders: {},
            httpMethod: '',
            isBase64Encoded: false,
            path: '',
            pathParameters: null,
            queryStringParameters: null,
            multiValueQueryStringParameters: null,
            stageVariables: null,
            requestContext: {
                accountId: '',
                apiId: '',
                authorizer: undefined,
                protocol: '',
                httpMethod: '',
                identity: {
                    accessKey: null,
                    accountId: null,
                    apiKey: null,
                    apiKeyId: null,
                    caller: null,
                    clientCert: null,
                    cognitoAuthenticationProvider: null,
                    cognitoAuthenticationType: null,
                    cognitoIdentityId: null,
                    cognitoIdentityPoolId: null,
                    principalOrgId: null,
                    sourceIp: '',
                    user: null,
                    userAgent: null,
                    userArn: null
                },
                path: '',
                stage: '',
                requestId: '',
                requestTimeEpoch: 0,
                resourceId: '',
                resourcePath: ''
            },
            resource: ''
        };
describe('unit test for app handler', function() {
    beforeEach(() => {
        ddbMock.reset();
        sfsMock.reset();
        process.env.TABLE_NAME = 'myTable';
        process.env.STATE_MACHINE_ARN = "arn:aws:states:us-east-1:123456789012:stateMachine:myStateMachine"
    })
    test('should return 400 if required fields are missing', async() => {
        const result: APIGatewayProxyResult = await applyLeaveHandler(event);
        expect(result.statusCode).toBe(400);
        expect(result.body).toEqual(
            JSON.stringify({
                message: "Missing required fields"
            })
        )
    })
    test('should apply leave and return 200 with valid input', async() => {
        event.body = JSON.stringify({
            leaveType: "abc",
            startDate: "20-05-25",
            endDate: "20-05-25",
            approverEmail: "def@example.com",
            employeeEmail: 'abc@example.com'
        });
        ddbMock.on(PutCommand).resolves({});
        sfsMock.on(StartExecutionCommand).resolves({});
        const result: APIGatewayProxyResult = await applyLeaveHandler(event);
        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body).message).toMatch(/^Leave applied LEAVE-[A-Za-z0-9]{8}$/)
    })
    test('should return 500 if DynamoDB throws an error', async () => {
        event.body = JSON.stringify({
          leaveType: "abc",
          startDate: "20-05-25",
          endDate: "20-05-25",
          approverEmail: "def@example.com",
          employeeEmail: "abc@example.com"
        });
          
        // Simulate failure in DynamoDB PutCommand
        ddbMock.on(PutCommand).rejects(new Error("DynamoDB Error"));
      
        const result: APIGatewayProxyResult = await applyLeaveHandler(event);
      
        expect(result.statusCode).toBe(500);
        expect(JSON.parse(result.body).message).toBe("Internal server error");
      });
})



