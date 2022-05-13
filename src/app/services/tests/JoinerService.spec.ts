/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { JoinerService } from '../JoinerService';
import { JoinerDAO } from 'src/app/dao/JoinerDAO';
import { Joiner, PartStatus } from 'src/app/domain/Joiner';
import { JoinerDAOMock } from 'src/app/dao/tests/JoinerDAOMock.spec';
import { JoinerMocks } from 'src/app/domain/JoinerMocks.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { UserMocks } from 'src/app/domain/UserMocks.spec';
import { MinimalUser } from 'src/app/domain/MinimalUser';
import { Utils } from 'src/app/utils/utils';

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
        // Given a JoinerService
        spyOn(dao, 'read').and.resolveTo(MGPOptional.of(JoinerMocks.INITIAL));
        // When reading a joiner
        await service.readJoinerById('myJoinerId');
        // Then it should delegate to the DAO
        expect(dao.read).toHaveBeenCalledWith('myJoinerId');
    }));
    it('set should be delegated to JoinerDAO', fakeAsync(async() => {
        // Given a JoinerService
        spyOn(dao, 'set');
        // When setting the joiner
        await service.set('partId', JoinerMocks.INITIAL);
        // Then it should delegate to the DAO
        expect(dao.set).toHaveBeenCalledWith('partId', JoinerMocks.INITIAL);
    }));
    it('update should delegated to JoinerDAO', fakeAsync(async() => {
        // Given a JoinerService
        spyOn(dao, 'update');
        // When updating a joiner
        await service.updateJoinerById('partId', JoinerMocks.INITIAL);
        // Then it should delegate to the DAO
        expect(dao.update).toHaveBeenCalledWith('partId', JoinerMocks.INITIAL);
    }));
    it('createInitialJoiner should delegate to the DAO set method', fakeAsync(async() => {
        // Given a JoinerService
        spyOn(dao, 'set');
        // When creating the initial joiner
        await service.createInitialJoiner(UserMocks.CREATOR_MINIMAL_USER, 'id');
        // Then it should delegate to the DAO and create the initial joiner
        expect(dao.set).toHaveBeenCalledWith('id', JoinerMocks.INITIAL);
    }));
    describe('joinGame', () => {
        // TODO FOR REVIEW: test disabled because now you cannot have duplicate candidates
        // If you try to join the game a second time, you will not be added a second time to the candidate list
        // Can we remove this test?
        xit('should fail when called by a candidate already in the game', fakeAsync(async() => {
            // Given a joiner with a first candidate
            const joinerId: string = 'joinerId';
            await dao.set(joinerId, JoinerMocks.INITIAL);
            const candidate: MinimalUser = { id: 'firstCandidateId', name: 'firstCandidate' };
            await dao.addCandidate(joinerId, candidate);

            // When a candidate tries to join the game one more time
            const joinResult: MGPValidation = await service.joinGame(joinerId, candidate);

            // Then it should fail
            expect(joinResult.isFailure()).toBeTrue();
            expect(joinResult.getReason()).toBe('User already in the game');
        }));
        it('should not update joiner when called by the creator', fakeAsync(async() => {
            // Given a joiner where we are the creator
            await dao.set('joinerId', JoinerMocks.INITIAL);
            spyOn(dao, 'update').and.callThrough();
            expect(dao.update).not.toHaveBeenCalled();

            // When joining it
            await service.joinGame('joinerId', JoinerMocks.INITIAL.creator);

            // Then it should not update the joiner, and the joiner is still the initial one
            expect(dao.update).not.toHaveBeenCalled();
            const resultingJoiner: Joiner = (await dao.read('joinerId')).get();
            expect(resultingJoiner).toEqual(JoinerMocks.INITIAL);
        }));
        it('should be delegated to JoinerDAO', fakeAsync(async() => {
            // Given a joiner
            await dao.set('joinerId', JoinerMocks.INITIAL);
            spyOn(dao, 'addCandidate').and.callThrough();

            // When joining it
            const user: MinimalUser = { id: 'userId', name: 'some totally new user' };
            await service.joinGame('joinerId', user);

            // We should be added to the candidate list
            expect(dao.addCandidate).toHaveBeenCalledWith('joinerId', user);
        }));
        it('should fail when joining an invalid joiner', fakeAsync(async() => {
            spyOn(dao, 'read').and.resolveTo(MGPOptional.empty());
            // When trying to join an invalid joiner
            const user: MinimalUser = { id: 'userId', name: 'some-user' };
            const result: Promise<MGPValidation> = service.joinGame('invalidJoinerId', user);
            // Then it should fail
            await expectAsync(result).toBeResolvedTo(MGPValidation.failure('Game does not exist'));
        }));
    });
    describe('cancelJoining', () => {
        it('cancelJoining should throw when there was no observed joiner', fakeAsync(async() => {
            // When cancelling on an invalid joiner
            const user: MinimalUser = { id: 'whoever', name: 'whoever' };
            const result: Promise<void> = service.cancelJoining(user);
            // Then it should throw
            const expectedError: string = 'cannot cancel joining when not observing a joiner';
            await expectAsync(result).toBeRejectedWithError(expectedError);
        }));
        it('should delegate update to DAO', fakeAsync(async() => {
            // Given a joiner that we are observing and that we joined
            await dao.set('joinerId', JoinerMocks.INITIAL);
            const user: MinimalUser = { id: 'userId', name: 'someone totally new' };
            service.subscribeToChanges('joinerId', (doc: MGPOptional<Joiner>): void => {});
            await service.joinGame('joinerId', user);

            spyOn(dao, 'removeCandidate');

            // When cancelling our join
            await service.cancelJoining(user);

            // Then we are removed from the list
            expect(dao.removeCandidate).toHaveBeenCalledWith('joinerId', user);
        }));
        it('should start as new when chosenPlayer leaves', fakeAsync(async() => {
            // Given a joiner that we are observing, with a chosen player
            await dao.set('joinerId', JoinerMocks.WITH_CHOSEN_PLAYER);
            const chosenPlayer: MinimalUser = {
                id: 'chosenPlayer',
                name: Utils.getNonNullable(JoinerMocks.WITH_CHOSEN_PLAYER.chosenPlayer),
            };
            await dao.addCandidate('joinerId', chosenPlayer);
            service.subscribeToChanges('joinerId', (doc: MGPOptional<Joiner>): void => {});

            // When the chosen player leaves
            await service.cancelJoining(chosenPlayer);

            // Then the joiner is back to the initial one
            const currentJoiner: MGPOptional<Joiner> = await dao.read('joinerId');
            expect(currentJoiner.get()).withContext('should be as new').toEqual(JoinerMocks.INITIAL);
        }));
        // TODO: this should become impossible
        xit('should throw when called by someone who is nor candidate nor chosenPlayer', fakeAsync(async() => {
            // Given a joiner that we are observing and that we joined
            await dao.set('joinerId', JoinerMocks.INITIAL);
            service.subscribeToChanges('joinerId', (doc: MGPOptional<Joiner>): void => {});
            const user: MinimalUser = { id: 'userId', name: 'whoever' };
            await service.joinGame('joinerId', user);

            // When cancelling the join of a non-candidate
            const otherUser: MinimalUser = { id: 'otherUserId', name: 'who is that' };
            const result: Promise<void> = service.cancelJoining(otherUser);
            // Then it should throw an error
            const error: string = 'someone that was not candidate nor chosenPlayer just left the chat: who is that';
            await expectAsync(result).toBeRejectedWithError(error);
        }));
    });
    describe('deleteJoiner', () => {
        it('should delegate deletion to DAO', fakeAsync(async() => {
            // Given a joiner that we are observing
            await dao.set('joinerId', JoinerMocks.INITIAL);
            service.subscribeToChanges('joinerId', (doc: MGPOptional<Joiner>): void => {});

            spyOn(dao, 'delete');

            // When we delete it
            await service.deleteJoiner();

            // Then it is deleted in the DAO
            expect(dao.delete).toHaveBeenCalledWith('joinerId');
        }));
    });
    describe('reviewConfig', () => {
        it('should change part status with DAO', fakeAsync(async() => {
            // Given a joiner that we are observing
            await dao.set('joinerId', JoinerMocks.INITIAL);
            service.subscribeToChanges('joinerId', (doc: MGPOptional<Joiner>): void => {});

            spyOn(dao, 'update');

            // When reviewing the config
            await service.reviewConfig();

            // Then the part goes back to creation status
            expect(dao.update).toHaveBeenCalledWith('joinerId', {
                partStatus: PartStatus.PART_CREATED.value,
            });
        }));
    });
    describe('reviewConfigAndRemoveChosenPlayer', () => {
        it('should change part status, chosen player and candidates with DAO', fakeAsync(async() => {
            // Given a joiner that we are observing
            await dao.set('joinerId', JoinerMocks.INITIAL);
            service.subscribeToChanges('joinerId', (doc: MGPOptional<Joiner>): void => {});

            spyOn(dao, 'update');

            // When reviewing the config (because the chosen player left)
            await service.reviewConfigAndRemoveChosenPlayer();

            // Then the part is updated accordingly
            expect(dao.update).toHaveBeenCalledWith('joinerId', {
                partStatus: PartStatus.PART_CREATED.value,
                chosenPlayer: null,
            });
        }));
    });
    describe('acceptConfig', () => {
        it('should change part status with DAO to start it', fakeAsync(async() => {
            // Given a joiner that we are observing
            await dao.set('joinerId', JoinerMocks.INITIAL);
            service.subscribeToChanges('joinerId', (doc: MGPOptional<Joiner>): void => {});

            spyOn(dao, 'update');

            // When accepting the config
            await service.acceptConfig();

            // Then the part is updated to the STARTED status
            expect(dao.update).toHaveBeenCalledWith('joinerId', {
                partStatus: PartStatus.PART_STARTED.value,
            });
        }));
    });
});
