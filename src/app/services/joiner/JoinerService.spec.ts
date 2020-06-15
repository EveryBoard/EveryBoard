import { async } from '@angular/core/testing';

import { JoinerService } from './JoinerService';
import { JoinerDAO } from 'src/app/dao/joiner/JoinerDAO';
import { IJoinerId, IJoiner } from 'src/app/domain/ijoiner';
import { of } from 'rxjs';
import { INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';
import { JoinerDAOMock, fakeJoinerId } from 'src/app/dao/joiner/JoinerDAOMock';
import { JoinerMocks } from 'src/app/domain/JoinerMocks';

describe('JoinerService', () => {

    let dao: JoinerDAOMock;

    let service: JoinerService;

    beforeAll(() => {
        JoinerService.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || JoinerService.VERBOSE;
    });
    beforeEach(() => {
        dao = new JoinerDAOMock();
        service = new JoinerService(dao as JoinerDAO);
    });
    it('should create', async(() => {
        expect(service).toBeTruthy();
    }));
    it('startObserving should delegate callback to joinerDao', async(() => {
        const myCallback: (joiner: IJoinerId) => void = (joiner: IJoinerId) => {
            expect(joiner.id).toBe("myJoinerId");
        };
        const mySpy: jasmine.Spy = spyOn(dao, "getObservable").and.returnValue(of({id: "myJoinerId", joiner: null}));
        service.startObserving("myJoinerId", myCallback);
        expect(mySpy).toHaveBeenCalled();
    }));
    it('startObserving should throw exception when called while observing ', async(() => {
        service.set("myJoinerId", fakeJoinerId.joiner);
        service.startObserving("myJoinerId", (iJoinerId: IJoinerId) => {});

        expect(() => {
            service.startObserving("myJoinerId", (iJoinerId: IJoinerId) => {});
        }).toThrowError("JoinerService.startObserving should not be called while already observing a joiner");
    }));
    it('read should be delegated to JoinerDAO', () => {
        const read: jasmine.Spy = spyOn(dao, "read");
        service.readJoinerById("myJoinerId");
        expect(read).toHaveBeenCalled();
    });
    it('set should be delegated to JoinerDAO', () => {
        const set: jasmine.Spy = spyOn(dao, "set");
        service.set("partId", fakeJoinerId.joiner);
        expect(set).toHaveBeenCalled();
    });
    it('update should delegated to JoinerDAO', () => {
        const update: jasmine.Spy = spyOn(dao, "update");
        service.updateJoinerById("partId", fakeJoinerId.joiner);
        expect(update).toHaveBeenCalled();
    });
    it('joinGame should throw when called by a user already in the game', async(async() => {
        dao.set(fakeJoinerId.id, fakeJoinerId.joiner);

        try {
            await service.joinGame(fakeJoinerId.id, fakeJoinerId.joiner.candidatesNames[0]);
        } catch (error) {
            expect(error.message).toEqual("JoinerService.joinGame was called by a user already in the game");
        }
    }));
    it('joinGame should not update joiner when called by the creator', async(async() => {
        dao.set(fakeJoinerId.id, fakeJoinerId.joiner);
        const updateSpy: jasmine.Spy = spyOn(dao, "update").and.callThrough();
        expect(updateSpy).not.toHaveBeenCalled();

        await service.joinGame(fakeJoinerId.id, fakeJoinerId.joiner.creator);

        const resultingJoiner: IJoiner = await dao.read(fakeJoinerId.id);

        expect(updateSpy).not.toHaveBeenCalled();
        expect(resultingJoiner).toEqual(fakeJoinerId.joiner);
    }));
    it('joinGame should be delegated to JoinerDAO', async(async() => {
        dao.set(fakeJoinerId.id, fakeJoinerId.joiner);
        const update: jasmine.Spy = spyOn(dao, "update");

        await service.joinGame(fakeJoinerId.id, "some totally new user");

        expect(update).toHaveBeenCalled();
    }));
    it('cancelJoining should throw when there was no observed joiner', async(async() => {
        let threw: boolean = false;

        try {
            await service.cancelJoining("whoever");
        } catch (error) {
            expect(error.message).toEqual('cannot cancel joining when not observing a joiner');
            threw = true;
        } finally {
            expect(threw).toBeTruthy();
        }
    }));
    it('cancelJoining should delegate update to DAO', async(async() => {
        dao.set(fakeJoinerId.id, fakeJoinerId.joiner);
        service.startObserving(fakeJoinerId.id, (iJoiner: IJoinerId) => {});
        service.joinGame(fakeJoinerId.id, "someone totally new");

        const update: jasmine.Spy = spyOn(dao, "update");

        await service.cancelJoining("someone totally new");

        expect(update).toHaveBeenCalled();
    }));
    it('cancelJoining should start as new when chosenPlayer leaves', async(async() => {
        dao.set("joinerId", JoinerMocks.JOINER_WITH_CHOSEN_PLAYER.copy());
        let currentIJoiner: IJoiner;
        service.startObserving("joinerId", (newJoinerReceived: IJoinerId) => {
            currentIJoiner = newJoinerReceived.joiner;
        });
        await service.cancelJoining("firstCandidate");
        expect(currentIJoiner).toEqual(JoinerMocks.JOINER_INITIAL.copy(), "Should be as new");
    }));
    it('cancelJoining should throw when called by someone who is nor candidate nor chosenPlayer', async(async() => {
        dao.set(fakeJoinerId.id, fakeJoinerId.joiner);
        service.startObserving(fakeJoinerId.id, (iJoiner: IJoinerId) => {});
        service.joinGame(fakeJoinerId.id, "whoever");

        let threw: boolean = false;
        let errorMessage: string;

        try {
            await service.cancelJoining("who is that");
        } catch (error) {
            errorMessage = error.message;
            threw = true;
        } finally {
            expect(errorMessage).toEqual('someone that was nor candidate nor chosenPlayer just left the chat: who is that');
            expect(threw).toBeTruthy();
        }
    }));
});