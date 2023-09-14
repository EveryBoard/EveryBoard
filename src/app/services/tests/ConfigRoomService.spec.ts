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
import { ErrorLoggerServiceMock } from './ErrorLoggerServiceMock.spec';
import { ErrorLoggerService } from '../ErrorLoggerService';
import { RulesConfig, RulesConfigUtils } from 'src/app/jscaip/ConfigUtil';

describe('ConfigRoomService', () => {

    let configRoomDAO: ConfigRoomDAO;

    let configRoomService: ConfigRoomService;

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
        configRoomService = TestBed.inject(ConfigRoomService);
    }));
    it('should create', fakeAsync(() => {
        expect(configRoomService).toBeTruthy();
    }));
    it('read should be delegated to ConfigRoomDAO', fakeAsync(async() => {
        // Given a ConfigRoomService
        spyOn(configRoomDAO, 'read').and.resolveTo(MGPOptional.of(ConfigRoomMocks.INITIAL));
        // When reading a config Room
        await configRoomService.readConfigRoomById('myConfigRoomId');
        // Then it should delegate to the DAO
        expect(configRoomDAO.read).toHaveBeenCalledOnceWith('myConfigRoomId');
    }));
    it('set should be delegated to ConfigRoomDAO', fakeAsync(async() => {
        // Given a ConfigRoomService
        spyOn(configRoomDAO, 'set').and.resolveTo();
        // When setting the configRoom
        await configRoomDAO.set('configRoomId', ConfigRoomMocks.INITIAL);
        // Then it should delegate to the DAO
        expect(configRoomDAO.set).toHaveBeenCalledOnceWith('configRoomId', ConfigRoomMocks.INITIAL);
    }));
    describe('createInitialConfigRoom', () => {
        it('should delegate to the DAO set method', fakeAsync(async() => {
            // Given a ConfigRoomService
            spyOn(configRoomDAO, 'set').and.resolveTo();
            TestBed.inject(ConnectedUserService).user = MGPOptional.of(UserMocks.CREATOR_AUTH_USER);

            // When creating the initial configRoom
            await configRoomService.createInitialConfigRoom('id', 'Quarto');

            // Then it should delegate to the DAO and create the initial configRoom
            expect(configRoomDAO.set).toHaveBeenCalledOnceWith('id', ConfigRoomMocks.INITIAL_RANDOM);
        }));
        it('should create the config room with the default rules config', fakeAsync(async() => {
            // Given a game that is configurable
            spyOn(configRoomDAO, 'set').and.resolveTo();
            TestBed.inject(ConnectedUserService).user = MGPOptional.of(UserMocks.CREATOR_AUTH_USER);
            const configurableGame: string = 'P4'; // Amongst others
            const defaultConfig: RulesConfig = { mais_quelles_belles_chaussettes: 73 };
            spyOn(RulesConfigUtils, 'getGameDefaultConfig').and.returnValue(defaultConfig);

            // When creating part of this type
            await configRoomService.createInitialConfigRoom('id', configurableGame);

            // Then it should be created with the initial config rules
            const roomConfig: ConfigRoom = {
                ...ConfigRoomMocks.INITIAL_RANDOM,
                rulesConfig: defaultConfig,
            };
            expect(configRoomDAO.set).toHaveBeenCalledOnceWith('id', roomConfig);
        }));
    });
    describe('joinGame', () => {
        it('should call configRoomService.addCandidate even when called while already in the game', fakeAsync(async() => {
            // Given a configRoom and a connected user that is candidate in the room
            await configRoomDAO.set('configRoomId', ConfigRoomMocks.INITIAL);
            ConnectedUserServiceMock.setUser(UserMocks.OPPONENT_AUTH_USER);
            await configRoomService.addCandidate('configRoomId', UserMocks.OPPONENT_MINIMAL_USER);

            // When calling joinGame to join the game one more time
            spyOn(configRoomService, 'addCandidate').and.callThrough();
            const joinResult: MGPValidation = await configRoomService.joinGame('configRoomId');

            // Then it should succeed
            expect(configRoomService.addCandidate).toHaveBeenCalledOnceWith('configRoomId', UserMocks.OPPONENT_MINIMAL_USER);
            expect(joinResult.isSuccess()).toBeTrue();
        }));
        it('should not update configRoom when called by the creator', fakeAsync(async() => {
            // Given a configRoom where we are the creator
            ConnectedUserServiceMock.setUser(UserMocks.CREATOR_AUTH_USER);
            await configRoomDAO.set('configRoomId', ConfigRoomMocks.INITIAL);
            spyOn(configRoomDAO, 'update').and.callThrough();
            expect(configRoomDAO.update).not.toHaveBeenCalled();

            // When joining it
            await configRoomService.joinGame('configRoomId');

            // Then it should not update the configRoom, and the configRoom is still the initial one
            expect(configRoomDAO.update).not.toHaveBeenCalled();
            const resultingConfigRoom: ConfigRoom = (await configRoomDAO.read('configRoomId')).get();
            expect(resultingConfigRoom).toEqual(ConfigRoomMocks.INITIAL);
        }));
        it('should call addCandidate', fakeAsync(async() => {
            // Given a configRoom
            ConnectedUserServiceMock.setUser(UserMocks.CANDIDATE_AUTH_USER);
            await configRoomDAO.set('configRoomId', ConfigRoomMocks.INITIAL);
            spyOn(configRoomService, 'addCandidate').and.callThrough();

            // When joining it
            await configRoomService.joinGame('configRoomId');

            // We should be added to the candidate list
            expect(configRoomService.addCandidate).toHaveBeenCalledOnceWith('configRoomId', UserMocks.CANDIDATE_MINIMAL_USER);
        }));
        it('should fail when joining an unexisting configRoom', fakeAsync(async() => {
            spyOn(configRoomDAO, 'read').and.resolveTo(MGPOptional.empty());
            ConnectedUserServiceMock.setUser(UserMocks.CANDIDATE_AUTH_USER);
            // When trying to join an invalid configRoom
            const result: Promise<MGPValidation> = configRoomService.joinGame('unexistingConfigRoomId');
            // Then it should fail
            await expectAsync(result).toBeResolvedTo(MGPValidation.failure('Game does not exist'));
        }));
    });
    describe('cancelJoining', () => {
        it('should call removeCandidate', fakeAsync(async() => {
            // Given a configRoom that we are observing and that we joined
            ConnectedUserServiceMock.setUser(UserMocks.CANDIDATE_AUTH_USER);
            await configRoomDAO.set('configRoomId', ConfigRoomMocks.INITIAL);
            configRoomService.subscribeToChanges('configRoomId', (doc: MGPOptional<ConfigRoom>): void => {});
            await configRoomService.joinGame('configRoomId');

            spyOn(configRoomService, 'removeCandidate').and.resolveTo();

            // When canceling our join
            await configRoomService.cancelJoining('configRoomId');

            // Then we are removed from the list
            expect(configRoomService.removeCandidate).toHaveBeenCalledOnceWith('configRoomId', UserMocks.CANDIDATE_MINIMAL_USER);
        }));
        it('should start as new when chosen opponent leaves', fakeAsync(async() => {
            // Given a configRoom that we are observing, with a chosen opponent
            ConnectedUserServiceMock.setUser(UserMocks.OPPONENT_AUTH_USER);
            await configRoomDAO.set('configRoomId', ConfigRoomMocks.WITH_CHOSEN_OPPONENT);
            await configRoomService.addCandidate('configRoomId', UserMocks.OPPONENT_MINIMAL_USER);
            configRoomService.subscribeToChanges('configRoomId', (doc: MGPOptional<ConfigRoom>): void => {});

            // When the chosen opponent leaves
            await configRoomService.cancelJoining('configRoomId');

            // Then the configRoom is back to the initial one
            const currentConfigRoom: MGPOptional<ConfigRoom> = await configRoomDAO.read('configRoomId');
            expect(currentConfigRoom.get()).withContext('should be as new').toEqual(ConfigRoomMocks.INITIAL);
        }));
        it('should remove yourself when leaving the room', fakeAsync(async() => {
            // Given a configRoom that we are observing as a candidate
            await configRoomService.addCandidate('configRoomId', UserMocks.CANDIDATE_MINIMAL_USER);
            await configRoomService.addCandidate('configRoomId', UserMocks.OTHER_OPPONENT_MINIMAL_USER);
            await configRoomDAO.set('configRoomId', ConfigRoomMocks.INITIAL);
            configRoomService.subscribeToChanges('configRoomId', (doc: MGPOptional<ConfigRoom>): void => {});
            ConnectedUserServiceMock.setUser(UserMocks.OTHER_OPPONENT_AUTH_USER);

            // When the ChosenOpponent leaves
            await configRoomService.cancelJoining('configRoomId');

            // Then the config room is back to the initial one
            const currentConfigRoom: MGPOptional<ConfigRoom> = await configRoomDAO.read('configRoomId');
            const otherOpponentDoc: MGPOptional<unknown> =
                await configRoomDAO.subCollectionDAO('configRoomId', 'candidates').read(UserMocks.OTHER_OPPONENT_AUTH_USER.id);
            expect(otherOpponentDoc.isAbsent()).toBeTrue();
            expect(currentConfigRoom.get()).withContext('should be as new').toEqual(ConfigRoomMocks.INITIAL);
        }));
        it('should throw when called by creator', fakeAsync(async() => {
            // Given a config room that we are observing but that we are creating
            spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
            await configRoomDAO.set('configRoomId', ConfigRoomMocks.INITIAL);
            ConnectedUserServiceMock.setUser(UserMocks.CREATOR_AUTH_USER);
            configRoomService.subscribeToChanges('configRoomId', (doc: MGPOptional<ConfigRoom>): void => {});
            await configRoomService.joinGame('configRoomId');

            // When calling cancelJoining
            // Then it should throw an error
            const creatorId: string = UserMocks.CREATOR_AUTH_USER.id;
            const error: string = 'Cannot delete element ' + creatorId + ' absent from ConfigRoomDAOMock/configRoomId/candidates';
            await expectAsync(configRoomService.cancelJoining('configRoomId')).toBeRejectedWithError(error);
        }));
        it('should throw when called by user absent from the room', fakeAsync(async() => {
            // Given a config room that we are not observing or creating and that we did not joined
            spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
            await configRoomDAO.set('configRoomId', ConfigRoomMocks.INITIAL);
            ConnectedUserServiceMock.setUser(UserMocks.OTHER_OPPONENT_AUTH_USER);
            configRoomService.subscribeToChanges('configRoomId', (doc: MGPOptional<ConfigRoom>): void => {});

            // When calling cancelJoining
            // Then it should throw an error
            const userId: string = UserMocks.OTHER_OPPONENT_AUTH_USER.id;
            const error: string = 'Cannot delete element ' + userId + ' absent from ConfigRoomDAOMock/configRoomId/candidates';
            await expectAsync(configRoomService.cancelJoining('configRoomId')).toBeRejectedWithError(error);
        }));
    });
    describe('deleteConfigRoom', () => {
        it('should delegate deletion to CONFIGROOMDAO', fakeAsync(async() => {
            // Given a configRoom that we are observing
            await configRoomDAO.set('configRoomId', ConfigRoomMocks.INITIAL);
            configRoomService.subscribeToChanges('configRoomId', (doc: MGPOptional<ConfigRoom>): void => {});

            spyOn(configRoomDAO, 'delete').and.resolveTo();

            // When we delete it
            await configRoomService.deleteConfigRoom('configRoomId', []);

            // Then it is deleted in the DAO
            expect(configRoomDAO.delete).toHaveBeenCalledOnceWith('configRoomId');
        }));
        it('should delete candidates as well', fakeAsync(async() => {
            // Given a configRoom that we are observing, which has candidates
            await configRoomDAO.set('configRoomId', ConfigRoomMocks.INITIAL);
            configRoomService.subscribeToChanges('configRoomId', (doc: MGPOptional<ConfigRoom>): void => {});
            await configRoomService.addCandidate('configRoomId', UserMocks.CANDIDATE_MINIMAL_USER);

            spyOn(configRoomService, 'removeCandidate').and.resolveTo();

            // When we delete it
            await configRoomService.deleteConfigRoom('configRoomId', [UserMocks.CANDIDATE_MINIMAL_USER]);

            // Then the candidate docs are also deleted in the DAO
            expect(configRoomService.removeCandidate).toHaveBeenCalledOnceWith('configRoomId', UserMocks.CANDIDATE_MINIMAL_USER);
        }));
    });
    describe('reviewConfig', () => {
        it('should change part status with DAO', fakeAsync(async() => {
            // Given a configRoom that we are observing
            await configRoomDAO.set('configRoomId', ConfigRoomMocks.INITIAL);
            configRoomService.subscribeToChanges('configRoomId', (doc: MGPOptional<ConfigRoom>): void => {});

            spyOn(configRoomDAO, 'update').and.resolveTo();

            // When reviewing the config
            await configRoomService.reviewConfig('configRoomId');

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
            configRoomService.subscribeToChanges('configRoomId', (doc: MGPOptional<ConfigRoom>): void => {});

            spyOn(configRoomDAO, 'update').and.resolveTo();

            // When reviewing the config (because the chosen opponent left)
            await configRoomService.reviewConfigAndRemoveChosenOpponent('configRoomId');

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
            configRoomService.subscribeToChanges('configRoomId', (doc: MGPOptional<ConfigRoom>): void => {});

            spyOn(configRoomDAO, 'update').and.resolveTo();

            // When accepting the config
            await configRoomService.acceptConfig('configRoomId');

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
            configRoomService.subscribeToChanges('configRoomId', () => {});
            configRoomService.subscribeToCandidates('configRoomId', (newCandidates: MinimalUser[]) => {
                candidates = newCandidates;
            });
        }));
        it('should see new candidates appear', fakeAsync(async() => {
            ConnectedUserServiceMock.setUser(UserMocks.CANDIDATE_AUTH_USER);
            // When a candidate is added
            await configRoomService.joinGame('configRoomId');
            // Then the candidate has been seen
            expect(candidates).toEqual([UserMocks.CANDIDATE_MINIMAL_USER]);
        }));
        it('should see removed candidates disappear', fakeAsync(async() => {
            // and given an existing candidate
            ConnectedUserServiceMock.setUser(UserMocks.CANDIDATE_AUTH_USER);
            await configRoomService.joinGame('configRoomId');
            // When a candidate is removed
            await configRoomService.removeCandidate('configRoomId', UserMocks.CANDIDATE_MINIMAL_USER);
            // Then the candidate has been seen
            expect(candidates).toEqual([]);
        }));
        it('should see modified candidates correctly modified', fakeAsync(async() => {
            // and given some existing candidates
            ConnectedUserServiceMock.setUser(UserMocks.CANDIDATE_AUTH_USER);
            await configRoomService.joinGame('configRoomId');
            ConnectedUserServiceMock.setUser(UserMocks.OPPONENT_AUTH_USER);
            await configRoomService.joinGame('configRoomId');

            // When a candidate is modified
            // (This should never happen in practice, but we still want the correct behavior just in case)
            await configRoomDAO.subCollectionDAO('configRoomId', 'candidates').update(UserMocks.CANDIDATE_MINIMAL_USER.id, { name: 'foo' });
            expect(candidates).toEqual([{ ...UserMocks.CANDIDATE_MINIMAL_USER, name: 'foo' }, UserMocks.OPPONENT_MINIMAL_USER]);

        }));
    });
});
