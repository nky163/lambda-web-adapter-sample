// lib/rds-stack.ts
import { Stack, StackProps, Duration, RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class VpcStack extends Stack {
  public readonly vpc: ec2.IVpc;
  
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    this.vpc = ec2.Vpc.fromLookup(this, 'Vpc', {
      isDefault: false,
      vpcId: 'vpc-08e4100566782081f'
    })
  }
}