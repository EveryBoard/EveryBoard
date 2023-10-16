import * as grpc from '@grpc/grpc-js';
import { expect } from 'chai'
import { EveryboardClient, GameIdAndType } from '../protos/everyboard';

describe('Server', () => {
    let client: EveryboardClient;

    beforeEach(() => {
        client = new EveryboardClient("0.0.0.0:4884", grpc.credentials.createInsecure());
    });
    it('should work with a simple query', async() => {
        const v = await client.initializeGame(new GameIdAndType({ idToken: 'foo', gameId: 'abc', type: 'P4' }));
        console.log(v)
        expect(v).to.not.be.undefined;
    });
});
