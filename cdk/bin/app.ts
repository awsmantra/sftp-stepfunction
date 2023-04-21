#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import {SftpStack} from '../lib/sftp-stack';
import {getConfig} from "./config";

const app = new cdk.App();
const options = getConfig();

new SftpStack(app, 'SFTPStack', {
    options: options,
});
