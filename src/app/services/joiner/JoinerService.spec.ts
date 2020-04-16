import { async } from '@angular/core/testing';

import { JoinerService } from './JoinerService';
import { JoinerDAO } from 'src/app/dao/JoinerDAO';
import { IJoinerId, IJoiner, PIJoiner } from 'src/app/domain/ijoiner';
import { of } from 'rxjs';
import { INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';

const fakeJoinerId: IJoinerId = {
    id: "myJoinerId",
    joiner: {
        candidatesNames: ["chosenPlayer", "otherCandidate"],
        chosenPlayer: "chosenPlayer",
        creator: "creator",
        firstPlayer: "creator",
        partStatus: 5,
    },
};
const joinerDaoStub = {
    getObservable: (joinerId: string) => of<IJoinerId>(fakeJoinerId),
    read: (id: string) => {
        return new Promise<IJoiner>((resolve) => {
            resolve(fakeJoinerId.joiner);
        });
    },
    set: (partId: string, joiner: IJoiner) => {
        return new Promise<void>((resolve) => {
            resolve();
        });
    },
    update: (partId: string, update: PIJoiner) => {
        return new Promise<void>((resolve) => {
            resolve();
        });
    },
};
describe('JoinerService', () => {

    let service: JoinerService;

    beforeAll(() => {
        JoinerService.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST;
        JoinerService.IN_TESTING = true;
    });
    beforeEach(() => {
        service = new JoinerService(joinerDaoStub as JoinerDAO);
    });
    it('should create', async(() => {
        expect(service).toBeTruthy();
    }));
    it('startObserving should delegate callback to joinerDao', async(() => {
        const myCallback: (joiner: IJoinerId) => void = (joiner: IJoinerId) => {
            expect(joiner.id).toBe("myJoinerId");
        };
        const mySpy: jasmine.Spy = spyOn(joinerDaoStub, "getObservable").and.returnValue(of({id: "myJoinerId", joiner: null}));
        service.startObserving("myJoinerId", myCallback);
        expect(mySpy).toHaveBeenCalled();
    }));
    it('startObserving should throw exception when called while observing ', async(() => {
        expect(() => {
            service.startObserving("myJoinerId", (iJoinerId: IJoinerId) => {});
            service.startObserving("myJoinerId", (iJoinerId: IJoinerId) => {});
        }).toThrowError("JoinerService.startObserving should not be called while already observing a joiner");
    }));
    it('should delegate read to JoinerDAO', () => {
        const read: jasmine.Spy = spyOn(joinerDaoStub, "read");
        service.readJoinerById("myJoinerId");
        expect(read).toHaveBeenCalled();
    });
    it('should delegate set to JoinerDAO', () => {
        const set: jasmine.Spy = spyOn(joinerDaoStub, "set");
        service.set("partId", fakeJoinerId.joiner);
        expect(set).toHaveBeenCalled();
    });
    it('should delegate update to JoinerDAO', () => {
        const update: jasmine.Spy = spyOn(joinerDaoStub, "update");
        service.updateJoinerById("partId", fakeJoinerId.joiner);
        expect(update).toHaveBeenCalled();
    });
    afterAll(() => {
        JoinerService.IN_TESTING = false;
    });
});