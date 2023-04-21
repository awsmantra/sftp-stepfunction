import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import { Role } from "aws-cdk-lib/aws-iam";
import {CfnSchedule} from "aws-cdk-lib/aws-scheduler";
import {Options} from "../types/options";

interface EventBridgeSchedulerProps extends cdk.NestedStackProps {
    options: Options;
    schedulerRoleArn: string
    createSFTPStateMachineArn: string,
    deleteSFTPStateMachineArn: string,
}

export class EventBridgeSchedule extends cdk.NestedStack {
    private readonly role: Role;

    constructor(scope: Construct, id: string, props: EventBridgeSchedulerProps) {
        super(scope, id, props);

        // Create SFTP Server 8 am Central Time
        new CfnSchedule(this,"create-sftp-scheduler", {
            name: "create-sftp-scheduler",
            flexibleTimeWindow: {
                mode: "OFF"
            },
            scheduleExpression: "cron(0 8 ? * * *)",
            scheduleExpressionTimezone: 'America/Chicago',
            description: 'Event that create SFTP StepFunction',
            target: {
                arn: props.createSFTPStateMachineArn,
                roleArn: props.schedulerRoleArn
            },
        });

        // Delete SFTP Server 8 PM Central Time
        new CfnSchedule(this,"delete-sftp-scheduler", {
            name: "delete-sftp-scheduler",
            flexibleTimeWindow: {
                mode: "OFF"
            },
            scheduleExpression: "cron(0 20 ? * * *)",
            scheduleExpressionTimezone: 'America/Chicago',
            description: 'Event that Delete SFTP Server',
            target: {
                arn: props.deleteSFTPStateMachineArn,
                roleArn: props.schedulerRoleArn
            },
        });
    }
}
