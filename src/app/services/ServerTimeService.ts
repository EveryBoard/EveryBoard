import { Injectable } from '@angular/core';
import { JSONValue, MGPFallible, Utils } from '@everyboard/lib';
import { BackendService } from './BackendService';
import { ConnectedUserService } from './ConnectedUserService';

@Injectable({
    providedIn: 'root',
})
export class ServerTimeService extends BackendService {

    public constructor(connectedUserService: ConnectedUserService) {
        super(connectedUserService);
    }

    /** Retrieve the current time of the server */
    public async getServerTimeInMs(): Promise<number> {
        const endpoint: string = `time`;
        const result: MGPFallible<JSONValue> = await this.performRequestWithJSONResponse('GET', endpoint);
        this.assertSuccess(result);
        // eslint-disable-next-line dot-notation
        return Utils.getNonNullable(result.get())['time'] as number;
    }

}
