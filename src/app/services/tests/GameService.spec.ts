/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed } from '@angular/core/testing';
import { GameService, StartingPartConfig } from '../GameService';
import { PartDAO } from 'src/app/dao/PartDAO';
import { of } from 'rxjs';
import { Part, PartDocument, MGPResult } from 'src/app/domain/Part';
import { PartDAOMock } from 'src/app/dao/tests/PartDAOMock.spec';
import { JoinerDAOMock } from 'src/app/dao/tests/JoinerDAOMock.spec';
import { ChatDAOMock } from 'src/app/dao/tests/ChatDAOMock.spec';
import { ChatDAO } from 'src/app/dao/ChatDAO';
import { PartMocks } from 'src/app/domain/PartMocks.spec';
import { Player } from 'src/app/jscaip/Player';
import { Request } from 'src/app/domain/Request';
import { Joiner, PartType } from 'src/app/domain/Joiner';
import { JoinerDAO } from 'src/app/dao/JoinerDAO';
import { RouterTestingModule } from '@angular/router/testing';
import { BlankComponent } from 'src/app/utils/tests/TestUtils.spec';
import { AuthenticationService } from '../AuthenticationService';
import { AuthenticationServiceMock } from './AuthenticationService.spec';
import { JoinerMocks } from 'src/app/domain/JoinerMocks.spec';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Utils } from 'src/app/utils/utils';
import { JoinerService } from '../JoinerService';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import firebase from 'firebase/app';

