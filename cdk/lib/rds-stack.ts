import { Stack, StackProps, Duration, RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';

interface RdsStackProps extends StackProps {
  vpc: ec2.IVpc;
}

export class RdsStack extends Stack {
  public readonly cluster: rds.DatabaseCluster;
  
  constructor(scope: Construct, id: string, props: RdsStackProps) {
    super(scope, id, props);

    // RDS Aurora MySQL クラスターの作成
    this.cluster = new rds.DatabaseCluster(this, 'AuroraCluster', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_16_2,
      }),
      credentials: rds.Credentials.fromGeneratedSecret('postgres'),
      defaultDatabaseName: 'defaultdb',
      instances: 1,
      instanceProps: {
        vpc: props.vpc,
        vpcSubnets: {
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          // subnets: props.vpc.privateSubnets
        },
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MEDIUM),
      },
      removalPolicy: RemovalPolicy.DESTROY,
    });
    
    this.cluster.addRotationSingleUser({
      automaticallyAfter: Duration.days(1),
    });

    new CfnOutput(this, `RdsClusterIdentifer`, {
      exportName: `RdsClusterIdentifer`,
      value: this.cluster.clusterIdentifier,
    });
    
    new CfnOutput(this, `RdsSg`, {
      exportName: `RdsSg`,
      value: this.cluster.connections.securityGroups[0].securityGroupId,
    });
    
    new CfnOutput(this, `RdsMasterUserSecret`, {
      exportName: `RdsMasterUserSecret`,
      value: this.cluster.secret?.secretArn!,
    })
  }
}