/* eslint-disable max-lines-per-function */
import { fakeAsync, tick } from '@angular/core/testing';
import { Subscription } from 'rxjs';

import { MGPOptional } from '@everyboard/lib';

import { ConfigProposal, ConfigRoom, FirstPlayer, GameType } from '../../domain/ConfigRoom';
import { ConfigRoomMocks } from '../../domain/ConfigRoomMocks.spec';
import { MinimalUser } from '../../domain/MinimalUser';
import { UserMocks } from '../../domain/UserMocks.spec';
import { AbstractBackendService, BackendService } from '../BackendService';
import { ConfigRoomService } from '../ConfigRoomService';

import { BackendServiceMock } from './BackendServiceMock.spec';

describe('ConfigRoomService', () => {

    let backendService: BackendServiceMock;
    let configRoomService: ConfigRoomService;

    beforeEach(fakeAsync(async() => {
        backendService = new BackendServiceMock();
        configRoomService = new ConfigRoomService(backendService as AbstractBackendService as BackendService);
    }));

    it('should create', fakeAsync(() => {
        expect(configRoomService).toBeTruthy();
    }));

    function ignore(): void {}

    function updateConfigRoom(gameId: string, configRoom: ConfigRoom): void {
        backendService.mockReceivedMessage('ConfigRoomUpdate', { gameId, configRoom });
        tick(1);
    }

    function deleteConfigRoom(gameId: string): void {
        backendService.mockReceivedMessage('ConfigRoomDeleted', { gameId });
        tick(1);
    }

    function addCandidate(candidate: MinimalUser): void {
        backendService.mockReceivedMessage('CandidateJoined', { candidate });
        tick(1);
    }

    function removeCandidate(candidate: MinimalUser): void {
        backendService.mockReceivedMessage('CandidateLeft', { candidate });
        tick(1);
    }

    function sendError(reason: string): void {
        backendService.mockReceivedMessage('Error', { reason });
        tick(1);
    }

    describe('join', () => {
        it('should notify about config room updates', fakeAsync(async() => {
            // Given a service with which we joined a config room
            let configRoom: MGPOptional<ConfigRoom> = MGPOptional.empty();
            const subscription: Subscription =
                await configRoomService.join('gameId',
                                             (update: ConfigRoom): void => {
                                                 configRoom = MGPOptional.of(update);
                                             },
                                             ignore,
                                             ignore,
                                             ignore,
                                             ignore);

            // When there are config room updates
            const updatedConfigRoom: ConfigRoom = ConfigRoomMocks.getInitial(MGPOptional.empty());
            updateConfigRoom('gameId', updatedConfigRoom);
            // Then we are notified about it
            expect(configRoom.isPresent()).toBeTrue();
            expect(configRoom.get()).toEqual(updatedConfigRoom);
            subscription.unsubscribe();
        }));

        it('should notify about config room deletions', fakeAsync(async() => {
            // Given a service with which we joined a config room
            let deleted: boolean = false;
            const subscription: Subscription =
                await configRoomService.join('gameId',
                                             ignore,
                                             (): void => {
                                                 deleted = true;
                                             },
                                             ignore,
                                             ignore,
                                             ignore);

            // When there is a config room deletion
            deleteConfigRoom('gameId');
            // Then we are notified about it
            expect(deleted).toBeTrue();
            subscription.unsubscribe();
        }));

        it('should notify about candidates joining', fakeAsync(async() => {
            // Given a service with which we joined a config room
            const candidates: MinimalUser[] = [];
            const subscription: Subscription =
                await configRoomService.join('gameId',
                                             ignore,
                                             ignore,
                                             (candidate: MinimalUser): void => {
                                                 candidates.push(candidate);
                                             },
                                             ignore,
                                             ignore);

            // When a candidate joins
            const candidate: MinimalUser = UserMocks.CANDIDATE_MINIMAL_USER;
            addCandidate(candidate);
            // Then we are notified about it
            expect(candidates.length).toBe(1);
            expect(candidates[0]).toEqual(candidate);
            subscription.unsubscribe();
        }));

        it('should notify about candidates leaving', fakeAsync(async() => {
            // Given a service with which we joined a config room and observed a candidate joining
            let candidates: MinimalUser[] = [];
            const subscription: Subscription =
                await configRoomService.join('gameId',
                                             ignore,
                                             ignore,
                                             (candidate: MinimalUser): void => {
                                                 candidates.push(candidate);
                                             },
                                             (candidate: MinimalUser): void => {
                                                 candidates = candidates.filter((c: MinimalUser): boolean =>
                                                     c.id !== candidate.id);
                                             },
                                             ignore);
            const candidate: MinimalUser = UserMocks.CANDIDATE_MINIMAL_USER;
            addCandidate(candidate);
            expect(candidates.length).toBe(1);

            // When the candidate leaves
            removeCandidate(candidate);

            // Then we are notified about it
            expect(candidates.length).toBe(0);
            subscription.unsubscribe();
        }));

        it('should notify about errors', fakeAsync(async() => {
            // Given a service with which we joined a config room
            let errorsSeen: number = 0;
            const subscription: Subscription =
                await configRoomService.join('gameId',
                                             ignore,
                                             ignore,
                                             ignore,
                                             ignore,
                                             (_reason: string): void => {
                                                 errorsSeen += 1;
                                             });
            // When an error occurs
            sendError('some error');
            // Then we are notified about it
            expect(errorsSeen).toBe(1);
            subscription.unsubscribe();
        }));

        it('should not notify after unsubscription', fakeAsync(async() => {
            // Given a service with which we joined a config room and then unsubscribed
            let observedSomething: boolean = false;
            function recordObservation(): void {
                observedSomething = true;
            }
            const subscription: Subscription =
                await configRoomService.join('gameId',
                                             recordObservation,
                                             recordObservation,
                                             recordObservation,
                                             recordObservation,
                                             recordObservation);
            subscription.unsubscribe();
            // When anything occurs on the backend
            const updatedConfigRoom: ConfigRoom = ConfigRoomMocks.getInitial(MGPOptional.empty());
            updateConfigRoom('gameId', updatedConfigRoom);
            const candidate: MinimalUser = UserMocks.CANDIDATE_MINIMAL_USER;
            addCandidate(candidate);
            removeCandidate(candidate);
            sendError('some error');
            deleteConfigRoom('gameId');
            // Then we are NOT notified about it
            expect(observedSomething).toBeFalse();
        }));
    });

    describe('proposeConfig', () => {
        it('should send a ProposeConfig message', fakeAsync(async() => {
            // Given a config proposal
            const proposal: ConfigProposal = {
                gameType: GameType.STANDARD,
                firstPlayer: FirstPlayer.RANDOM,
                moveDuration: 42,
                gameDuration: 4200,
                rulesConfig: {},
            };
            spyOn(backendService, 'send').and.callThrough();
            // When we propose it
            await configRoomService.proposeConfig(proposal);
            // Then it should send ProposeConfig with our config to the backend
            expect(backendService.send).toHaveBeenCalledOnceWith(['ProposeConfig', { config: proposal }]);
        }));
    });

    describe('selectOpponent', () => {
        it('should send a SelectOpponent message', fakeAsync(async() => {
            // Given an opponent
            const opponent: MinimalUser = UserMocks.CANDIDATE_MINIMAL_USER;
            spyOn(backendService, 'send').and.callThrough();
            // When selecting them
            await configRoomService.selectOpponent(opponent);
            // Then it should send SelectOpponent with the opponent
            expect(backendService.send).toHaveBeenCalledOnceWith(['SelectOpponent', { opponent }]);
        }));
    });

    describe('reviewConfig', () => {
        it('should send a ReviewConfig message', fakeAsync(async() => {
            // Given a config we want to review (managed by the backend)
            spyOn(backendService, 'send').and.callThrough();
            // When we ask to review it
            await configRoomService.reviewConfig();
            // Then it should send the ReviewConfig message
            expect(backendService.send).toHaveBeenCalledOnceWith(['ReviewConfig']);
        }));

    });

    describe('acceptConfig', () => {
        it('should send an AcceptConfig message', fakeAsync(async() => {
            // Given a config we want to accept (managed by the backend)
            spyOn(backendService, 'send').and.callThrough();
            // When we ask to accept it
            await configRoomService.acceptConfig();
            // Then it should send the AcceptConfig message
            expect(backendService.send).toHaveBeenCalledOnceWith(['AcceptConfig']);
        }));

    });

});
