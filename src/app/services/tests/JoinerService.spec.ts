import { fakeAsync } from '@angular/core/testing';

import { JoinerService } from '../JoinerService';
import { JoinerDAO } from 'src/app/dao/JoinerDAO';
import { IJoinerId, IJoiner, PartStatus } from 'src/app/domain/ijoiner';
import { of } from 'rxjs';
import { JoinerDAOMock } from 'src/app/dao/tests/JoinerDAOMock.spec';
import { JoinerMocks } from 'src/app/domain/JoinerMocks.spec';

describe('JoinerService', () => {
    let dao: JoinerDAOMock;

    let service: JoinerService;

    beforeEach(() => {
        dao = new JoinerDAOMock();
        service = new JoinerService(dao as unknown as JoinerDAO);
    });
    it('should create', fakeAsync(() => {
        expect(service).toBeTruthy();
    }));
    describe('startObserving', () => {
        it('should delegate callback to joinerDao', fakeAsync(() => {
            const myCallback: (joiner: IJoinerId) => void = (joiner: IJoinerId) => {
                expect(joiner.id).toBe('myJoinerId');
            };
            spyOn(dao, 'getObsById').and.returnValue(of({ id: 'myJoinerId', doc: null }));
            service.startObserving('myJoinerId', myCallback);
            expect(dao.getObsById).toHaveBeenCalled();
        }));
        it('should throw exception when called while observing ', fakeAsync(() => {
            service.set('myJoinerId', JoinerMocks.INITIAL.doc);
            service.startObserving('myJoinerId', () => {});

            expect(() => {
                service.startObserving('myJoinerId', () => {});
            }).toThrowError('JoinerService.startObserving should not be called while already observing a joiner');
        }));
    });
    it('read should be delegated to JoinerDAO', fakeAsync(async() => {
        spyOn(dao, 'read');
        service.readJoinerById('myJoinerId');
        expect(dao.read).toHaveBeenCalled();
    }));
    it('set should be delegated to JoinerDAO', fakeAsync(async() => {
        spyOn(dao, 'set');
        service.set('partId', JoinerMocks.INITIAL.doc);
        expect(dao.set).toHaveBeenCalled();
    }));
    it('update should delegated to JoinerDAO', fakeAsync(async() => {
        spyOn(dao, 'update');
        await service.updateJoinerById('partId', JoinerMocks.INITIAL.doc);
        expect(dao.update).toHaveBeenCalled();
    }));
    it('createInitialJoiner should delegate to the DAO set method', fakeAsync(async() => {
        spyOn(dao, 'set');
        await service.createInitialJoiner('creator', 'id');
        expect(dao.set).toHaveBeenCalledWith('id', {
            ...JoinerService.EMPTY_JOINER,
            creator: 'creator',
        });
    }));
    describe('joinGame', () => {
        it('should not throw when called by a candidate already in the game', fakeAsync(async() => {
            // This was considered as "should throw an error", but this is wrong:
            // if the candidate opens two tabs to the same part,
            // its JS console should not be filled with errors, he should see the same page!
            dao.set('joinerId', JoinerMocks.WITH_FIRST_CANDIDATE.doc);
            const candidateName: string = JoinerMocks.WITH_FIRST_CANDIDATE.doc.candidates[0];
            await expectAsync(service.joinGame('joinerId', candidateName)).toBeResolved();
        }));
        it('should not update joiner when called by the creator', fakeAsync(async() => {
            dao.set('joinerId', JoinerMocks.INITIAL.doc);
            spyOn(dao, 'update').and.callThrough();
            expect(dao.update).not.toHaveBeenCalled();

            await service.joinGame('joinerId', JoinerMocks.INITIAL.doc.creator);

            const resultingJoiner: IJoiner = await dao.read('joinerId');

            expect(dao.update).not.toHaveBeenCalled();
            expect(resultingJoiner).toEqual(JoinerMocks.INITIAL.doc);
        }));
        it('should be delegated to JoinerDAO', fakeAsync(async() => {
            dao.set('joinerId', JoinerMocks.INITIAL.doc);
            spyOn(dao, 'update');

            await service.joinGame('joinerId', 'some totally new user');

            expect(dao.update).toHaveBeenCalled();
        }));
        it('should return false when joining an invalid joiner', fakeAsync(async() => {
            spyOn(dao, 'read').and.returnValue(null);
            await expectAsync(service.joinGame('invalidJoinerId', 'creator')).toBeResolvedTo(false);
        }));
    });
    describe('cancelJoining', () => {
        it('cancelJoining should throw when there was no observed joiner', fakeAsync(async() => {
            await expectAsync(service.cancelJoining('whoever')).toBeRejectedWith(new Error('cannot cancel joining when not observing a joiner'));
        }));
        it('should delegate update to DAO', fakeAsync(async() => {
            dao.set('joinerId', JoinerMocks.INITIAL.doc);
            service.startObserving('joinerId', (_iJoiner: IJoinerId) => {});
            await service.joinGame('joinerId', 'someone totally new');

            spyOn(dao, 'update');

            await service.cancelJoining('someone totally new');

            expect(dao.update).toHaveBeenCalled();
        }));
        it('should start as new when chosenPlayer leaves', fakeAsync(async() => {
            dao.set('joinerId', JoinerMocks.WITH_CHOSEN_PLAYER.doc);
            let currentIJoiner: IJoiner;
            service.startObserving('joinerId', (newJoinerReceived: IJoinerId) => {
                currentIJoiner = newJoinerReceived.doc;
            });
            await service.cancelJoining('firstCandidate');
            expect(currentIJoiner).withContext('should be as new').toEqual(JoinerMocks.INITIAL.doc);
        }));
        it('should throw when called by someone who is nor candidate nor chosenPlayer', fakeAsync(async() => {
            dao.set('joinerId', JoinerMocks.INITIAL.doc);
            service.startObserving('joinerId', (_iJoiner: IJoinerId) => {});
            await service.joinGame('joinerId', 'whoever');

            await expectAsync(service.cancelJoining('who is that')).toBeRejectedWith(new Error('someone that was nor candidate nor chosenPlayer just left the chat: who is that'));
        }));
    });
    describe('updateCandidates', () => {
        it('should delegate to DAO for current joiner', fakeAsync(async() => {
            dao.set('joinerId', JoinerMocks.INITIAL.doc);
            service.startObserving('joinerId', () => {});

            spyOn(dao, 'update');

            await service.updateCandidates(['candidate1', 'candidate2']);

            expect(dao.update).toHaveBeenCalledWith('joinerId', {
                candidates: ['candidate1', 'candidate2'],
            });
        }));
    });
    describe('deleteJoiner', () => {
        it('should delegate deletion to DAO', fakeAsync(async() => {
            dao.set('joinerId', JoinerMocks.INITIAL.doc);
            service.startObserving('joinerId', () => {});

            spyOn(dao, 'delete');

            await service.deleteJoiner();

            expect(dao.delete).toHaveBeenCalledWith('joinerId');
        }));
    });
    describe('reviewConfig', () => {
        it('should change part status with DAO', fakeAsync(async() => {
            dao.set('joinerId', JoinerMocks.INITIAL.doc);
            service.startObserving('joinerId', () => {});

            spyOn(dao, 'update');

            await service.reviewConfig();

            expect(dao.update).toHaveBeenCalledWith('joinerId', {
                partStatus: PartStatus.PART_CREATED.value,
            });
        }));
    });
    describe('reviewConfigRemoveChosenPlayerAndUpdateCandidates', () => {
        it('should change part status, chosen player and candidates with DAO', fakeAsync(async() => {
            dao.set('joinerId', JoinerMocks.INITIAL.doc);
            service.startObserving('joinerId', () => {});

            spyOn(dao, 'update');

            await service.reviewConfigRemoveChosenPlayerAndUpdateCandidates(['candidate1']);

            expect(dao.update).toHaveBeenCalledWith('joinerId', {
                partStatus: PartStatus.PART_CREATED.value,
                chosenPlayer: '',
                candidates: ['candidate1'],
            });
        }));
    });
    describe('acceptConfig', () => {
        it('should change part status with DAO', fakeAsync(async() => {
            dao.set('joinerId', JoinerMocks.INITIAL.doc);
            service.startObserving('joinerId', () => {});

            spyOn(dao, 'update');

            await service.acceptConfig();

            expect(dao.update).toHaveBeenCalledWith('joinerId', {
                partStatus: PartStatus.PART_STARTED.value,
            });
        }));
    });
});
