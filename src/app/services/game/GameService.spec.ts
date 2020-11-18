import { async, TestBed } from '@angular/core/testing';

import { GameService } from './GameService';
import { PartDAO } from 'src/app/dao/part/PartDAO';
import { of } from 'rxjs';
import { ICurrentPart, ICurrentPartId } from 'src/app/domain/icurrentpart';
import { INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';
import { PartDAOMock } from 'src/app/dao/part/PartDAOMock';
import { JoinerDAO } from 'src/app/dao/joiner/JoinerDAO';
import { JoinerDAOMock } from 'src/app/dao/joiner/JoinerDAOMock';
import { ChatDAOMock } from 'src/app/dao/chat/ChatDAOMock';
import { ChatDAO } from 'src/app/dao/chat/ChatDAO';
import { PartMocks } from 'src/app/domain/PartMocks';
import { Player } from 'src/app/jscaip/Player';
import { RequestCode } from 'src/app/domain/request';

describe('GameService', () => {

    let service: GameService;

    let partDao: PartDAO;

    beforeAll(() => {
        GameService.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || GameService.VERBOSE;
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: PartDAO,   useClass: PartDAOMock },
                { provide: JoinerDAO, useClass: JoinerDAOMock },
                { provide: ChatDAO,   useClass: ChatDAOMock },
            ],
        }).compileComponents();
        service = TestBed.get(GameService);
        partDao = TestBed.get(PartDAO);
    });

    it('should create', async(() => {
        expect(service).toBeTruthy();
    }));

    it('startObserving should delegate callback to partDao', async(() => {
        const myCallback: (iPart: ICurrentPartId) => void = (iPart: ICurrentPartId) => {
            expect(iPart.id).toBe("partId");
        };
        const mySpy: jasmine.Spy = spyOn(partDao, "getObsById").and.returnValue(of({id: "partId", doc: null}));
        service.startObserving("partId", myCallback);
        expect(mySpy).toHaveBeenCalled();
    }));

    it('startObserving should throw exception when called while observing ', async(() => {
        partDao.set("myJoinerId", PartMocks.INITIAL.copy());

        expect(() => {
            service.startObserving("myJoinerId", (iPart: ICurrentPartId) => {});
            service.startObserving("myJoinerId", (iPart: ICurrentPartId) => {});
        }).toThrowError("GameService.startObserving should not be called while already observing a game");
    }));

    it('should delegate delete to PartDAO', () => {
        const deleteSpy: jasmine.Spy = spyOn(partDao, "delete");
        service.deletePart("partId");
        expect(deleteSpy).toHaveBeenCalled();
    });

    it('should forbid to accept a take back that the player proposed himself', () => {
        const part: ICurrentPart = {
            typeGame: 'Quarto',
            playerZero: 'creator',
            playerOne: 'joiner',
            turn: 2,
            listMoves: [ 107, 161],
            request: { code: RequestCode.ZERO_ASKED_TAKE_BACK.toInterface().code }
        };
        expect(() => service.acceptTakeBack('joinerId', part, Player.ZERO)).toThrowError('Illegal to accept your own request.');
        part.request.code = RequestCode.ONE_ASKED_TAKE_BACK.toInterface().code;
        expect(() => service.acceptTakeBack('joinerId', part, Player.ONE)).toThrowError('Illegal to accept your own request.');
    });
});