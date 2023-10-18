import * as grpc from '@grpc/grpc-js';
import { expect } from 'chai'
import { EveryboardClient, GameIdAndType } from '../protos/everyboard';
import { EveryboardService } from '../server';

const address: string = "0.0.0.0:8081";

describe('Server', () => {

    let server: grpc.Server;
    let client: EveryboardClient;

    function launchServer(): void {
        server = new grpc.Server();
        server.addService(EveryboardService.definition as any, new EveryboardService());
        server.bindAsync(address, grpc.ServerCredentials.createInsecure(), () => {
            server.start();
        });
    };

    before(() =>  {
        launchServer();
    });
    beforeEach(() => {
        client = new EveryboardClient(address, grpc.credentials.createInsecure());
    });
    it('should work with a simple query', async() => {
        const v = await client.initializeGame(new GameIdAndType({ idToken: 'foo', gameId: 'abc', type: 'P4' }));
        console.log(v)
        expect(v).to.not.be.undefined;
    });
    after(() => {
        server.forceShutdown();
    });
});
