import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

import { MGPMap, MGPOptional, Utils } from '@everyboard/lib';
import { AbstractActiveConfigRoomsService } from '../ActiveConfigRoomsService';
import { ConfigRoom } from 'src/app/domain/ConfigRoom';


@Injectable({ providedIn: 'root' })
export class ActiveConfigRoomsServiceMock extends AbstractActiveConfigRoomsService {

    private subscribedCallback: MGPOptional<(rooms: MGPMap<string, ConfigRoom>) => void> = MGPOptional.empty();

    public override subscribe(callback: (rooms: MGPMap<string, ConfigRoom>) => void): Subscription {
        this.subscribedCallback = MGPOptional.of(callback);
        return new Subscription(() => {
            this.subscribedCallback = MGPOptional.empty();
        });
    }

    public updateRooms(rooms: MGPMap<string, ConfigRoom>): void {
        Utils.assert(this.subscribedCallback.isPresent(), 'ActiveConfigRoomServiceMock should be subscribed');
        this.subscribedCallback.get()(rooms);
    }
}
