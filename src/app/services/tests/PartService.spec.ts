/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { serverTimestamp } from 'firebase/firestore';
import { PartService } from '../PartService';
import { PartDAO } from 'src/app/dao/PartDAO';
import { Player } from 'src/app/jscaip/Player';
import { PartEvent, Reply, RequestType, Action } from 'src/app/domain/Part';
import { JSONValue } from 'src/app/utils/utils';
import { PartDAOMock } from 'src/app/dao/tests/PartDAOMock.spec';

fdescribe('PartService', () => {

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
        partService = TestBed.inject(PartService)
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
//    describe('getLastMoveDoc', () => {
//    });
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
//    describe('subscribeToEvents', () => {
//    });
});
