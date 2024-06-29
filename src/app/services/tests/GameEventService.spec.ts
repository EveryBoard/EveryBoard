/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { GameEventService } from '../GameEventService';
import { PartDAO } from 'src/app/dao/PartDAO';
import { GameEvent } from 'src/app/domain/Part';
import { JSONValue } from '@everyboard/lib';
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

    async function addMove(move: JSONValue): Promise<void> {
        await events.create({
            eventType: 'Move',
            time: Date.now(),
            user: UserMocks.CREATOR_MINIMAL_USER,
            move,
        });
    }

    it('should be created', () => {
        expect(gameEventService).toBeTruthy();
    });

    describe('subscribeToEvents', () => {

        it('should receive newly added events exactly once', fakeAsync(async() => {
            // Given a part service with a part without event, and where we subscribed to the part's events
            let receivedEvents: number = 0;
            gameEventService.subscribeToEvents(partId, (gameEvents: GameEvent[]) => {
                receivedEvents += gameEvents.length;
            });
            // When a new event is added
            await addMove({ x: 0 });
            // Then we receive it a single time
            // (firestore gives us two updates, one with a null time, which should be filtered by the service)
            tick(0);
            expect(receivedEvents).toBe(1);
        }));

        it('should receive already present events when subscribing', fakeAsync(async() => {
            // Given a part service with events already in the part
            await addMove({ x: 0 });
            await addMove({ x: 1 });
            // When we subscribed to the part events
            let receivedEvents: number = 0;
            gameEventService.subscribeToEvents(partId, (gameEvents: GameEvent[]) => {
                receivedEvents += gameEvents.length;
            });
            // Then we receive the existing events
            expect(receivedEvents).toBe(2);
        }));

    });

});

