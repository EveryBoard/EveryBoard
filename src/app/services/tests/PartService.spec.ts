/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { serverTimestamp } from 'firebase/firestore';
import { PartService } from '../PartService';
import { PartDAO } from 'src/app/dao/PartDAO';
import { Player } from 'src/app/jscaip/Player';
import { PartEvent, Reply, RequestType, Action, PartEventMove } from 'src/app/domain/Part';
import { JSONValue } from 'src/app/utils/utils';
import { PartDAOMock } from 'src/app/dao/tests/PartDAOMock.spec';
import { FirestoreDocument } from 'src/app/dao/FirestoreDAO';

describe('PartService', () => {

    let partService: PartService;
    let partDAO: PartDAO;

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
        partService = TestBed.inject(PartService);
    }));
    it('should be created', () => {
        expect(partService).toBeTruthy();
    });
    describe('addMove', () => {
        it('should add a move event to the DAO', fakeAsync(async() => {
            // Given a part service and its DAO
            spyOn(partDAO.subCollectionDAO<PartEvent>(partId, 'events'), 'create').and.callThrough();
            // When adding a move to the part
            const move: JSONValue = { x: 0, y: 0 };
            await partService.addMove(partId, Player.ZERO, move);
            // Then it is added to the DAO events subcollection
            const moveEvent: PartEvent = {
                eventType: 'Move',
                time: serverTimestamp(),
                player: 0,
                move,
            };
            expect(partDAO.subCollectionDAO<PartEvent>(partId, 'events').create).toHaveBeenCalledOnceWith(moveEvent);
        }));
    });
    describe('addRequest', () => {
        it('should add a request event to the DAO', fakeAsync(async() => {
            // Given a part service and its DAO
            spyOn(partDAO.subCollectionDAO<PartEvent>(partId, 'events'), 'create').and.callThrough();
            // When adding a move to the part
            const requestType: RequestType = 'TakeBack';
            await partService.addRequest(partId, Player.ZERO, requestType);
            // Then it is added to the DAO events subcollection
            const event: PartEvent = {
                eventType: 'Request',
                time: serverTimestamp(),
                player: 0,
                requestType,
            };
            expect(partDAO.subCollectionDAO<PartEvent>(partId, 'events').create).toHaveBeenCalledOnceWith(event);
        }));
    });
    describe('addReply', () => {
        it('should add a request event to the DAO', fakeAsync(async() => {
            // Given a part service and its DAO
            spyOn(partDAO.subCollectionDAO<PartEvent>(partId, 'events'), 'create').and.callThrough();
            // When adding a move to the part
            const requestType: RequestType = 'TakeBack';
            const reply: Reply = 'Accept';
            await partService.addReply(partId, Player.ZERO, reply, requestType);
            // Then it is added to the DAO events subcollection
            const event: PartEvent = {
                eventType: 'Reply',
                time: serverTimestamp(),
                player: 0,
                requestType,
                reply,
                data: null,
            };
            expect(partDAO.subCollectionDAO<PartEvent>(partId, 'events').create).toHaveBeenCalledOnceWith(event);
        }));
    });
    describe('startGame', () => {
        it('should add a start action to the DAO', fakeAsync(async() => {
            // Given a part service and its DAO
            spyOn(partDAO.subCollectionDAO<PartEvent>(partId, 'events'), 'create').and.callThrough();
            // When adding a move to the part
            const action: Action = 'StartGame';
            await partService.startGame(partId, Player.ZERO);
            // Then it is added to the DAO events subcollection
            const event: PartEvent = {
                eventType: 'Action',
                time: serverTimestamp(),
                player: 0,
                action,
            };
            expect(partDAO.subCollectionDAO<PartEvent>(partId, 'events').create).toHaveBeenCalledOnceWith(event);
        }));
    });
    describe('addAction', () => {
        it('should add an action to the DAO', fakeAsync(async() => {
            // Given a part service and its DAO
            spyOn(partDAO.subCollectionDAO<PartEvent>(partId, 'events'), 'create').and.callThrough();
            // When adding a move to the part
            const action: Action = 'AddTurnTime';
            await partService.addAction(partId, Player.ZERO, action);
            // Then it is added to the DAO events subcollection
            const event: PartEvent = {
                eventType: 'Action',
                time: serverTimestamp(),
                player: 0,
                action,
            };
            expect(partDAO.subCollectionDAO<PartEvent>(partId, 'events').create).toHaveBeenCalledOnceWith(event);
        }));
    });
    describe('getLastMoveDoc', () => {
        it('should return the document of the last move', fakeAsync(async() => {
            // Given a part service already containing a move
            const move: JSONValue = { x: 0, y: 0 };
            await partService.addMove(partId, Player.ZERO, move);

            // When getting the document of the last move
            const doc: FirestoreDocument<PartEventMove> = await partService.getLastMoveDoc(partId);

            // Then it should return the... document of the last move
            expect(doc.data.eventType).toBe('Move');
            expect(doc.data.move).toBe(move);
        }));
    });
    describe('subscribeToEvents', () => {
        it('should receive newly added events', fakeAsync(async() => {
            // Given a part service with a part without event, and where we subscribed to the part's events
            let receivedEvents: number = 0;
            partService.subscribeToEvents(partId, async(events: PartEvent[]): Promise<void> => {
                receivedEvents += events.length;
            });
            // When a new event is added
            await partService.addMove(partId, Player.ZERO, { x: 0, y: 0 });
            // Then we receive it
            tick(1);
            expect(receivedEvents).toBe(1);
        }));
        it('should receive already present events when subscribing', fakeAsync(async() => {
            // Given a part service with events already in the part
            await partService.addMove(partId, Player.ZERO, { x: 0, y: 0 });
            await partService.addMove(partId, Player.ONE, { x: 0, y: 1 });
            // When we subscribed to the part events
            let receivedEvents: number = 0;
            partService.subscribeToEvents(partId, async(events: PartEvent[]): Promise<void> => {
                receivedEvents += events.length;
                return;
            });
            // Then we receive the existing events
            expect(receivedEvents).toBe(2);
        }));
    });
});
