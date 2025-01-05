// lib/rds-stack.ts
import { Stack, StackProps, Duration, RemovalPolicy, CfnOutput, Fn } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as path from 'path';

interface RdsCredentialStackProps extends StackProps {
  vpc: ec2.IVpc;
  stage: string;
  // cluster: rds.DatabaseCluster;
}

const hyphenToUnderscore = (str: string) => str.replaceAll('-', '_');

export class RdsCredentialStack extends Stack {
  
  constructor(scope: Construct, id: string, props: RdsCredentialStackProps) {
    super(scope, id, props);
    
    const rdsSg = ec2.SecurityGroup.fromSecurityGroupId(this, `RdsSg`, Fn.importValue(`RdsSg`))
    const cluster = rds.DatabaseCluster.fromDatabaseClusterAttributes(this,'RdsCluster', {
      clusterIdentifier: Fn.importValue('RdsClusterIdentifer'),
      port: 5432,
      securityGroups: [rdsSg]
    })
    
    const appUsername = `appuser_${hyphenToUnderscore(props.stage)}`;
    const appDatabase = `appdb_${hyphenToUnderscore(props.stage)}`;

    const rdsMaterUserSecret = secretsmanager.Secret.fromSecretCompleteArn(this, `RdsMaterUserSecret`, Fn.importValue('RdsMasterUserSecret'));
    const rdsAppUserSecret = new rds.DatabaseSecret(this, 'DBSecret', {
      username: appUsername,
      dbname: appDatabase,
      secretName: `RdsSecrets-${props.stage}`,
      masterSecret: rdsMaterUserSecret,
    });
    const attachedSecret = rdsAppUserSecret.attach(cluster);
    
    new secretsmanager.SecretRotation(this, 'SecretRotation', {
      application: secretsmanager.SecretRotationApplication.POSTGRES_ROTATION_MULTI_USER,
      secret: rdsAppUserSecret,
      masterSecret: rdsMaterUserSecret,
      target: cluster,
      vpc: props.vpc,
      automaticallyAfter: Duration.days(1),
      rotateImmediatelyOnUpdate: false,
    })

    const dbInitFunction = new NodejsFunction(this, 'DbInitFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      timeout: Duration.minutes(15),
      entry: path.join(__dirname, '../../backend', 'lambda/init-db', 'index.ts'),
      handler: 'handler',
      bundling: {
        minify: true,
        sourceMap: true,
        target: 'node20',
        externalModules: ['aws-sdk'], // Lambda ランタイムに含まれるものは基本的に除外
      },
      environment: {
        MASTER_USER_SECRET_ARN: rdsMaterUserSecret.secretArn,
        APP_USER_SECRET_ARN: rdsAppUserSecret.secretArn,
        APP_DDATABASE: appDatabase
      },
      vpc: props.vpc,
    });
    
    rdsMaterUserSecret.grantRead(dbInitFunction);
    rdsAppUserSecret.grantRead(dbInitFunction);
    
    
    rdsSg.addIngressRule(
      dbInitFunction.connections.securityGroups[0],
      ec2.Port.tcp(5432),
      'Allow Init DB Lambda access to RDS'
    );
  }
}