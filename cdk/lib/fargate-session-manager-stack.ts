import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as cdk from 'aws-cdk-lib';
import * as rds from 'aws-cdk-lib/aws-rds';


interface FargateSessionManagerStackProps extends cdk.StackProps {
  vpc: ec2.IVpc,
}

export class FargateSessionManagerStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: FargateSessionManagerStackProps) {
    super(scope, id, props);

    const vpc = props.vpc;

    const cluster = new ecs.Cluster(this, 'FargateCluster', {
      vpc,
    });

    const taskRole = new iam.Role(this, 'FargateTaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
      ],
    });

    const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
      taskRole,
    });

    taskDefinition.addContainer('SSMContainer', {
      image: ecs.ContainerImage.fromRegistry('amazonlinux'),
      essential: true,
      pseudoTerminal: true,
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: 'fargate-session' }),
      linuxParameters: new ecs.LinuxParameters(this, "LinuxParameters", {
        initProcessEnabled: true,
      }),
    });

    const fargate = new ecs.FargateService(this, 'FargateService', {
      cluster,
      enableExecuteCommand: true,
      taskDefinition,
      desiredCount: 1,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED, // プライベートサブネットを指定
      },
      securityGroups: [
        new ec2.SecurityGroup(this, 'FargateSG', {
          vpc,
          allowAllOutbound: true,
        }),
      ],
    });
    
    const rdsSg = ec2.SecurityGroup.fromSecurityGroupId(this, `RdsSg`, cdk.Fn.importValue(`RdsSg`))
    rdsSg.addIngressRule(
      fargate.connections.securityGroups[0],
      ec2.Port.tcp(5432),
      'Allow Fargate access to RDS'
    );
  }
}
