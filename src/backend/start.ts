import * as grpc from '@grpc/grpc-js';
import { EveryboardService } from './server';

const server: grpc.Server = new grpc.Server();
server.addService(EveryboardService.definition, new EveryboardService());
server.bindAsync('0.0.0.0:8081', grpc.ServerCredentials.createInsecure(), () => {

    server.start();
});
