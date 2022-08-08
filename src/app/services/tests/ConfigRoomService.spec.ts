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

    let configRoomDAO: ConfigRoomDAO;

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
        configRoomDAO = TestBed.inject(ConfigRoomDAO);
        service = TestBed.inject(ConfigRoomService);
    }));
    it('should create', fakeAsync(() => {
        expect(service).toBeTruthy();
    }));
    it('read should be delegated to ConfigRoomDAO', fakeAsync(async() => {
        // Given a ConfigRoomService
        spyOn(configRoomDAO, 'read').and.resolveTo(MGPOptional.of(ConfigRoomMocks.INITIAL));
        // When reading a config Room
        await service.readConfigRoomById('myConfigRoomId');
        // Then it should delegate to the DAO
        expect(configRoomDAO.read).toHaveBeenCalledOnceWith('myConfigRoomId');
    }));
    it('set should be delegated to ConfigRoomDAO', fakeAsync(async() => {
        // Given a ConfigRoomService
        spyOn(configRoomDAO, 'set').and.resolveTo();
        // When setting the configRoom
        await configRoomDAO.set('partId', ConfigRoomMocks.INITIAL);
        // Then it should delegate to the DAO
        expect(configRoomDAO.set).toHaveBeenCalledOnceWith('partId', ConfigRoomMocks.INITIAL);
    }));
    it('createInitialConfigRoom should delegate to the DAO set method', fakeAsync(async() => {
        // Given a ConfigRoomService
        spyOn(configRoomDAO, 'set').and.resolveTo();
        TestBed.inject(ConnectedUserService).user = MGPOptional.of(UserMocks.CREATOR_AUTH_USER);

        // When creating the initial configRoom
        await service.createInitialConfigRoom('id');

        // Then it should delegate to the DAO and create the initial configRoom
        expect(configRoomDAO.set).toHaveBeenCalledOnceWith('id', ConfigRoomMocks.INITIAL);
    }));
    describe('joinGame', () => {
        it('should not update configRoom when called by the creator', fakeAsync(async() => {
            // Given a configRoom where we are the creator
            ConnectedUserServiceMock.setUser(UserMocks.CREATOR_AUTH_USER);
            await configRoomDAO.set('configRoomId', ConfigRoomMocks.INITIAL);
            spyOn(configRoomDAO, 'update').and.callThrough();
            expect(configRoomDAO.update).not.toHaveBeenCalled();

            // When joining it
            await service.joinGame('configRoomId');

            // Then it should not update the configRoom, and the configRoom is still the initial one
            expect(configRoomDAO.update).not.toHaveBeenCalled();
            const resultingConfigRoom: ConfigRoom = (await configRoomDAO.read('configRoomId')).get();
            expect(resultingConfigRoom).toEqual(ConfigRoomMocks.INITIAL);
        }));
        it('should be delegated to ConfigRoomCONFIGROOMDAO', fakeAsync(async() => {
            // Given a configRoom
            ConnectedUserServiceMock.setUser(UserMocks.CANDIDATE_AUTH_USER);
            await configRoomDAO.set('configRoomId', ConfigRoomMocks.INITIAL);
            spyOn(configRoomDAO, 'addCandidate').and.callThrough();

            // When joining it
            await service.joinGame('configRoomId');

            // We should be added to the candidate list
            expect(configRoomDAO.addCandidate).toHaveBeenCalledOnceWith('configRoomId', UserMocks.CANDIDATE_MINIMAL_USER);
        }));
        it('should fail when joining an unexisting configRoom', fakeAsync(async() => {
            spyOn(configRoomDAO, 'read').and.resolveTo(MGPOptional.empty());
            ConnectedUserServiceMock.setUser(UserMocks.CANDIDATE_AUTH_USER);
            // When trying to join an invalid configRoom
            const result: Promise<MGPValidation> = service.joinGame('unexistingConfigRoomId');
            // Then it should fail
            await expectAsync(result).toBeResolvedTo(MGPValidation.failure('Game does not exist'));
        }));
    });
    describe('cancelJoining', () => {
        it('should delegate update to DAO', fakeAsync(async() => {
            // Given a configRoom that we are observing and that we joined
            ConnectedUserServiceMock.setUser(UserMocks.CANDIDATE_AUTH_USER);
            await configRoomDAO.set('configRoomId', ConfigRoomMocks.INITIAL);
            service.subscribeToChanges('configRoomId', (doc: MGPOptional<ConfigRoom>): void => {});
            await service.joinGame('configRoomId');

            spyOn(configRoomDAO, 'removeCandidate').and.resolveTo();

            // When cancelling our join
            await service.cancelJoining('configRoomId');

            // Then we are removed from the list
            expect(configRoomDAO.removeCandidate).toHaveBeenCalledOnceWith('configRoomId', UserMocks.CANDIDATE_MINIMAL_USER);
        }));
        it('should start as new when chosen opponent leaves', fakeAsync(async() => {
            // Given a configRoom that we are observing, with a chosen opponent
            ConnectedUserServiceMock.setUser(UserMocks.OPPONENT_AUTH_USER);
            await configRoomDAO.set('configRoomId', ConfigRoomMocks.WITH_CHOSEN_OPPONENT);
            await configRoomDAO.addCandidate('configRoomId', UserMocks.OPPONENT_MINIMAL_USER);
            service.subscribeToChanges('configRoomId', (doc: MGPOptional<ConfigRoom>): void => {});

            // When the chosen opponent leaves
            await service.cancelJoining('configRoomId');

            // Then the configRoom is back to the initial one
            const currentConfigRoom: MGPOptional<ConfigRoom> = await configRoomDAO.read('configRoomId');
            expect(currentConfigRoom.get()).withContext('should be as new').toEqual(ConfigRoomMocks.INITIAL);
        }));
    });
    describe('deleteConfigRoom', () => {
        it('should delegate deletion to CONFIGROOMDAO', fakeAsync(async() => {
            // Given a configRoom that we are observing
            await configRoomDAO.set('configRoomId', ConfigRoomMocks.INITIAL);
            service.subscribeToChanges('configRoomId', (doc: MGPOptional<ConfigRoom>): void => {});

            spyOn(configRoomDAO, 'delete').and.resolveTo();

            // When we delete it
            await service.deleteConfigRoom('configRoomId', []);

            // Then it is deleted in the CONFIGROOMDAO
            expect(configRoomDAO.delete).toHaveBeenCalledOnceWith('configRoomId');
        }));
        it('should delete candidates as well', fakeAsync(async() => {
            // Given a configRoom that we are observing, which has candidates
            await configRoomDAO.set('configRoomId', ConfigRoomMocks.INITIAL);
            service.subscribeToChanges('configRoomId', (doc: MGPOptional<ConfigRoom>): void => {});
            await configRoomDAO.addCandidate('partId', UserMocks.CANDIDATE_MINIMAL_USER);

            spyOn(configRoomDAO, 'removeCandidate').and.resolveTo();

            // When we delete it
            await service.deleteConfigRoom('configRoomId', [UserMocks.CANDIDATE_MINIMAL_USER]);

            // Then the candidate docs are also deleted in the CONFIGROOMDAO
            expect(configRoomDAO.removeCandidate).toHaveBeenCalledOnceWith('configRoomId', UserMocks.CANDIDATE_MINIMAL_USER);
        }));
    });
    describe('reviewConfig', () => {
        it('should change part status with DAO', fakeAsync(async() => {
            // Given a configRoom that we are observing
            await configRoomDAO.set('configRoomId', ConfigRoomMocks.INITIAL);
            service.subscribeToChanges('configRoomId', (doc: MGPOptional<ConfigRoom>): void => {});

            spyOn(configRoomDAO, 'update').and.resolveTo();

            // When reviewing the config
            await service.reviewConfig('configRoomId');

            // Then the part goes back to creation status
            expect(configRoomDAO.update).toHaveBeenCalledOnceWith('configRoomId', {
                partStatus: PartStatus.PART_CREATED.value,
            });
        }));
    });
    describe('reviewConfigAndRemoveChosenOpponent', () => {
        it('should change part status and chosen opponent with DAO', fakeAsync(async() => {
            // Given a configRoom that we are observing
            await configRoomDAO.set('configRoomId', ConfigRoomMocks.INITIAL);
            service.subscribeToChanges('configRoomId', (doc: MGPOptional<ConfigRoom>): void => {});

            spyOn(configRoomDAO, 'update').and.resolveTo();

            // When reviewing the config (because the chosen opponent left)
            await service.reviewConfigAndRemoveChosenOpponent('configRoomId');

            // Then the part is updated accordingly
            expect(configRoomDAO.update).toHaveBeenCalledOnceWith('configRoomId', {
                partStatus: PartStatus.PART_CREATED.value,
                chosenOpponent: null,
            });
        }));
    });
    describe('acceptConfig', () => {
        it('should change part status with DAO to start it', fakeAsync(async() => {
            // Given a configRoom that we are observing
            await configRoomDAO.set('configRoomId', ConfigRoomMocks.INITIAL);
            service.subscribeToChanges('configRoomId', (doc: MGPOptional<ConfigRoom>): void => {});

            spyOn(configRoomDAO, 'update').and.resolveTo();

            // When accepting the config
            await service.acceptConfig('configRoomId');

            // Then the part is updated to the STARTED status
            expect(configRoomDAO.update).toHaveBeenCalledOnceWith('configRoomId', {
                partStatus: PartStatus.PART_STARTED.value,
            });
        }));
    });
    describe('subscribeToCandidates', () => {
        let candidates: MinimalUser[] = [];
        beforeEach(fakeAsync(async() => {
            // Given a configRoom for which we are observing the candidates
            await configRoomDAO.set('configRoomId', ConfigRoomMocks.INITIAL);
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
            await service.removeCandidate('configRoomId', UserMocks.CANDIDATE_MINIMAL_USER);
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
            await configRoomDAO.subCollectionDAO('configRoomId', 'candidates').update(UserMocks.CANDIDATE_MINIMAL_USER.id, { name: 'foo' });
            expect(candidates).toEqual([{ ...UserMocks.CANDIDATE_MINIMAL_USER, name: 'foo' }, UserMocks.OPPONENT_MINIMAL_USER]);

        }));
    });
});
