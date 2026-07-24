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

export function getDefaultRequestJson(
	service: Pick<ServiceDefinition, 'id' | 'method' | 'url'>,
): string {

	// Plantillas personalizadas para servicios AWS

if (service.id === 's1') {
	return JSON.stringify({
		service: 'apigateway',
		accessKeyId: 'PON_AQUI_TU_ACCESS_KEY_ID',
		secretAccessKey: 'PON_AQUI_TU_SECRET_ACCESS_KEY',
		region: 'PON_AQUI_LA_REGION_DE_AWS'
	}, null, 4);
}

if (service.id === 's2') {
	return JSON.stringify({
		service: 'lambda',
		accessKeyId: 'PON_AQUI_TU_ACCESS_KEY_ID',
		secretAccessKey: 'PON_AQUI_TU_SECRET_ACCESS_KEY',
		region: 'PON_AQUI_LA_REGION_DE_AWS',
		functionName: 'PON_AQUI_EL_NOMBRE_DE_LA_FUNCION',
		payload: {}
	}, null, 4);
}

if (service.id === 's3') {
	return JSON.stringify({
		service: 'dynamodb',
		accessKeyId: 'PON_AQUI_TU_ACCESS_KEY_ID',
		secretAccessKey: 'PON_AQUI_TU_SECRET_ACCESS_KEY',
		region: 'PON_AQUI_LA_REGION_DE_AWS',
		tableName: 'PON_AQUI_EL_NOMBRE_DE_LA_TABLA'
	}, null, 4);
}

if (service.id === 's4') {
	return JSON.stringify({
		service: 's3',
		accessKeyId: 'PON_AQUI_TU_ACCESS_KEY_ID',
		secretAccessKey: 'PON_AQUI_TU_SECRET_ACCESS_KEY',
		region: 'PON_AQUI_LA_REGION_DE_AWS'
	}, null, 4);
}

if (service.id === 's5') {
	return JSON.stringify({
		service: 'sqs',
		accessKeyId: 'PON_AQUI_TU_ACCESS_KEY_ID',
		secretAccessKey: 'PON_AQUI_TU_SECRET_ACCESS_KEY',
		region: 'PON_AQUI_LA_REGION_DE_AWS',
		queueUrl: 'PON_AQUI_LA_URL_DE_LA_COLA',
		messageBody: 'Mensaje de prueba desde StackDNA'
	}, null, 4);
}

if (service.id === 's6') {
	return JSON.stringify({
		service: 'sns',
		accessKeyId: 'PON_AQUI_TU_ACCESS_KEY_ID',
		secretAccessKey: 'PON_AQUI_TU_SECRET_ACCESS_KEY',
		region: 'PON_AQUI_LA_REGION_DE_AWS',
		topicArn: 'PON_AQUI_EL_TOPIC_ARN',
		message: 'Mensaje de prueba desde StackDNA'
	}, null, 4);
}

if (service.id === 's7') {
	return JSON.stringify({
		service: 'cognito',
		accessKeyId: 'PON_AQUI_TU_ACCESS_KEY_ID',
		secretAccessKey: 'PON_AQUI_TU_SECRET_ACCESS_KEY',
		region: 'PON_AQUI_LA_REGION_DE_AWS',
		userPoolId: 'PON_AQUI_EL_USER_POOL_ID'
	}, null, 4);
}

if (service.id === 's9') {
	return JSON.stringify({
		service: 'eventbridge',
		accessKeyId: 'PON_AQUI_TU_ACCESS_KEY_ID',
		secretAccessKey: 'PON_AQUI_TU_SECRET_ACCESS_KEY',
		region: 'PON_AQUI_LA_REGION_DE_AWS',
		eventBusName: 'default',
		source: 'stackdna.test',
		detailType: 'StackDNATestEvent',
		detail: {}
	}, null, 4);
}

if (service.id === 's10') {
	return JSON.stringify({
		service: 'stepfunctions',
		accessKeyId: 'PON_AQUI_TU_ACCESS_KEY_ID',
		secretAccessKey: 'PON_AQUI_TU_SECRET_ACCESS_KEY',
		region: 'PON_AQUI_LA_REGION_DE_AWS',
		stateMachineArn: 'PON_AQUI_EL_STATE_MACHINE_ARN',
		input: {}
	}, null, 4);
}

if (service.id === 's18') {
	return JSON.stringify({
		service: 'secretsmanager',
		accessKeyId: 'PON_AQUI_TU_ACCESS_KEY_ID',
		secretAccessKey: 'PON_AQUI_TU_SECRET_ACCESS_KEY',
		region: 'PON_AQUI_LA_REGION_DE_AWS',
		secretId: 'PON_AQUI_EL_SECRET_ID'
	}, null, 4);
}

	// Plantilla genérica para servicios aún no implementados

	const request = {
		method: service.method,
		url: service.url,
		headers: {
			Authorization: 'Bearer <tu-token>',
			'x-api-key': '<tu-api-key>',
			'Content-Type': 'application/json',
		},
		...(service.method !== 'GET'
			? { body: { data: 'tu_payload_aqui' } }
			: {}),
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
