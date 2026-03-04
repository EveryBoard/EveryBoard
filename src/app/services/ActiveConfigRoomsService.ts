import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

import { MGPMap } from '@everyboard/lib';

import { ConfigRoom } from '../domain/ConfigRoom';

import { BackendService, BackendMessage } from './BackendService';

export abstract class AbstractActiveConfigRoomsService {

    public abstract subscribe(callback: (rooms: MGPMap<string, ConfigRoom>) => void): Subscription;

}

@Injectable({
    providedIn: 'root',
})
/*
 * This service handles games that a player can join or observe, and is used by
 * the lobby. You must start observing when you need to observe parts, and stop
 * observing when you're done.
 */
export class ActiveConfigRoomsService extends AbstractActiveConfigRoomsService {

    public constructor(private readonly backendService: BackendService) {
        super();
    }

    public override subscribe(callback: (rooms: MGPMap<string, ConfigRoom>) => void): Subscription {
        const activeRooms: MGPMap<string, ConfigRoom> = new MGPMap();
        const updateSubscription: Subscription =
            this.backendService.setCallback('ConfigRoomUpdate', (message: BackendMessage): void => {
                activeRooms.put(message.getArgument('gameId'), message.getArgument('configRoom'));
                callback(activeRooms);
            });
        const deleteSubscription: Subscription =
            this.backendService.setCallback('ConfigRoomDeleted', (message: BackendMessage): void => {
                activeRooms.delete(message.getArgument('gameId'));
                callback(activeRooms);
            });
        return new Subscription(() => {
            updateSubscription.unsubscribe();
            deleteSubscription.unsubscribe();
        });
    }
}
