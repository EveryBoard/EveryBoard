/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed } from '@angular/core/testing';
import { ConfigRoomService } from '../ConfigRoomService';
import { ConfigRoomDAO } from 'src/app/dao/ConfigRoomDAO';
import { ConfigRoomDAOMock } from 'src/app/dao/tests/ConfigRoomDAOMock.spec';
import { ConfigRoomMocks } from 'src/app/domain/ConfigRoomMocks.spec';
import { MGPOptional, MGPValidation, Utils } from '@everyboard/lib';
import { UserMocks } from 'src/app/domain/UserMocks.spec';
import { MinimalUser } from 'src/app/domain/MinimalUser';
import { ConnectedUserService } from '../ConnectedUserService';
import { ConnectedUserServiceMock } from './ConnectedUserService.spec';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BackendService } from '../BackendService';
import { IFirestoreDAO } from 'src/app/dao/FirestoreDAO';
import { FirstPlayer, PartStatus, PartType } from 'src/app/domain/ConfigRoom';
import { RulesConfig } from 'src/app/jscaip/RulesConfigUtil';
import { BlankComponent } from 'src/app/utils/tests/TestUtils.spec';

describe('ConfigRoomService', () => {

    let configRoomDAO: ConfigRoomDAO;
    let configRoomService: ConfigRoomService;
    let backendService: BackendService;

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
        backendService = TestBed.inject(BackendService);
    }));

    it('should create', fakeAsync(() => {
        expect(configRoomService).toBeTruthy();
    }));

    describe('joinGame', () => {

        it('should delegate to backend', fakeAsync(async() => {
            // Given a config room we want to join
            const configRoomId: string = 'configRoomId';
            spyOn(backendService, 'joinGame').and.callFake(async() => MGPValidation.SUCCESS);
            // When calling joinGame
            const result: MGPValidation = await configRoomService.joinGame(configRoomId);
            // Then it should have delegated to the backend
            expect(backendService.joinGame).toHaveBeenCalledOnceWith(configRoomId);
            expect(result).toBe(MGPValidation.SUCCESS);
        }));
    });

    describe('removeCandidate', () => {

        it('should delegate to backend', fakeAsync(async() => {
            // Given a config room
            const configRoomId: string = 'configRoomId';
            spyOn(backendService, 'removeCandidate').and.callFake(async() => {});
            // When calling removeCandidate
            await configRoomService.removeCandidate(configRoomId, UserMocks.CANDIDATE_MINIMAL_USER);
            // Then it should have delegated to the backend
            expect(backendService.removeCandidate)
                .toHaveBeenCalledOnceWith(configRoomId, UserMocks.CANDIDATE_MINIMAL_USER.id);
        }));
    });

    describe('proposeConfig', () => {

        it('should delegate to backend with JSON config', fakeAsync(async() => {
            // Given a config room
            const configRoomId: string = 'configRoomId';
            spyOn(backendService, 'proposeConfig').and.callFake(async() => {});
            // When calling proposeConfig
            const partType: PartType = PartType.BLITZ;
            const maximalMoveDuration: number = 30;
            const totalPartDuration: number = 480;
            const firstPlayer: FirstPlayer = FirstPlayer.CREATOR;
            const rulesConfig: MGPOptional<RulesConfig> = MGPOptional.empty();
            await configRoomService.proposeConfig(configRoomId,
                                                  partType,
                                                  maximalMoveDuration,
                                                  firstPlayer,
                                                  totalPartDuration,
                                                  rulesConfig);
            // Then it should have delegated to the backend
            const jsonConfig: JSONValue = {
                partStatus: PartStatus.CONFIG_PROPOSED.value,
                partType: partType.value,
                maximalMoveDuration,
                totalPartDuration,
                firstPlayer: firstPlayer.value,
                rulesConfig: {},
            };
            expect(backendService.proposeConfig).toHaveBeenCalledOnceWith(configRoomId, jsonConfig);
        }));
    });

    describe('setChosenOpponent', () => {

        it('should delegate to backend', fakeAsync(async() => {
            // Given a config room
            const configRoomId: string = 'configRoomId';
            spyOn(backendService, 'selectOpponent').and.callFake(async() => {});
            // When calling removeCandidate
            await configRoomService.setChosenOpponent(configRoomId, UserMocks.CANDIDATE_MINIMAL_USER);
            // Then it should have delegated to the backend
            expect(backendService.selectOpponent)
                .toHaveBeenCalledOnceWith(configRoomId, UserMocks.CANDIDATE_MINIMAL_USER);
        }));
    });
    describe('reviewConfig', () => {

        it('should delegate to backend', fakeAsync(async() => {
            // Given a config room we want to review
            const configRoomId: string = 'configRoomId';
            spyOn(backendService, 'reviewConfig').and.callFake(async() => {});
            // When calling reviewConfig
            await configRoomService.reviewConfig(configRoomId);
            // Then it should have delegated to the backend
            expect(backendService.reviewConfig).toHaveBeenCalledOnceWith(configRoomId);
        }));
    });

    describe('reviewConfigAndRemoveChosenOpponent', () => {

        it('should delegate to backend', fakeAsync(async() => {
            // Given a config room we want to review
            const configRoomId: string = 'configRoomId';
            spyOn(backendService, 'reviewConfigAndRemoveChosenOpponent').and.callFake(async() => {});
            // When calling reviewConfig
            await configRoomService.reviewConfigAndRemoveChosenOpponent(configRoomId);
            // Then it should have delegated to the backend
            expect(backendService.reviewConfigAndRemoveChosenOpponent).toHaveBeenCalledOnceWith(configRoomId);
        }));
    });

    describe('subscribeToCandidates', () => {

        let candidates: MinimalUser[] = [];
        let candidatesDAO: IFirestoreDAO<MinimalUser>;

        beforeEach(fakeAsync(async() => {
            // Given a configRoom for which we are observing the candidates
            await configRoomDAO.set('configRoomId', ConfigRoomMocks.getInitial(MGPOptional.empty()));
            configRoomService.subscribeToChanges('configRoomId', () => {});
            configRoomService.subscribeToCandidates('configRoomId', (newCandidates: MinimalUser[]) => {
                candidates = newCandidates;
            });
            candidatesDAO = configRoomDAO.subCollectionDAO('configRoomId', 'candidates');
        }));

        it('should see new candidates appear', fakeAsync(async() => {
            // When a candidate is added
            await candidatesDAO.set(UserMocks.CANDIDATE_MINIMAL_USER.id, UserMocks.CANDIDATE_MINIMAL_USER);
            // Then the candidate has been seen
            expect(candidates).toEqual([UserMocks.CANDIDATE_MINIMAL_USER]);
        }));

        it('should see removed candidates disappear', fakeAsync(async() => {
            // and given an existing candidate
            await candidatesDAO.set(UserMocks.CANDIDATE_MINIMAL_USER.id, UserMocks.CANDIDATE_MINIMAL_USER);
            // When a candidate is removed
            await candidatesDAO.delete(UserMocks.CANDIDATE_MINIMAL_USER.id);
            // Then the candidate has been seen
            expect(candidates).toEqual([]);
        }));

        it('should see modified candidates correctly modified', fakeAsync(async() => {
            // and given some existing candidates
            await candidatesDAO.set(UserMocks.CANDIDATE_MINIMAL_USER.id, UserMocks.CANDIDATE_MINIMAL_USER);
            await candidatesDAO.set(UserMocks.OPPONENT_MINIMAL_USER.id, UserMocks.OPPONENT_MINIMAL_USER);

            // When a candidate is modified
            // (This should never happen in practice, but we still want the correct behavior just in case)
            await configRoomDAO.subCollectionDAO('configRoomId', 'candidates').update(UserMocks.CANDIDATE_MINIMAL_USER.id, { name: 'foo' });
            expect(candidates).toEqual([{ ...UserMocks.CANDIDATE_MINIMAL_USER, name: 'foo' }, UserMocks.OPPONENT_MINIMAL_USER]);

        }));
    });
});
