import { StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import {CompositePrincipal, Effect, PolicyStatement, Role} from "aws-cdk-lib/aws-iam";
import * as iam from 'aws-cdk-lib/aws-iam';
import {Options} from "../types/options";
import * as logs from "aws-cdk-lib/aws-logs";
import {RetentionDays} from "aws-cdk-lib/aws-logs";
import {Table} from "aws-cdk-lib/aws-dynamodb";
import {ITopic, Topic} from "aws-cdk-lib/aws-sns";


interface SFTPBaseRoleStackProps extends StackProps {
    options: Options,
    table: Table,
    bucketArn:string
}

export class SFTPBaseRole extends cdk.NestedStack  {
    private readonly _role: Role;

    constructor(scope: Construct, id: string, props: SFTPBaseRoleStackProps) {
        super(scope, id, props);

      
        // Add scheduler assumeRole
        this._role  = new Role(this,  "SFTPBaseRole", {
            assumedBy: new CompositePrincipal(
                new iam.ServicePrincipal('transfer.amazonaws.com')
            ),
            roleName: "sftpbase-role"
        })

        // Add Cloudwatch Policy
        this._role.addToPolicy(  new PolicyStatement( {
            sid: 'WriteCloudWatchLogs',
            effect: Effect.ALLOW,
            actions: [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents",
                "logs:CreateLogDelivery",
                "logs:GetLogDelivery",
                "logs:UpdateLogDelivery",
                "logs:DeleteLogDelivery",
                "logs:ListLogDeliveries",
                "logs:PutResourcePolicy",
                "logs:DescribeResourcePolicies",
                "logs:DescribeLogGroups",
            ],
            resources: ["*"], //Give the least privileges
        }))

        // Add S3 Policy
        this._role.addToPolicy(  new PolicyStatement( {
            sid: 'S3Policy',
            effect: Effect.ALLOW,
            actions: [
                "s3:Get*",
                "s3:Put*",
                "s3:List*",
                "s3:Delete*",
            ],
            resources: [
                props.bucketArn,
                `${props.bucketArn}/*`
            ]
        }))

    }

    get roleArn(): string {
        return this._role.roleArn;
    }
    get role(): Role {
        return this._role
    }
}
