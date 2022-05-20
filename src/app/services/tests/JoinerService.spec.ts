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
        TestBed.inject(ConnectedUserService).user = MGPOptional.of(UserMocks.CREATOR_AUTH_USER);

        // When creating the initial joiner
        await service.createInitialJoiner('id');

        // Then it should delegate to the DAO and create the initial joiner
        expect(dao.set).toHaveBeenCalledWith('id', JoinerMocks.INITIAL);
    }));
    describe('joinGame', () => {
        it('should not update joiner when called by the creator', fakeAsync(async() => {
            // Given a joiner where we are the creator
            ConnectedUserServiceMock.setUser(UserMocks.CREATOR_AUTH_USER);
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
            ConnectedUserServiceMock.setUser(UserMocks.CANDIDATE_AUTH_USER);
            await dao.set('joinerId', JoinerMocks.INITIAL);
            spyOn(dao, 'addCandidate').and.callThrough();

            // When joining it
            await service.joinGame('joinerId');

            // We should be added to the candidate list
            expect(dao.addCandidate).toHaveBeenCalledWith('joinerId', UserMocks.CANDIDATE_MINIMAL_USER);
        }));
        it('should fail when joining an invalid joiner', fakeAsync(async() => {
            spyOn(dao, 'read').and.resolveTo(MGPOptional.empty());
            ConnectedUserServiceMock.setUser(UserMocks.CANDIDATE_AUTH_USER);
            // When trying to join an invalid joiner
            const result: Promise<MGPValidation> = service.joinGame('invalidJoinerId');
            // Then it should fail
            await expectAsync(result).toBeResolvedTo(MGPValidation.failure('Game does not exist'));
        }));
    });
    describe('cancelJoining', () => {
        it('cancelJoining should throw when there was no observed joiner', fakeAsync(async() => {
            ConnectedUserServiceMock.setUser(UserMocks.CANDIDATE_AUTH_USER);
            // When cancelling on an invalid joiner
            const result: Promise<void> = service.cancelJoining();
            // Then it should throw
            const expectedError: string = 'cannot cancel joining when not observing a joiner';
            await expectAsync(result).toBeRejectedWithError(expectedError);
        }));
        it('should delegate update to DAO', fakeAsync(async() => {
            // Given a joiner that we are observing and that we joined
            ConnectedUserServiceMock.setUser(UserMocks.CANDIDATE_AUTH_USER);
            await dao.set('joinerId', JoinerMocks.INITIAL);
            service.subscribeToChanges('joinerId', (doc: MGPOptional<Joiner>): void => {});
            await service.joinGame('joinerId');

            spyOn(dao, 'removeCandidate');

            // When cancelling our join
            await service.cancelJoining();

            // Then we are removed from the list
            expect(dao.removeCandidate).toHaveBeenCalledWith('joinerId', UserMocks.CANDIDATE_MINIMAL_USER);
        }));
        it('should start as new when chosenPlayer leaves', fakeAsync(async() => {
            // Given a joiner that we are observing, with a chosen player
            ConnectedUserServiceMock.setUser(UserMocks.OPPONENT_AUTH_USER);
            await dao.set('joinerId', JoinerMocks.WITH_CHOSEN_OPPONENT);
            await dao.addCandidate('joinerId', UserMocks.OPPONENT_MINIMAL_USER);
            service.subscribeToChanges('joinerId', (doc: MGPOptional<Joiner>): void => {});

            // When the chosen player leaves
            await service.cancelJoining();

            // Then the joiner is back to the initial one
            const currentJoiner: MGPOptional<Joiner> = await dao.read('joinerId');
            expect(currentJoiner.get()).withContext('should be as new').toEqual(JoinerMocks.INITIAL);
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
        it('should change part status and chosen opponent with DAO', fakeAsync(async() => {
            // Given a joiner that we are observing
            await dao.set('joinerId', JoinerMocks.INITIAL);
            service.subscribeToChanges('joinerId', (doc: MGPOptional<Joiner>): void => {});

            spyOn(dao, 'update');

            // When reviewing the config (because the chosen player left)
            await service.reviewConfigAndRemoveChosenPlayer();

            // Then the part is updated accordingly
            expect(dao.update).toHaveBeenCalledWith('joinerId', {
                partStatus: PartStatus.PART_CREATED.value,
                chosenOpponent: null,
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
    describe('subscribeToCandidates', () => {
        let candidates: MinimalUser[] = [];
        beforeEach(fakeAsync(async() => {
            // Given a joiner for which we are observing the candidates
            await dao.set('joinerId', JoinerMocks.INITIAL);
            service.subscribeToChanges('joinerId', () => {});
            service.subscribeToCandidates('joinerId', (newCandidates: MinimalUser[]) => {
                candidates = newCandidates;
            });
        }));
        it('should see new candidates appear', fakeAsync(async() => {
            ConnectedUserServiceMock.setUser(UserMocks.CANDIDATE_AUTH_USER);
            // When a candidate is added
            await service.joinGame('joinerId');
            // Then the candidate has been seen
            expect(candidates).toEqual([UserMocks.CANDIDATE_MINIMAL_USER]);
        }));
        it('should see removed candidates disappear', fakeAsync(async() => {
            // and given an existing candidate
            ConnectedUserServiceMock.setUser(UserMocks.CANDIDATE_AUTH_USER);
            await service.joinGame('joinerId');
            // When a candidate is removed
            await service.removeCandidate(UserMocks.CANDIDATE_MINIMAL_USER);
            // Then the candidate has been seen
            expect(candidates).toEqual([]);
        }));
        it('should see modified candidates correctly modified', fakeAsync(async() => {
            // and given some existing candidates
            ConnectedUserServiceMock.setUser(UserMocks.CANDIDATE_AUTH_USER);
            await service.joinGame('joinerId');
            ConnectedUserServiceMock.setUser(UserMocks.OPPONENT_AUTH_USER);
            await service.joinGame('joinerId');

            // When a candidate is modified
            // (This should never happen in practice, but we still want the correct behavior just in case)
            await dao.subCollectionDAO('joinerId', 'candidates').update(UserMocks.CANDIDATE_MINIMAL_USER.id, { name: 'foo' });
            expect(candidates).toEqual([{ ...UserMocks.CANDIDATE_MINIMAL_USER, name: 'foo' }, UserMocks.OPPONENT_MINIMAL_USER]);

        }));
    });
});
