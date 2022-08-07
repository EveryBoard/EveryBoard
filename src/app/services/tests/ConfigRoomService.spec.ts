/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed } from '@angular/core/testing';
import { ConfigRoomService } from '../ConfigRoomService';
import { ConfigRoomDAO } from 'src/app/dao/ConfigRoomDAO';
import { ConfigRoom, PartStatus } from 'src/app/domain/ConfigRoom';
import { ConfigRoomDAOMock } from 'src/app/dao/tests/ConfigRoomDAOMock.spec';
import { ConfigRoomMocks } from 'src/app/domain/ConfigRoomMocks.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { UserMocks } from 'src/app/domain/UserMocks.spec';
import { MinimalUser } from 'src/app/domain/MinimalUser';
import { ConnectedUserService } from '../ConnectedUserService';
import { ConnectedUserServiceMock } from './ConnectedUserService.spec';
import { RouterTestingModule } from '@angular/router/testing';
import { BlankComponent } from 'src/app/utils/tests/TestUtils.spec';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ConfigRoomService', () => {

    let dao: ConfigRoomDAO;

    let service: ConfigRoomService;

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
                { provide: ConfigRoomDAO, useClass: ConfigRoomDAOMock },

            ],
        }).compileComponents();
        dao = TestBed.inject(ConfigRoomDAO);
        service = TestBed.inject(ConfigRoomService);
    }));
    it('should create', fakeAsync(() => {
        expect(service).toBeTruthy();
    }));
    it('read should be delegated to ConfigRoomDAO', fakeAsync(async() => {
        // Given a ConfigRoomService
        spyOn(dao, 'read').and.resolveTo(MGPOptional.of(ConfigRoomMocks.INITIAL));
        // When reading a config Room
        await service.readConfigRoomById('myConfigRoomId');
        // Then it should delegate to the DAO
        expect(dao.read).toHaveBeenCalledOnceWith('myConfigRoomId');
    }));
    it('set should be delegated to ConfigRoomDAO', fakeAsync(async() => {
        // Given a ConfigRoomService
        spyOn(dao, 'set').and.resolveTo();
        // When setting the configRoom
        await service.set('partId', ConfigRoomMocks.INITIAL);
        // Then it should delegate to the DAO
        expect(dao.set).toHaveBeenCalledOnceWith('partId', ConfigRoomMocks.INITIAL);
    }));
    it('update should delegated to ConfigRoomDAO', fakeAsync(async() => {
        // Given a ConfigRoomService
        spyOn(dao, 'update').and.resolveTo();
        // When updating a configRoom
        await service.updateConfigRoomById('partId', ConfigRoomMocks.INITIAL);
        // Then it should delegate to the DAO
        expect(dao.update).toHaveBeenCalledOnceWith('partId', ConfigRoomMocks.INITIAL);
    }));
    it('createInitialConfigRoom should delegate to the DAO set method', fakeAsync(async() => {
        // Given a ConfigRoomService
        spyOn(dao, 'set').and.resolveTo();
        TestBed.inject(ConnectedUserService).user = MGPOptional.of(UserMocks.CREATOR_AUTH_USER);

        // When creating the initial configRoom
        await service.createInitialConfigRoom('id');

        // Then it should delegate to the DAO and create the initial configRoom
        expect(dao.set).toHaveBeenCalledOnceWith('id', ConfigRoomMocks.INITIAL);
    }));
    describe('joinGame', () => {
        it('should not update configRoom when called by the creator', fakeAsync(async() => {
            // Given a configRoom where we are the creator
            ConnectedUserServiceMock.setUser(UserMocks.CREATOR_AUTH_USER);
            await dao.set('configRoomId', ConfigRoomMocks.INITIAL);
            spyOn(dao, 'update').and.callThrough();
            expect(dao.update).not.toHaveBeenCalled();

            // When joining it
            await service.joinGame('configRoomId');

            // Then it should not update the configRoom, and the configRoom is still the initial one
            expect(dao.update).not.toHaveBeenCalled();
            const resultingConfigRoom: ConfigRoom = (await dao.read('configRoomId')).get();
            expect(resultingConfigRoom).toEqual(ConfigRoomMocks.INITIAL);
        }));
        it('should be delegated to ConfigRoomDAO', fakeAsync(async() => {
            // Given a configRoom
            ConnectedUserServiceMock.setUser(UserMocks.CANDIDATE_AUTH_USER);
            await dao.set('configRoomId', ConfigRoomMocks.INITIAL);
            spyOn(dao, 'addCandidate').and.callThrough();

            // When joining it
            await service.joinGame('configRoomId');

            // We should be added to the candidate list
            expect(dao.addCandidate).toHaveBeenCalledOnceWith('configRoomId', UserMocks.CANDIDATE_MINIMAL_USER);
        }));
        it('should fail when joining an unexisting configRoom', fakeAsync(async() => {
            spyOn(dao, 'read').and.resolveTo(MGPOptional.empty());
            ConnectedUserServiceMock.setUser(UserMocks.CANDIDATE_AUTH_USER);
            // When trying to join an invalid configRoom
            const result: Promise<MGPValidation> = service.joinGame('unexistingConfigRoomId');
            // Then it should fail
            await expectAsync(result).toBeResolvedTo(MGPValidation.failure('Game does not exist'));
        }));
    });
    describe('cancelJoining', () => {
        it('cancelJoining should throw when there was no observed configRoom', fakeAsync(async() => {
            ConnectedUserServiceMock.setUser(UserMocks.CANDIDATE_AUTH_USER);
            // When cancelling on an invalid configRoom
            const result: Promise<void> = service.cancelJoining();
            // Then it should throw
            const expectedError: string = 'cannot cancel joining when not observing a configRoom';
            await expectAsync(result).toBeRejectedWithError(expectedError);
        }));
        it('should delegate update to DAO', fakeAsync(async() => {
            // Given a configRoom that we are observing and that we joined
            ConnectedUserServiceMock.setUser(UserMocks.CANDIDATE_AUTH_USER);
            await dao.set('configRoomId', ConfigRoomMocks.INITIAL);
            service.subscribeToChanges('configRoomId', (doc: MGPOptional<ConfigRoom>): void => {});
            await service.joinGame('configRoomId');

            spyOn(dao, 'removeCandidate').and.resolveTo();

            // When cancelling our join
            await service.cancelJoining();

            // Then we are removed from the list
            expect(dao.removeCandidate).toHaveBeenCalledOnceWith('configRoomId', UserMocks.CANDIDATE_MINIMAL_USER);
        }));
        it('should start as new when chosen opponent leaves', fakeAsync(async() => {
            // Given a configRoom that we are observing, with a chosen opponent
            ConnectedUserServiceMock.setUser(UserMocks.OPPONENT_AUTH_USER);
            await dao.set('configRoomId', ConfigRoomMocks.WITH_CHOSEN_OPPONENT);
            await dao.addCandidate('configRoomId', UserMocks.OPPONENT_MINIMAL_USER);
            service.subscribeToChanges('configRoomId', (doc: MGPOptional<ConfigRoom>): void => {});

            // When the chosen opponent leaves
            await service.cancelJoining();

            // Then the configRoom is back to the initial one
            const currentConfigRoom: MGPOptional<ConfigRoom> = await dao.read('configRoomId');
            expect(currentConfigRoom.get()).withContext('should be as new').toEqual(ConfigRoomMocks.INITIAL);
        }));
    });
    describe('deleteConfigRoom', () => {
        it('should delegate deletion to DAO', fakeAsync(async() => {
            // Given a configRoom that we are observing
            await dao.set('configRoomId', ConfigRoomMocks.INITIAL);
            service.subscribeToChanges('configRoomId', (doc: MGPOptional<ConfigRoom>): void => {});

            spyOn(dao, 'delete').and.resolveTo();

            // When we delete it
            await service.deleteConfigRoom([]);

            // Then it is deleted in the DAO
            expect(dao.delete).toHaveBeenCalledOnceWith('configRoomId');
        }));
        it('should delete candidates as well', fakeAsync(async() => {
            // Given a configRoom that we are observing, which has candidates
            await dao.set('configRoomId', ConfigRoomMocks.INITIAL);
            service.subscribeToChanges('configRoomId', (doc: MGPOptional<ConfigRoom>): void => {});
            await dao.addCandidate('partId', UserMocks.CANDIDATE_MINIMAL_USER);

            spyOn(dao, 'removeCandidate').and.resolveTo();

            // When we delete it
            await service.deleteConfigRoom([UserMocks.CANDIDATE_MINIMAL_USER]);

            // Then the candidate docs are also deleted in the DAO
            expect(dao.removeCandidate).toHaveBeenCalledOnceWith('configRoomId', UserMocks.CANDIDATE_MINIMAL_USER);
        }));
    });
    describe('reviewConfig', () => {
        it('should change part status with DAO', fakeAsync(async() => {
            // Given a configRoom that we are observing
            await dao.set('configRoomId', ConfigRoomMocks.INITIAL);
            service.subscribeToChanges('configRoomId', (doc: MGPOptional<ConfigRoom>): void => {});

            spyOn(dao, 'update').and.resolveTo();

            // When reviewing the config
            await service.reviewConfig();

            // Then the part goes back to creation status
            expect(dao.update).toHaveBeenCalledOnceWith('configRoomId', {
                partStatus: PartStatus.PART_CREATED.value,
            });
        }));
    });
    describe('reviewConfigAndRemoveChosenOpponent', () => {
        it('should change part status and chosen opponent with DAO', fakeAsync(async() => {
            // Given a configRoom that we are observing
            await dao.set('configRoomId', ConfigRoomMocks.INITIAL);
            service.subscribeToChanges('configRoomId', (doc: MGPOptional<ConfigRoom>): void => {});

            spyOn(dao, 'update').and.resolveTo();

            // When reviewing the config (because the chosen opponent left)
            await service.reviewConfigAndRemoveChosenOpponent();

            // Then the part is updated accordingly
            expect(dao.update).toHaveBeenCalledOnceWith('configRoomId', {
                partStatus: PartStatus.PART_CREATED.value,
                chosenOpponent: null,
            });
        }));
    });
    describe('acceptConfig', () => {
        it('should change part status with DAO to start it', fakeAsync(async() => {
            // Given a configRoom that we are observing
            await dao.set('configRoomId', ConfigRoomMocks.INITIAL);
            service.subscribeToChanges('configRoomId', (doc: MGPOptional<ConfigRoom>): void => {});

            spyOn(dao, 'update').and.resolveTo();

            // When accepting the config
            await service.acceptConfig();

            // Then the part is updated to the STARTED status
            expect(dao.update).toHaveBeenCalledOnceWith('configRoomId', {
                partStatus: PartStatus.PART_STARTED.value,
            });
        }));
    });
    describe('subscribeToCandidates', () => {
        let candidates: MinimalUser[] = [];
        beforeEach(fakeAsync(async() => {
            // Given a configRoom for which we are observing the candidates
            await dao.set('configRoomId', ConfigRoomMocks.INITIAL);
            service.subscribeToChanges('configRoomId', () => {});
            service.subscribeToCandidates('configRoomId', (newCandidates: MinimalUser[]) => {
                candidates = newCandidates;
            });
        }));
        it('should see new candidates appear', fakeAsync(async() => {
            ConnectedUserServiceMock.setUser(UserMocks.CANDIDATE_AUTH_USER);
            // When a candidate is added
            await service.joinGame('configRoomId');
            // Then the candidate has been seen
            expect(candidates).toEqual([UserMocks.CANDIDATE_MINIMAL_USER]);
        }));
        it('should see removed candidates disappear', fakeAsync(async() => {
            // and given an existing candidate
            ConnectedUserServiceMock.setUser(UserMocks.CANDIDATE_AUTH_USER);
            await service.joinGame('configRoomId');
            // When a candidate is removed
            await service.removeCandidate(UserMocks.CANDIDATE_MINIMAL_USER);
            // Then the candidate has been seen
            expect(candidates).toEqual([]);
        }));
        it('should see modified candidates correctly modified', fakeAsync(async() => {
            // and given some existing candidates
            ConnectedUserServiceMock.setUser(UserMocks.CANDIDATE_AUTH_USER);
            await service.joinGame('configRoomId');
            ConnectedUserServiceMock.setUser(UserMocks.OPPONENT_AUTH_USER);
            await service.joinGame('configRoomId');

            // When a candidate is modified
            // (This should never happen in practice, but we still want the correct behavior just in case)
            await dao.subCollectionDAO('configRoomId', 'candidates').update(UserMocks.CANDIDATE_MINIMAL_USER.id, { name: 'foo' });
            expect(candidates).toEqual([{ ...UserMocks.CANDIDATE_MINIMAL_USER, name: 'foo' }, UserMocks.OPPONENT_MINIMAL_USER]);

        }));
    });
});