describe('GameService', () => {

    let service: GameService;

    let partDAO: PartDAO;

    const MOVE_1: number = 161;
    const MOVE_2: number = 107;

    beforeEach(fakeAsync(async() => {
        await TestBed.configureTestingModule({
            imports: [
                RouterTestingModule.withRoutes([
                    { path: '**', component: BlankComponent },
                ]),
                BrowserAnimationsModule,
            ],
            providers: [
                { provide: AuthenticationService, useClass: AuthenticationServiceMock },
                { provide: PartDAO, useClass: PartDAOMock },
                { provide: JoinerDAO, useClass: JoinerDAOMock },
                { provide: ChatDAO, useClass: ChatDAOMock },
            ],
        }).compileComponents();
        service = TestBed.inject(GameService);
        partDAO = TestBed.inject(PartDAO);
    }));
    it('should create', () => {
        expect(service).toBeTruthy();
    });
    it('startObserving should delegate callback to partDAO', () => {
        const part: Part = {
            lastUpdate: {
                index: 4,
                player: 0,
            },
            typeGame: 'Quarto',
            playerZero: 'creator',
            playerOne: 'joiner',
            turn: 2,
            listMoves: [MOVE_1, MOVE_2],
            result: MGPResult.UNACHIEVED.value,
        };
        const myCallback: (observedPart: MGPOptional<Part>) => void = (observedPart: MGPOptional<Part>) => {
            expect(observedPart.isPresent()).toBeTrue();
            expect(observedPart.get()).toEqual(part);
        };
        spyOn(partDAO, 'getObsById').and.returnValue(of(MGPOptional.of(part)));
        service.startObserving('partId', myCallback);
        expect(partDAO.getObsById).toHaveBeenCalledWith('partId');
    });
    it('startObserving should throw exception when called while observing ', fakeAsync(async() => {
        await partDAO.set('myJoinerId', PartMocks.INITIAL);

        expect(() => {
            service.startObserving('myJoinerId', (_part: MGPOptional<Part>) => {});
            service.startObserving('myJoinerId', (_part: MGPOptional<Part>) => {});
        }).toThrowError('GameService.startObserving should not be called while already observing a game');
    }));
    it('should delegate delete to PartDAO', fakeAsync(async() => {
        spyOn(partDAO, 'delete');
        await service.deletePart('partId');
        expect(partDAO.delete).toHaveBeenCalledOnceWith('partId');
    }));
    it('should forbid to accept a take back that the player proposed himself', fakeAsync(async() => {
        for (const player of [Player.ZERO, Player.ONE]) {
            const part: PartDocument = new PartDocument('joinerId', {
                lastUpdate: {
                    index: 0,
                    player: player.value,
                },
                typeGame: 'Quarto',
                playerZero: 'creator',
                playerOne: 'joiner',
                turn: 2,
                listMoves: [MOVE_1, MOVE_2],
                request: Request.takeBackAsked(player),
                result: MGPResult.UNACHIEVED.value,
            });
            const result: Promise<void> = service.acceptTakeBack('joinerId', part, player, [0, 1]);
            await expectAsync(result).toBeRejectedWithError('Encountered error: Assertion failure: Illegal to accept your own request.');
        }
    }));
    it('acceptConfig should delegate to joinerService and call startGameWithConfig', fakeAsync(async() => {
        const joinerService: JoinerService = TestBed.inject(JoinerService);
        const joiner: Joiner = JoinerMocks.WITH_PROPOSED_CONFIG;
        spyOn(joinerService, 'acceptConfig').and.resolveTo();
        spyOn(partDAO, 'update').and.resolveTo();

        await service.acceptConfig('partId', joiner);

        expect(joinerService.acceptConfig).toHaveBeenCalledOnceWith();
    }));
    describe('getStartingConfig', () => {
        it('should put creator first when math.random() is below 0.5', fakeAsync(async() => {
            // given a joiner config asking random start
            const joiner: Joiner = {
                candidates: ['joiner'],
                chosenPlayer: 'joiner',
                creator: 'creator',
                firstPlayer: 'RANDOM',
                maximalMoveDuration: 10,
                partStatus: 3,
                partType: PartType.BLITZ.value,
                totalPartDuration: 25,
            };

            // when calling getStartingConfig
            spyOn(Math, 'random').and.returnValue(0.4);
            const startConfig: StartingPartConfig = service.getStartingConfig(joiner);

            // then we should have a creator starting the game
            expect(startConfig.playerZero).toBe(joiner.creator);
            expect(startConfig.playerOne).toBe(Utils.getNonNullable(joiner.chosenPlayer));
        }));
        it('should put chosen player first when math.random() is over 0.5', fakeAsync(async() => {
            // given a joiner config asking random start
            const joiner: Joiner = {
                candidates: ['joiner'],
                chosenPlayer: 'joiner',
                creator: 'creator',
                firstPlayer: 'RANDOM',
                maximalMoveDuration: 10,
                partStatus: 3,
                partType: PartType.BLITZ.value,
                totalPartDuration: 25,
            };

            // when calling getStartingConfig
            spyOn(Math, 'random').and.returnValue(0.6);
            const startConfig: StartingPartConfig = service.getStartingConfig(joiner);

            // then we should have a creator starting the game
            expect(startConfig.playerZero).toBe(Utils.getNonNullable(joiner.chosenPlayer));
            expect(startConfig.playerOne).toBe(joiner.creator);
        }));
    });
    describe('rematch', () => {
        let joinerService: JoinerService;
        let partDAO: PartDAO;
        beforeEach(() => {
            joinerService = TestBed.inject(JoinerService);
            partDAO = TestBed.inject(PartDAO);
        });
        it('should send request when proposing a rematch', fakeAsync(async() => {
            spyOn(service, 'sendRequest').and.resolveTo();

            await service.proposeRematch('partId', 0, Player.ZERO);

            expect(service.sendRequest).toHaveBeenCalledTimes(1);
        }));
        it('should start with the other player when first player mentionned in previous game', fakeAsync(async() => {
            // given a previous match with creator starting
            const lastPart: PartDocument = new PartDocument('partId', {
                lastUpdate: {
                    index: 4,
                    player: 0,
                },
                listMoves: [MOVE_1, MOVE_2],
                playerZero: 'creator',
                playerOne: 'joiner',
                result: MGPResult.VICTORY.value,
                turn: 2,
                typeGame: 'laMarelle',
                beginning: { seconds: 17001025123456, nanoseconds: 680000000 },
                lastMoveTime: { seconds: 2, nanoseconds: 3000000 },
                loser: 'creator',
                winner: 'joiner',
                request: Request.rematchProposed(Player.ZERO),
            });
            const lastGameJoiner: Joiner = {
                candidates: ['joiner'],
                chosenPlayer: 'joiner',
                creator: 'creator',
                firstPlayer: 'CREATOR',
                maximalMoveDuration: 10,
                partStatus: 3,
                partType: PartType.BLITZ.value,
                totalPartDuration: 25,
            };
            spyOn(service, 'sendRequest').and.resolveTo();
            spyOn(joinerService, 'readJoinerById').and.resolveTo(lastGameJoiner);
            let called: boolean = false;
            spyOn(partDAO, 'set').and.callFake(async(_id: string, element: Part) => {
                expect(element.playerZero).toEqual(Utils.getNonNullable(lastPart.data.playerOne));
                expect(element.playerOne).toEqual(Utils.getNonNullable(lastPart.data.playerZero));
                called = true;
            });

            // when accepting rematch
            await service.acceptRematch(lastPart, 5, Player.ONE);

            // then we should have a part created with playerOne and playerZero switched
            expect(called).toBeTrue();
        }));
        it('should start with the other player when first player was random', fakeAsync(async() => {
            // given a previous match with creator starting
            const lastPart: PartDocument = new PartDocument('partId', {
                lastUpdate: {
                    index: 4,
                    player: 0,
                },
                listMoves: [MOVE_1, MOVE_2],
                playerZero: 'joiner',
                playerOne: 'creator',
                result: MGPResult.VICTORY.value,
                turn: 2,
                typeGame: 'laMarelle',
                beginning: { seconds: 17001025123456, nanoseconds: 680000000 },
                lastMoveTime: { seconds: 2, nanoseconds: 3000000 },
                loser: 'creator',
                winner: 'joiner',
                request: Request.rematchProposed(Player.ZERO),
            });
            const lastGameJoiner: Joiner = {
                candidates: ['joiner'],
                chosenPlayer: 'joiner',
                creator: 'creator',
                firstPlayer: 'RANDOM',
                maximalMoveDuration: 10,
                partStatus: 3,
                partType: PartType.BLITZ.value,
                totalPartDuration: 25,
            };
            spyOn(service, 'sendRequest').and.resolveTo();
            spyOn(joinerService, 'readJoinerById').and.resolveTo(lastGameJoiner);
            let called: boolean = false;
            spyOn(partDAO, 'set').and.callFake(async(_id: string, element: Part) => {
                expect(element.playerZero).toEqual(Utils.getNonNullable(lastPart.data.playerOne));
                expect(element.playerOne).toEqual(Utils.getNonNullable(lastPart.data.playerZero));
                called = true;
            });

            // when accepting rematch
            await service.acceptRematch(lastPart, 5, Player.ONE);

            // then we should have a part created with playerOne and playerZero switched
            expect(called).toBeTrue();
        }));
    });
    describe('updateDBBoard', () => {
        const part: Part = {
            lastUpdate: {
                index: 4,
                player: 0,
            },
            typeGame: 'Quarto',
            playerZero: 'creator',
            playerOne: 'joiner',
            turn: 1,
            listMoves: [MOVE_1],
            request: null,
            result: MGPResult.UNACHIEVED.value,
        };
        beforeEach(() => {
            spyOn(partDAO, 'read').and.resolveTo(MGPOptional.of(part));
            spyOn(partDAO, 'update').and.resolveTo();
            spyOn(partDAO, 'updateAndBumpIndex').and.callThrough();
        });
        it('should add scores to update when scores are present', fakeAsync(async() => {
            // when updating the board with scores
            const scores: [number, number] = [5, 0];
            await service.updateDBBoard('partId', Player.ONE, MOVE_2, [0, 0], scores);
            // then the update should contain the scores
            const expectedUpdate: Partial<Part> = {
                listMoves: [MOVE_1, MOVE_2],
                turn: 2,
                request: null,
                lastMoveTime: firebase.firestore.FieldValue.serverTimestamp(),
                scorePlayerZero: 5,
                scorePlayerOne: 0,
            };
            expect(partDAO.updateAndBumpIndex).toHaveBeenCalledOnceWith('partId', Player.ONE, 4, expectedUpdate);
        }));
        it('should include the draw notification if requested', fakeAsync(async() => {
            // when updating the board to notify of a draw
            await service.updateDBBoard('partId', Player.ONE, MOVE_2, [0, 0], undefined, true);
            // then the result is set to draw in the update
            const expectedUpdate: Partial<Part> = {
                lastUpdate: {
                    index: 5,
                    player: Player.ONE.value,
                },
                listMoves: [MOVE_1, MOVE_2],
                turn: 2,
                request: null,
                lastMoveTime: firebase.firestore.FieldValue.serverTimestamp(),
                result: MGPResult.HARD_DRAW.value,
            };
            expect(partDAO.update).toHaveBeenCalledWith('partId', expectedUpdate);
        }));
    });
    describe('acceptDraw', () => {
        for (const player of [Player.ZERO, Player.ONE]) {
            it('should send AGREED_DRAW_BY_ZERO/ONE when call as ZERO/ONE', async() => {
                // Given any state of service
                spyOn(partDAO, 'update');

                // When calling acceptDraw as the player
                await service.acceptDraw('joinerId', 5, player);

                // Then PartDAO should have been called with the appropriate MGPResult
                const result: number = [
                    MGPResult.AGREED_DRAW_BY_ZERO.value,
                    MGPResult.AGREED_DRAW_BY_ONE.value][player.value];
                expect(partDAO.update).toHaveBeenCalledOnceWith('joinerId', {
                    lastUpdate: {
                        index: 6,
                        player: player.value,
                    },
                    request: null,
                    result,
                });
            });
        }
    });
});
