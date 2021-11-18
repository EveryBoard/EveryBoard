import { fakeAsync } from '@angular/core/testing';

import { JoinerService } from '../JoinerService';
import { JoinerDAO } from 'src/app/dao/JoinerDAO';
import { IJoiner, PartStatus } from 'src/app/domain/ijoiner';
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
    it('read should be delegated to JoinerDAO', fakeAsync(async() => {
        spyOn(dao, 'read');
        await service.readJoinerById('myJoinerId');
        expect(dao.read).toHaveBeenCalled();
    }));
    it('set should be delegated to JoinerDAO', fakeAsync(async() => {
        spyOn(dao, 'set');
        await service.set('partId', JoinerMocks.INITIAL.doc);
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
        it('should throw when called by a candidate already in the game', fakeAsync(async() => {
            // This was considered as "should throw an error", but this is wrong:
            // if the candidate opens two tabs to the same part,
            // its JS console should not be filled with errors, he should see the same page!
            dao.set('joinerId', JoinerMocks.WITH_FIRST_CANDIDATE.doc);
            const candidateName: string = JoinerMocks.WITH_FIRST_CANDIDATE.doc.candidates[0];
            const expectedError: Error = new Error('JoinerService.joinGame was called by a user already in the game');
            await expectAsync(service.joinGame('joinerId', candidateName)).toBeRejectedWith(expectedError);
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
            const expectedError: Error = new Error('cannot cancel joining when not observing a joiner');
            await expectAsync(service.cancelJoining('whoever')).toBeRejectedWith(expectedError);
        }));
        it('should delegate update to DAO', fakeAsync(async() => {
            dao.set('joinerId', JoinerMocks.INITIAL.doc);
            service.observe('joinerId');
            await service.joinGame('joinerId', 'someone totally new');

            spyOn(dao, 'update');

            await service.cancelJoining('someone totally new');

            expect(dao.update).toHaveBeenCalled();
        }));
        it('should start as new when chosenPlayer leaves', fakeAsync(async() => {
            dao.set('joinerId', JoinerMocks.WITH_CHOSEN_PLAYER.doc);
            service.observe('joinerId');

            await service.cancelJoining('firstCandidate');
            const currentJoiner: IJoiner = dao.getStaticDB().get('joinerId').getOrNull().subject.value.doc;
            expect(currentJoiner).withContext('should be as new').toEqual(JoinerMocks.INITIAL.doc);
        }));
        it('should throw when called by someone who is nor candidate nor chosenPlayer', fakeAsync(async() => {
            dao.set('joinerId', JoinerMocks.INITIAL.doc);
            service.observe('joinerId');
            await service.joinGame('joinerId', 'whoever');

            await expectAsync(service.cancelJoining('who is that')).toBeRejectedWith(new Error('someone that was nor candidate nor chosenPlayer just left the chat: who is that'));
        }));
    });
    describe('updateCandidates', () => {
        it('should delegate to DAO for current joiner', fakeAsync(async() => {
            dao.set('joinerId', JoinerMocks.INITIAL.doc);
            service.observe('joinerId');

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
            service.observe('joinerId');

            spyOn(dao, 'delete');

            await service.deleteJoiner();

            expect(dao.delete).toHaveBeenCalledWith('joinerId');
        }));
    });
    describe('reviewConfig', () => {
        it('should change part status with DAO', fakeAsync(async() => {
            dao.set('joinerId', JoinerMocks.INITIAL.doc);
            service.observe('joinerId');

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
            service.observe('joinerId');

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
            service.observe('joinerId');

            spyOn(dao, 'update');

            await service.acceptConfig();

            expect(dao.update).toHaveBeenCalledWith('joinerId', {
                partStatus: PartStatus.PART_STARTED.value,
            });
        }));
    });
});
