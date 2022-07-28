/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed } from '@angular/core/testing';
import { JoinerService } from '../JoinerService';
import { JoinerDAO } from 'src/app/dao/JoinerDAO';
import { Joiner, PartStatus } from 'src/app/domain/Joiner';
import { JoinerDAOMock } from 'src/app/dao/tests/JoinerDAOMock.spec';
import { JoinerMocks } from 'src/app/domain/JoinerMocks.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { UserMocks } from 'src/app/domain/UserMocks.spec';
import { MinimalUser } from 'src/app/domain/MinimalUser';
import { ConnectedUserService } from '../ConnectedUserService';
import { ConnectedUserServiceMock } from './ConnectedUserService.spec';
import { RouterTestingModule } from '@angular/router/testing';
import { BlankComponent } from 'src/app/utils/tests/TestUtils.spec';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ErrorLoggerService } from '../ErrorLoggerService';
import { ErrorLoggerServiceMock } from './ErrorLoggerServiceMock.spec';

describe('JoinerService', () => {

    let dao: JoinerDAO;

    let service: JoinerService;

    beforeEach(fakeAsync(async() => {
        await TestBed.configureTestingModule({
            imports: [
                RouterTestingModule.withRoutes([
                    { path: '**', component: BlankComponent },
                ]),
                BrowserAnimationsModule,
            ],
            providers: [
                { provide: ConnectedUserService, useClass: ConnectedUserServiceMock },
                { provide: JoinerDAO, useClass: JoinerDAOMock },

            ],
        }).compileComponents();
        dao = TestBed.inject(JoinerDAO);
        service = TestBed.inject(JoinerService);
    }));
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
        spyOn(dao, 'set').and.callThrough();
        // When setting the joiner
        await service.set('partId', JoinerMocks.INITIAL);
        // Then it should delegate to the DAO
        expect(dao.set).toHaveBeenCalledWith('partId', JoinerMocks.INITIAL);
    }));
    it('update should delegated to JoinerDAO', fakeAsync(async() => {
        // Given a JoinerService
        spyOn(dao, 'update').and.resolveTo();
        // When updating a joiner
        await service.updateJoinerById('partId', JoinerMocks.INITIAL);
        // Then it should delegate to the DAO
        expect(dao.update).toHaveBeenCalledWith('partId', JoinerMocks.INITIAL);
    }));
    it('createInitialJoiner should delegate to the DAO set method', fakeAsync(async() => {
        // Given a JoinerService
        spyOn(dao, 'set').and.callThrough();

        // When creating the initial joiner
        await service.createInitialJoiner(UserMocks.CREATOR_MINIMAL_USER, 'id');

        // Then it should delegate to the DAO and create the initial joiner
        expect(dao.set).toHaveBeenCalledWith('id', JoinerMocks.INITIAL);
    }));
    describe('joinGame', () => {
        it('should succeed when called while already in the game', fakeAsync(async() => {
            // Given a logged user and a joiner where logged user is first candidate
            await dao.set('joinerId', JoinerMocks.WITH_FIRST_CANDIDATE);
            // TODO FOR REVIEW: how do me make clear that WITH_FIRST_CANDIDATE's first candidate is OPPONENT_AUTH_USER ?
            ConnectedUserServiceMock.setUser(UserMocks.OPPONENT_AUTH_USER);

            // When calling joinGame to join the game one more time
            const joinResult: MGPValidation = await service.joinGame('joinerId');

            // Then it should succeed
            expect(joinResult.isSuccess()).toBeTrue();
        }));
        it('should not update joiner when called by the creator', fakeAsync(async() => {
            // Given a joiner where we are the creator
            ConnectedUserServiceMock.setUser(UserMocks.CREATOR_AUTH_USER);
            // JoinerMocks.INITIAL.creator
            await dao.set('joinerId', JoinerMocks.INITIAL);
            spyOn(dao, 'update').and.callThrough();
            expect(dao.update).not.toHaveBeenCalled();

            // When joining it
            await service.joinGame('joinerId');

            // Then it should not update the joiner, and the joiner is still the initial one
            expect(dao.update).not.toHaveBeenCalled();
            const resultingJoiner: Joiner = (await dao.read('joinerId')).get();
            expect(resultingJoiner).toEqual(JoinerMocks.INITIAL);
        }));
        it('should be delegated to JoinerDAO', fakeAsync(async() => {
            // Given a joiner
            await dao.set('joinerId', JoinerMocks.INITIAL);
            spyOn(dao, 'update').and.callThrough();
            ConnectedUserServiceMock.setUser(UserMocks.OPPONENT_AUTH_USER);
            const user: MinimalUser = UserMocks.OPPONENT_MINIMAL_USER;

            await service.joinGame('joinerId');

            // We should be added to the candidate list
            expect(dao.update).toHaveBeenCalledWith('joinerId', { candidates: [user] });
        }));
        it('should fail when joining an invalid joiner', fakeAsync(async() => {
            ConnectedUserServiceMock.setUser(UserMocks.OPPONENT_AUTH_USER);
            spyOn(dao, 'read').and.resolveTo(MGPOptional.empty());
            // When trying to join an invalid joiner
            // Then it should fail
            const failure: MGPValidation = MGPValidation.failure('Game does not exist');
            await expectAsync(service.joinGame('invalidJoinerId')).toBeResolvedTo(failure);
        }));
    });
    describe('cancelJoining', () => {
        it('cancelJoining should throw when there was no observed joiner', fakeAsync(async() => {
            // Given no current User
            // When cancelling joining (should not happend, it's a defensive check)
            // Then it should throw
            const expectedError: string = 'cannot cancel joining when not observing a joiner';
            await expectAsync(service.cancelJoining()).toBeRejectedWithError(expectedError);
        }));
        it('should delegate update to DAO', fakeAsync(async() => {
            // Given a joiner that we are observing and that we joined
            await dao.set('joinerId', JoinerMocks.WITH_CHOSEN_OPPONENT);
            service.subscribeToChanges('joinerId', (doc: MGPOptional<Joiner>): void => {});
            ConnectedUserServiceMock.setUser(UserMocks.OPPONENT_AUTH_USER);
            await service.joinGame('joinerId');

            spyOn(dao, 'update').and.callThrough();

            // When cancelling our join
            await service.cancelJoining();

            // Then we are removed from the list
            expect(dao.update).toHaveBeenCalledWith('joinerId', {
                chosenOpponent: null,
                partStatus: PartStatus.PART_CREATED.value,
                candidates: [],
            });
        }));
        it('should start as new when ChosenOpponent leaves', fakeAsync(async() => {
            // Given a joiner that we are observing as the ChosenOpponent
            await dao.set('joinerId', JoinerMocks.WITH_CHOSEN_OPPONENT);
            service.subscribeToChanges('joinerId', (doc: MGPOptional<Joiner>): void => {});
            ConnectedUserServiceMock.setUser(UserMocks.OPPONENT_AUTH_USER);

            // When the ChosenOpponent leaves
            await service.cancelJoining();

            // Then the joiner is back to the initial one
            const currentJoiner: MGPOptional<Joiner> = await dao.read('joinerId');
            expect(currentJoiner.get()).withContext('should be as new').toEqual(JoinerMocks.INITIAL);
        }));
        it('should remove yourself when leaving the room', fakeAsync(async() => {
            // Given a joiner that we are observing as a candidate
            await dao.set('joinerId', JoinerMocks.WITH_TWO_CANDIDATES);
            service.subscribeToChanges('joinerId', (doc: MGPOptional<Joiner>): void => {});
            ConnectedUserServiceMock.setUser(UserMocks.OTHER_OPPONENT_AUTH_USER);

            // When the ChosenOpponent leaves
            await service.cancelJoining();

            // Then the joiner is back to the initial one
            const currentJoiner: MGPOptional<Joiner> = await dao.read('joinerId');
            expect(currentJoiner.get()).withContext('should be as new').toEqual(JoinerMocks.WITH_FIRST_CANDIDATE);
        }));
        it('should throw when called by creator (or user absent from the room)', fakeAsync(async() => {
            // Given a joiner that we are not observing or creating and that we did not joined
            spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
            await dao.set('joinerId', JoinerMocks.INITIAL);
            ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
            service.subscribeToChanges('joinerId', (doc: MGPOptional<Joiner>): void => {});
            await service.joinGame('joinerId');

            // When calling cancelJoining
            // Then it should throw an error
            const error: string = 'someone that was not candidate (probably creator) just left the chat: ' + UserMocks.CONNECTED_AUTH_USER.username.get();
            await expectAsync(service.cancelJoining()).toBeRejectedWithError('Assertion failure: ' + error);
        }));
    });
    describe('updateCandidates', () => {
        it('should delegate to DAO for current joiner', fakeAsync(async() => {
            // Given a joiner that we are observing
            await dao.set('joinerId', JoinerMocks.INITIAL);
            service.subscribeToChanges('joinerId', (doc: MGPOptional<Joiner>): void => {});

            spyOn(dao, 'update').and.callThrough();

            // When updating the candidates
            const candidates: MinimalUser[] = [
                UserMocks.CANDIDATE_MINIMAL_USER,
                UserMocks.OPPONENT_MINIMAL_USER,
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

            spyOn(dao, 'delete').and.callThrough();

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

            spyOn(dao, 'update').and.callThrough();

            // When reviewing the config
            await service.reviewConfig();

            // Then the part goes back to creation status
            expect(dao.update).toHaveBeenCalledWith('joinerId', {
                partStatus: PartStatus.PART_CREATED.value,
            });
        }));
    });
    describe('reviewConfigRemoveChosenOpponentAndUpdateCandidates', () => {
        it('should change part status, ChosenOpponent and candidates with DAO', fakeAsync(async() => {
            // Given a joiner that we are observing
            await dao.set('joinerId', JoinerMocks.INITIAL);
            service.subscribeToChanges('joinerId', (doc: MGPOptional<Joiner>): void => {});

            spyOn(dao, 'update').and.callThrough();

            // When reviewing the config (because the ChosenOpponent left)
            const candidates: MinimalUser[] = [{ id: 'candidate-doc-id', name: 'candidate1' }];
            await service.reviewConfigAndRemoveChosenOpponentAndUpdateCandidates(candidates);

            // Then the part is updated accordingly
            expect(dao.update).toHaveBeenCalledWith('joinerId', {
                partStatus: PartStatus.PART_CREATED.value,
                chosenOpponent: null,
                candidates,
            });
        }));
    });
    describe('acceptConfig', () => {
        it('should change part status with DAO to start it', fakeAsync(async() => {
            // Given a joiner that we are observing
            await dao.set('joinerId', JoinerMocks.INITIAL);
            service.subscribeToChanges('joinerId', (doc: MGPOptional<Joiner>): void => {});

            spyOn(dao, 'update').and.callThrough();

            // When accepting the config
            await service.acceptConfig();

            // Then the part is updated to the STARTED status
            expect(dao.update).toHaveBeenCalledWith('joinerId', {
                partStatus: PartStatus.PART_STARTED.value,
            });
        }));
    });
});
