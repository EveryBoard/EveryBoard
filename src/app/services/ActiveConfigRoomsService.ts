import { Injectable } from '@angular/core';

import { MGPMap } from '@everyboard/lib';

import { Subscription } from 'rxjs';
import { BackendService, WebSocketMessage } from './BackendService';
import { ConfigRoom } from '../domain/ConfigRoom';

@Injectable({
    providedIn: 'root',
})
/*
 * This service handles games that a player can join or observe, and is used by
 * the lobby. You must start observing when you need to observe parts, and stop
 * observing when you're done.
 */
export class ActiveConfigRoomsService {

    public constructor(private readonly backendService: BackendService) {
    }

    public subscribe(callback: (rooms: MGPMap<string, ConfigRoom>) => void): Subscription {
        const activeRooms: MGPMap<string, ConfigRoom> = new MGPMap();
        const updateSubscription: Subscription =
            this.backendService.setCallback('ConfigRoomUpdate', (message: WebSocketMessage): void => {
                activeRooms.set(message.getArgument('gameId'), message.getArgument('configRoom'));
                callback(activeRooms);
            });
        const deleteSubscription: Subscription =
            this.backendService.setCallback('ConfigRoomDeleted', (message: WebSocketMessage): void => {
                activeRooms.delete(message.getArgument('gameId'));
                callback(activeRooms);
            });
        return new Subscription(() => {
            updateSubscription.unsubscribe();
            deleteSubscription.unsubscribe();
        });
    }
}
