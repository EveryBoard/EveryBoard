import { async } from '@angular/core/testing';

import { GameService } from './GameService';
import { PartDAO } from 'src/app/dao/part/PartDAO';
import { ActivesPartsService } from '../actives-parts/ActivesPartsService';
import { JoinerService } from '../joiner/JoinerService';
import { ChatService } from '../chat/ChatService';
import { of } from 'rxjs';
import { ICurrentPartId } from 'src/app/domain/icurrentpart';
import { INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';

const partDaoStub = {

    getObsById: (partId: string) => of<ICurrentPartId>(null),

    delete: (partId: string) => {
        return new Promise<void>((resolve) => {
            resolve();
        });
    },
};
const activesPartsServiceStub = {
};
const joinerServiceStub = {
};
const chatServiceStub = {
};
describe('GameService', () => {

    let service: GameService;

    beforeAll(() => {
        GameService.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || GameService.VERBOSE;
    });
    beforeEach(() => {
        service = new GameService(partDaoStub as unknown as PartDAO,
                                  activesPartsServiceStub as ActivesPartsService,
                                  joinerServiceStub as JoinerService,
                                  chatServiceStub as ChatService);
    });
    it('should create', async(() => {
        expect(service).toBeTruthy();
    }));
    it('startObserving should delegate callback to partDao', async(() => {
        const myCallback: (iPart: ICurrentPartId) => void = (iPart: ICurrentPartId) => {
            expect(iPart.id).toBe("partId");
        };
        const mySpy: jasmine.Spy = spyOn(partDaoStub, "getObsById").and.returnValue(of({id: "partId", doc: null}));
        service.startObserving("partId", myCallback);
        expect(mySpy).toHaveBeenCalled();
    }));
    it('startObserving should throw exception when called while observing ', async(() => {
        expect(() => {
            service.startObserving("myJoinerId", (iPart: ICurrentPartId) => {});
            service.startObserving("myJoinerId", (iPart: ICurrentPartId) => {});
        }).toThrowError("GameService.startObserving should not be called while already observing a game");
    }));
    it('should delegate delete to PartDAO', () => {
        const deleteSpy: jasmine.Spy = spyOn(partDaoStub, "delete");
        service.deletePart("partId");
        expect(deleteSpy).toHaveBeenCalled();
    });
});