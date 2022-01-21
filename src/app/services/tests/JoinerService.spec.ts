/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { JoinerService } from '../JoinerService';
import { JoinerDAO } from 'src/app/dao/JoinerDAO';
import { FirstPlayer, Joiner, PartStatus, PartType } from 'src/app/domain/Joiner';
import { JoinerDAOMock } from 'src/app/dao/tests/JoinerDAOMock.spec';
import { JoinerMocks } from 'src/app/domain/JoinerMocks.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';

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
        spyOn(dao, 'read').and.resolveTo(MGPOptional.of(JoinerMocks.WITH_FIRST_CANDIDATE));
        await service.readJoinerById('myJoinerId');
        expect(dao.read).toHaveBeenCalledWith('myJoinerId');
    }));
    it('set should be delegated to JoinerDAO', fakeAsync(async() => {
        spyOn(dao, 'set');
        await service.set('partId', JoinerMocks.INITIAL);
        expect(dao.set).toHaveBeenCalled();
    }));
    it('update should delegated to JoinerDAO', fakeAsync(async() => {
        spyOn(dao, 'update');
        await service.updateJoinerById('partId', JoinerMocks.INITIAL);
        expect(dao.update).toHaveBeenCalled();
    }));
    it('createInitialJoiner should delegate to the DAO set method', fakeAsync(async() => {
        spyOn(dao, 'set');
        await service.createInitialJoiner('creator', 'id');
        expect(dao.set).toHaveBeenCalledWith('id', {
            candidates: [],
            chosenPlayer: null,
            firstPlayer: FirstPlayer.RANDOM.value,
            partType: PartType.STANDARD.value,
            partStatus: PartStatus.PART_CREATED.value,
            maximalMoveDuration: PartType.NORMAL_MOVE_DURATION,
            totalPartDuration: PartType.NORMAL_PART_DURATION,
            creator: 'creator',
        });
    }));
    describe('joinGame', () => {
        it('should throw when called by a candidate already in the game', fakeAsync(async() => {
            // This was considered as "should throw an error", but this is wrong:
            // if the candidate opens two tabs to the same part,
            // its JS console should not be filled with errors, he should see the same page!
            await dao.set('joinerId', JoinerMocks.WITH_FIRST_CANDIDATE);
            const candidateName: string = JoinerMocks.WITH_FIRST_CANDIDATE.candidates[0];
            const expectedError: Error = new Error('JoinerService.joinGame was called by a user already in the game');
            await expectAsync(service.joinGame('joinerId', candidateName)).toBeRejectedWith(expectedError);
        }));
        it('should not update joiner when called by the creator', fakeAsync(async() => {
            await dao.set('joinerId', JoinerMocks.INITIAL);
            spyOn(dao, 'update').and.callThrough();
            expect(dao.update).not.toHaveBeenCalled();

            await service.joinGame('joinerId', JoinerMocks.INITIAL.creator);

            const resultingJoiner: Joiner = (await dao.read('joinerId')).get();

            expect(dao.update).not.toHaveBeenCalled();
            expect(resultingJoiner).toEqual(JoinerMocks.INITIAL);
        }));
        it('should be delegated to JoinerDAO', fakeAsync(async() => {
            await dao.set('joinerId', JoinerMocks.INITIAL);
            spyOn(dao, 'update');

            await service.joinGame('joinerId', 'some totally new user');

            expect(dao.update).toHaveBeenCalled();
        }));
        it('should return false when joining an invalid joiner', fakeAsync(async() => {
            spyOn(dao, 'read').and.resolveTo(MGPOptional.empty());
            await expectAsync(service.joinGame('invalidJoinerId', 'creator')).toBeResolvedTo(false);
        }));
    });
    describe('cancelJoining', () => {
        it('cancelJoining should throw when there was no observed joiner', fakeAsync(async() => {
            const expectedError: Error = new Error('cannot cancel joining when not observing a joiner');
            await expectAsync(service.cancelJoining('whoever')).toBeRejectedWith(expectedError);
        }));
        it('should delegate update to DAO', fakeAsync(async() => {
            await dao.set('joinerId', JoinerMocks.INITIAL);
            service.observe('joinerId');
            await service.joinGame('joinerId', 'someone totally new');

            spyOn(dao, 'update');

            await service.cancelJoining('someone totally new');

            expect(dao.update).toHaveBeenCalled();
        }));
        it('should start as new when chosenPlayer leaves', fakeAsync(async() => {
            await dao.set('joinerId', JoinerMocks.WITH_CHOSEN_PLAYER);
            service.observe('joinerId');

            await service.cancelJoining('firstCandidate');
            const currentJoiner: Joiner = dao.getStaticDB().get('joinerId').get().subject.value.get().data;
            expect(currentJoiner).withContext('should be as new').toEqual(JoinerMocks.INITIAL);
        }));
        it('should throw when called by someone who is nor candidate nor chosenPlayer', fakeAsync(async() => {
            await dao.set('joinerId', JoinerMocks.INITIAL);
            service.observe('joinerId');
            await service.joinGame('joinerId', 'whoever');

            await expectAsync(service.cancelJoining('who is that')).toBeRejectedWith(new Error('someone that was not candidate nor chosenPlayer just left the chat: who is that'));
        }));
    });
    describe('updateCandidates', () => {
        it('should delegate to DAO for current joiner', fakeAsync(async() => {
            await dao.set('joinerId', JoinerMocks.INITIAL);
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
            await dao.set('joinerId', JoinerMocks.INITIAL);
            service.observe('joinerId');

            spyOn(dao, 'delete');

            await service.deleteJoiner();

            expect(dao.delete).toHaveBeenCalledWith('joinerId');
        }));
    });
    describe('reviewConfig', () => {
        it('should change part status with DAO', fakeAsync(async() => {
            await dao.set('joinerId', JoinerMocks.INITIAL);
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
            await dao.set('joinerId', JoinerMocks.INITIAL);
            service.observe('joinerId');

            spyOn(dao, 'update');

            await service.reviewConfigRemoveChosenPlayerAndUpdateCandidates(['candidate1']);

            expect(dao.update).toHaveBeenCalledWith('joinerId', {
                partStatus: PartStatus.PART_CREATED.value,
                chosenPlayer: null,
                candidates: ['candidate1'],
            });
        }));
    });
    describe('acceptConfig', () => {
        it('should change part status with DAO', fakeAsync(async() => {
            await dao.set('joinerId', JoinerMocks.INITIAL);
            service.observe('joinerId');

            spyOn(dao, 'update');

            await service.acceptConfig();

            expect(dao.update).toHaveBeenCalledWith('joinerId', {
                partStatus: PartStatus.PART_STARTED.value,
            });
        }));
    });
});
