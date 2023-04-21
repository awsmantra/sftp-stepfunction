import { StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import {Effect, PolicyStatement, Role, ServicePrincipal} from "aws-cdk-lib/aws-iam";
import {Options} from "../types/options";
import {Table} from "aws-cdk-lib/aws-dynamodb";
import {ITopic} from "aws-cdk-lib/aws-sns";
import {StateMachineExecutionRole} from "./state-machine-access-role";

interface SchedulerRoleProps extends StackProps {
    options: Options;
    createSFTPStateMachineArn: string
    deleteSFTPStateMachineArn: string
}

export class ScheduleRole extends cdk.NestedStack  {
    private readonly _role: Role;
    constructor(scope: Construct, id: string, props: SchedulerRoleProps) {
        super(scope, id, props);


        // Add scheduler assumeRole
        this._role  = new Role(this,  "sftp-scheduler", {
            assumedBy: new ServicePrincipal('scheduler.amazonaws.com'),
            roleName: "sftp-scheduler"
        })

        // Add policy
        this._role.addToPolicy(  new PolicyStatement( {
            sid: 'InvokeStateMachine',
            effect: Effect.ALLOW,
            actions: [
                "states:startExecution"
            ],
            resources: [
                props.createSFTPStateMachineArn,
                props.deleteSFTPStateMachineArn
            ],
        }))
    }

    get roleArn(): string {
        return this._role.roleArn;
    }
}
