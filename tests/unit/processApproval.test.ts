import { SFNClient, SendTaskSuccessCommand } from "@aws-sdk/client-sfn";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { processApprovalHandler } from '../../lambdas/processApproval'
import {mockClient} from 'aws-sdk-client-mock';
const sfsMock = mockClient(SFNClient);
const event: APIGatewayProxyEvent = {
    queryStringParameters: {},
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: "",
    isBase64Encoded: false,
    path: "",
    pathParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {
        accountId: "",
        apiId: "",
        authorizer: undefined,
        protocol: "",
        httpMethod: "",
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
            sourceIp: "",
            user: null,
            userAgent: null,
            userArn: null
        },
        path: "",
        stage: "",
        requestId: "",
        requestTimeEpoch: 0,
        resourceId: "",
        resourcePath: ""
    },
    resource: ""
}


describe('unit test for app handler', function() {
    beforeEach(() => {
        sfsMock.reset();
    })
    test('test for missing required query parameters', async()=> {
        const result: APIGatewayProxyResult = await processApprovalHandler(event);
        expect(result.statusCode).toBe(400);
        expect(JSON.parse(result.body).message).toEqual(
            'Missing required query parameters: status and taskToken'
        )
    })
    test('when sfs sends the data when its Approved', async() => {
        event.queryStringParameters = {
            status : 'Approved',
            taskToken: 'y'
        }
        sfsMock.on(SendTaskSuccessCommand).resolves({})
        const result: APIGatewayProxyResult = await processApprovalHandler(event);
        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual(`you have ${event.queryStringParameters.status} the leave request`)
    })
    test('when sfs sends the data when its Approved', async() => {
        event.queryStringParameters = {
            status : 'Rejected',
            taskToken: 'y'
        }
        sfsMock.on(SendTaskSuccessCommand).resolves({})
        const result: APIGatewayProxyResult = await processApprovalHandler(event);
        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual(`you have ${event.queryStringParameters.status} the leave request`)
    })
    test('when sfs sends the data when its Approved', async() => {
        event.queryStringParameters = {
            status : 'Rejected',
            taskToken: 'y'
        }
        sfsMock.on(SendTaskSuccessCommand).rejects(new Error('some error while sending task token'))
        const result: APIGatewayProxyResult = await processApprovalHandler(event);
        expect(result.statusCode).toBe(500);
        expect(JSON.parse(result.body).message).toEqual("Failed to send task status to Step Functions")
    })
})