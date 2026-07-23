export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type ResponseType = 'success' | 'error' | null;

export interface ServiceDefinition {
	id: string;
	name: string;
	method: HttpMethod;
	url: string;
}

export interface ApiServiceState extends ServiceDefinition {
	editorContent: string;
	response: string | null;
	responseType: ResponseType;
	isLoading: boolean;
}

export const initialServices: ServiceDefinition[] = [
	{ id: 's1', name: 'API Gateway', method: 'GET', url: 'https://api.amazonaws.com/dev' },
	{ id: 's2', name: 'Lambda Invoke', method: 'POST', url: 'https://lambda.amazonaws.com/2015-03-31/functions' },
	{ id: 's3', name: 'DynamoDB Scan', method: 'POST', url: 'https://dynamodb.amazonaws.com/' },
	{ id: 's4', name: 'S3 GetObject', method: 'GET', url: 'https://bucket.s3.amazonaws.com/' },
	{ id: 's5', name: 'SQS SendMessage', method: 'POST', url: 'https://sqs.amazonaws.com/' },
	{ id: 's6', name: 'SNS Publish', method: 'POST', url: 'https://sns.amazonaws.com/' },
	{ id: 's7', name: 'Cognito Auth', method: 'POST', url: 'https://cognito-idp.amazonaws.com/' },
	{ id: 's8', name: 'Kinesis PutRecord', method: 'PUT', url: 'https://kinesis.amazonaws.com/' },
	{ id: 's9', name: 'EventBridge', method: 'POST', url: 'https://events.amazonaws.com/' },
	{ id: 's10', name: 'Step Functions', method: 'POST', url: 'https://states.amazonaws.com/' },
	{ id: 's11', name: 'ECS Task', method: 'POST', url: 'https://ecs.amazonaws.com/' },
	{ id: 's12', name: 'EKS Cluster', method: 'GET', url: 'https://eks.amazonaws.com/' },
	{ id: 's13', name: 'RDS Data', method: 'POST', url: 'https://rds-data.amazonaws.com/' },
	{ id: 's14', name: 'Athena Query', method: 'POST', url: 'https://athena.amazonaws.com/' },
	{ id: 's15', name: 'Glue Job', method: 'POST', url: 'https://glue.amazonaws.com/' },
	{ id: 's16', name: 'CloudWatch Logs', method: 'GET', url: 'https://logs.amazonaws.com/' },
	{ id: 's17', name: 'SSM Parameter', method: 'GET', url: 'https://ssm.amazonaws.com/' },
	{ id: 's18', name: 'Secrets Manager', method: 'GET', url: 'https://secretsmanager.amazonaws.com/' },
	{ id: 's19', name: 'KMS Decrypt', method: 'POST', url: 'https://kms.amazonaws.com/' },
	{ id: 's20', name: 'IAM Policy', method: 'DELETE', url: 'https://iam.amazonaws.com/' },
];

export function getDefaultRequestJson(service: Pick<ServiceDefinition, 'method' | 'url'>): string {
	const request = {
		method: service.method,
		url: service.url,
		headers: {
			Authorization: 'Bearer <tu-token>',
			'x-api-key': '<tu-api-key>',
			'Content-Type': 'application/json',
		},
		...(service.method !== 'GET' ? { body: { data: 'tu_payload_aqui' } } : {}),
	};

	return JSON.stringify(request, null, 2);
}

export function createServiceState(service: ServiceDefinition): ApiServiceState {
	return {
		...service,
		editorContent: getDefaultRequestJson(service),
		response: null,
		responseType: null,
		isLoading: false,
	};
}
