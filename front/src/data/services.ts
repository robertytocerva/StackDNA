export type HttpMethod = 'GET' | 'POST';

export interface AWSService {
	id: string;
	name: string;
	method: HttpMethod;
	endpoint: string;
	description: string;
	action: string;
	docsUrl: string;
	payloadExample: Record<string, string>;
}

const credentials = (service: string): Record<string, string> => ({
	service,
	accessKeyId: 'PON_AQUI_TU_ACCESS_KEY_ID',
	secretAccessKey: 'PON_AQUI_TU_SECRET_ACCESS_KEY',
	region: 'us-east-2',
});

export const AWS_SERVICES: AWSService[] = [
	{
		id: 'sts',
		name: 'AWS STS',
		method: 'POST',
		endpoint: 'https://sts.amazonaws.com/',
		description: 'Security Token Service — verifica y obtiene la identidad de las credenciales.',
		action: 'GetCallerIdentity',
		docsUrl: 'https://docs.aws.amazon.com/STS/latest/APIReference/',
		payloadExample: credentials('sts'),
	},
	{
		id: 'eventbridge',
		name: 'Amazon EventBridge',
		method: 'POST',
		endpoint: 'https://events.{region}.amazonaws.com/',
		description: 'Lista los event buses disponibles en tu cuenta.',
		action: 'ListEventBuses',
		docsUrl: 'https://docs.aws.amazon.com/eventbridge/latest/APIReference/',
		payloadExample: credentials('eventbridge'),
	},
	{
		id: 'cloudformation',
		name: 'AWS CloudFormation',
		method: 'POST',
		endpoint: 'https://cloudformation.{region}.amazonaws.com/',
		description: 'Lista los stacks de infraestructura desplegados.',
		action: 'ListStacks',
		docsUrl: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/APIReference/',
		payloadExample: credentials('cloudformation'),
	},
	{
		id: 'ssm',
		name: 'AWS Systems Manager',
		method: 'POST',
		endpoint: 'https://ssm.{region}.amazonaws.com/',
		description: 'Lista los parámetros del Parameter Store.',
		action: 'DescribeParameters',
		docsUrl: 'https://docs.aws.amazon.com/systems-manager/latest/APIReference/',
		payloadExample: credentials('ssm'),
	},
	{
		id: 'kms',
		name: 'AWS KMS',
		method: 'POST',
		endpoint: 'https://kms.{region}.amazonaws.com/',
		description: 'Lista las claves de cifrado administradas.',
		action: 'ListKeys',
		docsUrl: 'https://docs.aws.amazon.com/kms/latest/APIReference/',
		payloadExample: credentials('kms'),
	},
	{
		id: 'stepfunctions',
		name: 'AWS Step Functions',
		method: 'POST',
		endpoint: 'https://states.{region}.amazonaws.com/',
		description: 'Lista las máquinas de estado disponibles.',
		action: 'ListStateMachines',
		docsUrl: 'https://docs.aws.amazon.com/step-functions/latest/apireference/',
		payloadExample: credentials('stepfunctions'),
	},
	{
		id: 'ecr',
		name: 'Amazon ECR',
		method: 'POST',
		endpoint: 'https://ecr.{region}.amazonaws.com/',
		description: 'Lista los repositorios de imágenes Docker.',
		action: 'DescribeRepositories',
		docsUrl: 'https://docs.aws.amazon.com/AmazonECR/latest/APIReference/',
		payloadExample: credentials('ecr'),
	},
	{
		id: 'appconfig',
		name: 'AWS AppConfig',
		method: 'GET',
		endpoint: 'https://appconfig.{region}.amazonaws.com/',
		description: 'Lista las aplicaciones de configuración.',
		action: 'ListApplications',
		docsUrl: 'https://docs.aws.amazon.com/appconfig/latest/APIReference/',
		payloadExample: credentials('appconfig'),
	},
	{
		id: 'xray',
		name: 'AWS X-Ray',
		method: 'POST',
		endpoint: 'https://xray.{region}.amazonaws.com/',
		description: 'Obtiene los grupos de trazas de la aplicación.',
		action: 'GetGroups',
		docsUrl: 'https://docs.aws.amazon.com/xray/latest/api/',
		payloadExample: credentials('xray'),
	},
	{
		id: 'cognito',
		name: 'Amazon Cognito',
		method: 'POST',
		endpoint: 'https://cognito-idp.{region}.amazonaws.com/',
		description: 'Lista los User Pools de autenticación.',
		action: 'ListUserPools',
		docsUrl: 'https://docs.aws.amazon.com/cognito/latest/developerguide/',
		payloadExample: credentials('cognito'),
	},
];

// Alias de compatibilidad para cualquier integración previa del tester.
export const initialServices = AWS_SERVICES;
