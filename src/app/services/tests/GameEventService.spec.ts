/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { serverTimestamp } from 'firebase/firestore';
import { GameEventService } from '../GameEventService';
import { PartDAO } from 'src/app/dao/PartDAO';
import { GameEvent, Reply, RequestType, Action } from 'src/app/domain/Part';
import { JSONValue } from 'src/app/utils/utils';
import { PartDAOMock } from 'src/app/dao/tests/PartDAOMock.spec';
import { IFirestoreDAO } from '../../dao/FirestoreDAO';
import { UserMocks } from 'src/app/domain/UserMocks.spec';

describe('GameEventService', () => {

    let gameEventService: GameEventService;
    let partDAO: PartDAO;
    let events: IFirestoreDAO<GameEvent>;

    const partId: string = 'id';

    beforeEach(fakeAsync(async() => {
        await TestBed.configureTestingModule({
            imports: [],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: PartDAO, useClass: PartDAOMock },
            ],
        }).compileComponents();

        partDAO = TestBed.inject(PartDAO);
        gameEventService = TestBed.inject(GameEventService);
        events = partDAO.subCollectionDAO<GameEvent>(partId, 'events');
    }));
    it('should be created', () => {
        expect(gameEventService).toBeTruthy();
    });
    describe('addMove', () => {
        it('should add a move event to the DAO', fakeAsync(async() => {
            // Given a part service and its DAO
            spyOn(events, 'create').and.callThrough();
            // When adding a move to the part
            const move: JSONValue = { x: 0, y: 0 };
            await gameEventService.addMove(partId, UserMocks.CREATOR_MINIMAL_USER, move);
            // Then it is added to the DAO events subcollection
            const moveEvent: GameEvent = {
                eventType: 'Move',
                time: serverTimestamp(),
                user: UserMocks.CREATOR_MINIMAL_USER,
                move,
            };
            expect(events.create).toHaveBeenCalledOnceWith(moveEvent);
        }));
    });
    describe('addRequest', () => {
        it('should add a request event to the DAO', fakeAsync(async() => {
            // Given a part service and its DAO
            spyOn(events, 'create').and.callThrough();
            // When adding a move to the part
            const requestType: RequestType = 'TakeBack';
            await gameEventService.addRequest(partId, UserMocks.CREATOR_MINIMAL_USER, requestType);
            // Then it is added to the DAO events subcollection
            const event: GameEvent = {
                eventType: 'Request',
                time: serverTimestamp(),
                user: UserMocks.CREATOR_MINIMAL_USER,
                requestType,
            };
            expect(events.create).toHaveBeenCalledOnceWith(event);
        }));
    });
    describe('addReply', () => {
        it('should add a request event to the DAO', fakeAsync(async() => {
            // Given a part service and its DAO
            spyOn(events, 'create').and.callThrough();
            // When adding a move to the part
            const requestType: RequestType = 'TakeBack';
            const reply: Reply = 'Accept';
            await gameEventService.addReply(partId, UserMocks.CREATOR_MINIMAL_USER, reply, requestType);
            // Then it is added to the DAO events subcollection
            const event: GameEvent = {
                eventType: 'Reply',
                time: serverTimestamp(),
                user: UserMocks.CREATOR_MINIMAL_USER,
                requestType,
                reply,
                data: null,
            };
            expect(events.create).toHaveBeenCalledOnceWith(event);
        }));
    });
    describe('startGame', () => {
        it('should add a start action to the DAO', fakeAsync(async() => {
            // Given a part service and its DAO
            spyOn(events, 'create').and.callThrough();
            // When adding a move to the part
            const action: Action = 'StartGame';
            await gameEventService.startGame(partId, UserMocks.CREATOR_MINIMAL_USER);
            // Then it is added to the DAO events subcollection
            const event: GameEvent = {
                eventType: 'Action',
                time: serverTimestamp(),
                user: UserMocks.CREATOR_MINIMAL_USER,
                action,
            };
            expect(events.create).toHaveBeenCalledOnceWith(event);
        }));
    });
    describe('addAction', () => {
        it('should add an action to the DAO', fakeAsync(async() => {
            // Given a part service and its DAO
            spyOn(events, 'create').and.callThrough();
            // When adding a move to the part
            const action: Action = 'AddTurnTime';
            await gameEventService.addAction(partId, UserMocks.CREATOR_MINIMAL_USER, action);
            // Then it is added to the DAO events subcollection
            const event: GameEvent = {
                eventType: 'Action',
                time: serverTimestamp(),
                user: UserMocks.CREATOR_MINIMAL_USER,
                action,
            };
            expect(events.create).toHaveBeenCalledOnceWith(event);
        }));
    });
    describe('subscribeToEvents', () => {
        it('should receive newly added events exactly once', fakeAsync(async() => {
            // Given a part service with a part without event, and where we subscribed to the part's events
            let receivedEvents: number = 0;
            gameEventService.subscribeToEvents(partId, (events: GameEvent[]) => {
                receivedEvents += events.length;
            });
            // When a new event is added
            await gameEventService.addMove(partId, UserMocks.CREATOR_MINIMAL_USER, { x: 0, y: 0 });
            // Then we receive it a single time
            // (firestore gives us two updates, one with a null time, which should be filtered by the service)
            tick(0);
            expect(receivedEvents).toBe(1);
        }));
        it('should receive already present events when subscribing', fakeAsync(async() => {
            // Given a part service with events already in the part
            await gameEventService.addMove(partId, UserMocks.CREATOR_MINIMAL_USER, { x: 0, y: 0 });
            await gameEventService.addMove(partId, UserMocks.OPPONENT_MINIMAL_USER, { x: 0, y: 1 });
            // When we subscribed to the part events
            let receivedEvents: number = 0;
            gameEventService.subscribeToEvents(partId, (events: GameEvent[]) => {
                receivedEvents += events.length;
            });
            // Then we receive the existing events
            expect(receivedEvents).toBe(2);
        }));
    });
});
