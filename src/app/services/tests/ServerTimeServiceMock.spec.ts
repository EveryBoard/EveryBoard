import { Injectable } from '@angular/core';
import { ConnectedUserService } from '../ConnectedUserService';
import { ServerTimeService } from '../ServerTimeService';

@Injectable({ providedIn: 'root' })
export class ServerTimeServiceMock extends ServerTimeService {

    public constructor(connectedUserService: ConnectedUserService) {
        super(connectedUserService);
    }
    public override async getServerTimeInMs(): Promise<number> {
        return Date.now();
    }

}
