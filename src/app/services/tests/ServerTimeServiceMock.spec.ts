import { ConfigRoomDAO } from 'src/app/dao/ConfigRoomDAO';
import { Injectable } from '@angular/core';
import { ConnectedUserService } from '../ConnectedUserService';
import { PartDAO } from 'src/app/dao/PartDAO';
import { ChatDAO } from 'src/app/dao/ChatDAO';
import { GameService } from '../GameService';

@Injectable({ providedIn: 'root' })
export class ServerTimeServiceMock extends GameService {

    public constructor(public readonly configRoomDAO: ConfigRoomDAO,
                       partDAO: PartDAO,
                       public readonly chatDAO: ChatDAO,
                       connectedUserService: ConnectedUserService) {
        super(partDAO, connectedUserService);
    }
    public async getServerTime(): Promise<number> {
        return Date.now();
    }

}
