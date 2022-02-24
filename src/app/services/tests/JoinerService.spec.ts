/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { JoinerService } from '../JoinerService';
import { JoinerDAO } from 'src/app/dao/JoinerDAO';
import { Joiner, MinimalUser, PartStatus } from 'src/app/domain/Joiner';
import { JoinerDAOMock } from 'src/app/dao/tests/JoinerDAOMock.spec';
import { JoinerMocks } from 'src/app/domain/JoinerMocks.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { UserMocks } from 'src/app/domain/UserMocks.spec';

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
        spyOn(dao, 'read').and.resolveTo(MGPOptional.of(JoinerMocks.WITH_FIRST_CANDIDATE));
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
        it('should fail when called by a candidate already in the game', fakeAsync(async() => {
            // Given a joiner with a first candidate
            await dao.set('joinerId', JoinerMocks.WITH_FIRST_CANDIDATE);
            const candidate: MinimalUser = JoinerMocks.WITH_FIRST_CANDIDATE.candidates[0];

            // When a candidate tries to join the game one more time
            const joinResult: MGPValidation = await service.joinGame('joinerId', candidate);

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
            spyOn(dao, 'update');
            const user: MinimalUser = { id: '8d456r465sd', name: 'some totally new user' };

            await service.joinGame('joinerId', user);

            // We should be added to the candidate list
            expect(dao.update).toHaveBeenCalledWith('joinerId', { candidates: [user] });
        }));
        it('should fail when joining an invalid joiner', fakeAsync(async() => {
            spyOn(dao, 'read').and.resolveTo(MGPOptional.empty());
            // When trying to join an invalid joiner
            // Then it should fail
            const failure: MGPValidation = MGPValidation.failure('Game does not exist');
            await expectAsync(service.joinGame('invalidJoinerId', UserMocks.CREATOR_MINIMAL_USER)).toBeResolvedTo(failure);
        }));
    });
    describe('cancelJoining', () => {
        it('cancelJoining should throw when there was no observed joiner', fakeAsync(async() => {
            // When cancelling on an invalid joiner
            // Then it should throw
            const expectedError: string = 'cannot cancel joining when not observing a joiner';
            const unknown: MinimalUser = { id: 'unknown-doc-id', name: 'who is that' };
            await expectAsync(service.cancelJoining(unknown)).toBeRejectedWithError(expectedError);
        }));
        it('should delegate update to DAO', fakeAsync(async() => {
            // Given a joiner that we are observing and that we joined
            await dao.set('joinerId', JoinerMocks.INITIAL);
            service.subscribeToChanges('joinerId', (doc: MGPOptional<Joiner>): void => {});
            const user: MinimalUser = { id: '7sf857erf87d', name: 'someone totally new' };
            await service.joinGame('joinerId', user);

            spyOn(dao, 'update');

            // When cancelling our join
            await service.cancelJoining(user);

            // Then we are removed from the list
            expect(dao.update).toHaveBeenCalledWith('joinerId', {
                chosenPlayer: null,
                partStatus: PartStatus.PART_CREATED.value,
                candidates: [],
            });
        }));
        it('should start as new when chosenPlayer leaves', fakeAsync(async() => {
            // Given a joiner that we are observing, with a chosen player
            await dao.set('joinerId', JoinerMocks.WITH_CHOSEN_OPPONENT);
            service.subscribeToChanges('joinerId', (doc: MGPOptional<Joiner>): void => {});

            // When the chosen player leaves
            await service.cancelJoining(UserMocks.FIRST_CANDIDATE_MINIMAL_USER);

            // Then the joiner is back to the initial one
            const currentJoiner: MGPOptional<Joiner> = await dao.read('joinerId');
            expect(currentJoiner.get()).withContext('should be as new').toEqual(JoinerMocks.INITIAL);
        }));
        it('should throw when called by someone who is nor candidate nor chosenPlayer', fakeAsync(async() => {
            // Given a joiner that we are observing and that we joined
            await dao.set('joinerId', JoinerMocks.INITIAL);
            service.subscribeToChanges('joinerId', (doc: MGPOptional<Joiner>): void => {});
            await service.joinGame('joinerId', { id: 's577f8e79', name: 'whoever' });

            // When cancelling the join of a non-candidate
            // Then it should throw an error
            const error: string = 'someone that was not candidate nor chosenPlayer just left the chat: who is that';
            const unknown: MinimalUser = { id: 'unknown-doc-id', name: 'who is that' };
            await expectAsync(service.cancelJoining(unknown)).toBeRejectedWithError(error);
        }));
    });
    describe('updateCandidates', () => {
        it('should delegate to DAO for current joiner', fakeAsync(async() => {
            // Given a joiner that we are observing
            await dao.set('joinerId', JoinerMocks.INITIAL);
            service.subscribeToChanges('joinerId', (doc: MGPOptional<Joiner>): void => {});

            spyOn(dao, 'update');

            // When updating the candidates
            const candidates: MinimalUser[] = [
                { id: 'odfpkerpo', name: 'candidate1' },
                { id: 'irfjoerif', name: 'candidate2' },
            ];

            await service.updateCandidates(candidates);

            // Then the candidate list is updated through the DAO
            expect(dao.update).toHaveBeenCalledWith('joinerId', {
                candidates,
            });
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
    describe('reviewConfigRemoveChosenPlayerAndUpdateCandidates', () => {
        it('should change part status, chosen player and candidates with DAO', fakeAsync(async() => {
            // Given a joiner that we are observing
            await dao.set('joinerId', JoinerMocks.INITIAL);
            service.subscribeToChanges('joinerId', (doc: MGPOptional<Joiner>): void => {});

            spyOn(dao, 'update');

            // When reviewing the config (because the chosen player left)
            const candidates: MinimalUser[] = [{ id: 'candidate-doc-id', name: 'candidate1' }];
            await service.reviewConfigAndRemoveChosenPlayerAndUpdateCandidates(candidates);

            // Then the part is updated accordingly
            expect(dao.update).toHaveBeenCalledWith('joinerId', {
                partStatus: PartStatus.PART_CREATED.value,
                chosenPlayer: null,
                candidates,
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
