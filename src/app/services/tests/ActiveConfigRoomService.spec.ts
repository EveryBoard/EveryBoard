/* eslint-disable max-lines-per-function */
import { fakeAsync, tick } from '@angular/core/testing';
import { Subscription } from 'rxjs';
import { ConfigRoom, FirstPlayer } from 'src/app/domain/ConfigRoom';
import { ConfigRoomMocks } from 'src/app/domain/ConfigRoomMocks.spec';

import { MGPMap, MGPOptional } from '@everyboard/lib';

import { ActiveConfigRoomsService } from '../ActiveConfigRoomsService';
import { AbstractBackendService, BackendService } from '../BackendService';

import { BackendServiceMock } from './BackendServiceMock.spec';

describe('ActiveConfigRoomsService', () => {

    let activeConfigRoomsService: ActiveConfigRoomsService;
    let backendService: BackendServiceMock;

    function updateConfigRoom(gameId: string, configRoom: ConfigRoom): void {
        backendService.mockReceivedMessage('ConfigRoomUpdate', { gameId, configRoom });
        tick(1);
    }

    function createConfigRoom(gameId: string, configRoom: ConfigRoom): void {
        updateConfigRoom(gameId, configRoom);
    }

    function deleteConfigRoom(gameId: string): void {
        backendService.mockReceivedMessage('ConfigRoomDeleted', { gameId });
        tick(1);
    }

    beforeEach(fakeAsync(async() => {
        backendService = new BackendServiceMock();
        activeConfigRoomsService =
            new ActiveConfigRoomsService(backendService as AbstractBackendService as BackendService);
    }));

    it('should create', () => {
        expect(activeConfigRoomsService).toBeTruthy();
    });

    it('should notify about new parts', fakeAsync(async() => {
        // Given a service where we are observing active config rooms
        let seenRooms: MGPMap<string, ConfigRoom> = new MGPMap();
        const subscription: Subscription = activeConfigRoomsService.subscribe(
            (rooms: MGPMap<string, ConfigRoom>): void => {
                seenRooms = rooms;
            });

        // When a new config room is added
        const configRoom: ConfigRoom = ConfigRoomMocks.getInitial(MGPOptional.empty());
        createConfigRoom('gameId', configRoom);

        // Then the new config room should have been observed
        expect(seenRooms.size()).toBe(1);
        expect(seenRooms.containsKey('gameId')).toBeTrue();
        expect(seenRooms.get('gameId').get()).toEqual(configRoom);

        subscription.unsubscribe();
    }));

    it('should not notify about new parts after we unsubscribed', fakeAsync(async() => {
        // Given a service where we were observing active config rooms but have unsubscribed
        let seenRooms: MGPMap<string, ConfigRoom> = new MGPMap();
        const subscription: Subscription = activeConfigRoomsService.subscribe(
            (rooms: MGPMap<string, ConfigRoom>): void => {
                seenRooms = rooms;
            });
        subscription.unsubscribe();
        // We need another subscription to avoid an error of callback not being registered
        const otherSubscription: Subscription = activeConfigRoomsService.subscribe(
            (_rooms: MGPMap<string, ConfigRoom>): void => {
                /* ignore it */
            });

        // When a new part is added
        const configRoom: ConfigRoom = ConfigRoomMocks.getInitial(MGPOptional.empty());
        createConfigRoom('gameId', configRoom);

        // Then the new config room should have not been observed
        expect(seenRooms.size()).toBe(0);

        otherSubscription.unsubscribe();
    }));

    it('should notify about deleted parts', fakeAsync(async() => {
        // Given a service where observe active config rooms and have already seen one
        let seenRooms: MGPMap<string, ConfigRoom> = new MGPMap();
        const subscription: Subscription = activeConfigRoomsService.subscribe(
            (rooms: MGPMap<string, ConfigRoom>): void => {
                seenRooms = rooms;
            });
        const configRoom: ConfigRoom = ConfigRoomMocks.getInitial(MGPOptional.empty());
        createConfigRoom('gameId', configRoom);

        // When the config room is deleted
        deleteConfigRoom('gameId');

        // Then there should not be any config room left
        expect(seenRooms.size()).toBe(0);

        subscription.unsubscribe();
    }));

    it('should preserve non-deleted config rooms upon a deletion', fakeAsync(async() => {
        // Given a service where observe active config rooms and have already seen two
        let seenRooms: MGPMap<string, ConfigRoom> = new MGPMap();
        const subscription: Subscription = activeConfigRoomsService.subscribe(
            (rooms: MGPMap<string, ConfigRoom>): void => {
                seenRooms = rooms;
            });
        const configRoom: ConfigRoom = ConfigRoomMocks.getInitial(MGPOptional.empty());
        createConfigRoom('gameId', configRoom);
        createConfigRoom('otherGameId', configRoom);

        // When one config room is deleted
        deleteConfigRoom('gameId');

        // Then there should be one config room left
        expect(seenRooms.size()).toBe(1);

        subscription.unsubscribe();
    }));

    it('should update config room when it is modified', fakeAsync(async() => {
        // Given a service where observe active config rooms and have already seen one
        let seenRooms: MGPMap<string, ConfigRoom> = new MGPMap();
        const subscription: Subscription = activeConfigRoomsService.subscribe(
            (rooms: MGPMap<string, ConfigRoom>): void => {
                seenRooms = rooms;
            });
        const configRoom: ConfigRoom = ConfigRoomMocks.getInitial(MGPOptional.empty());
        createConfigRoom('gameId', configRoom);

        // When a config room is updated
        updateConfigRoom('gameId', { ...configRoom, firstPlayer: FirstPlayer.RANDOM } );

        // Then there should be one config room left
        expect(seenRooms.size()).toBe(1);

        subscription.unsubscribe();
    }));

    it('should update only the modified config room', fakeAsync(async() => {
        // Given a service where we observe active config rooms and have seen two
        let seenRooms: MGPMap<string, ConfigRoom> = new MGPMap();
        const subscription: Subscription = activeConfigRoomsService.subscribe(
            (rooms: MGPMap<string, ConfigRoom>): void => {
                seenRooms = rooms;
            });
        const configRoomToBeModified: ConfigRoom = ConfigRoomMocks.getInitial(MGPOptional.empty());
        createConfigRoom('gameId', configRoomToBeModified);
        const configRoomThatWontChange: ConfigRoom = ConfigRoomMocks.withChosenOpponent(MGPOptional.empty());
        createConfigRoom('otherGameId', configRoomThatWontChange);

        // When a config room is updated
        updateConfigRoom('gameId', { ...configRoomToBeModified, firstPlayer: FirstPlayer.RANDOM });

        // Then that config room and only that one should be updated
        expect(seenRooms.size()).toBe(2);
        expect(seenRooms.get('gameId').get().firstPlayer).toEqual(FirstPlayer.RANDOM);
        expect(seenRooms.get('otherGameId').get()).toEqual(configRoomThatWontChange);

        subscription.unsubscribe();
    }));

    it('should not duplicate config rooms when we subscribe a second time', fakeAsync(async() => {
        // Given a service where we observed active config rooms in the past, and are now subscribed again
        let seenRooms: MGPMap<string, ConfigRoom> = new MGPMap();
        let subscription: Subscription = activeConfigRoomsService.subscribe(
            (rooms: MGPMap<string, ConfigRoom>): void => {
                seenRooms = rooms;
            });
        subscription.unsubscribe();

        subscription = activeConfigRoomsService.subscribe(
            (rooms: MGPMap<string, ConfigRoom>): void => {
                seenRooms = rooms;
            });

        // When a config room appears
        const configRoom: ConfigRoom = ConfigRoomMocks.getInitial(MGPOptional.empty());
        createConfigRoom('gameId', configRoom);

        // Then it should only appear once
        expect(seenRooms.size()).toBe(1);
    }));

});
