import { async, TestBed } from '@angular/core/testing';

import { GameService } from './GameService';
import { PartDAO } from 'src/app/dao/part/PartDAO';
import { of } from 'rxjs';
import { ICurrentPartId } from 'src/app/domain/icurrentpart';
import { INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';
import { PartDAOMock } from 'src/app/dao/part/PartDAOMock';
import { JoinerDAO } from 'src/app/dao/joiner/JoinerDAO';
import { JoinerDAOMock } from 'src/app/dao/joiner/JoinerDAOMock';
import { ChatDAOMock } from 'src/app/dao/chat/ChatDAOMock';
import { ChatDAO } from 'src/app/dao/chat/ChatDAO';
import { PartMocks } from 'src/app/domain/PartMocks';

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

    it('should forbid to accept a take back that the player proposed himself');
});