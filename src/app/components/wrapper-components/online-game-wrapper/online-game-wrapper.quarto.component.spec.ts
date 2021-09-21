import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { OnlineGameWrapperComponent, UpdateType } from './online-game-wrapper.component';
import { JoinerDAO } from 'src/app/dao/JoinerDAO';
import { JoinerDAOMock } from 'src/app/dao/tests/JoinerDAOMock.spec';
import { IJoiner, PartStatus } from 'src/app/domain/ijoiner';
import { JoinerMocks } from 'src/app/domain/JoinerMocks.spec';
import { PartDAO } from 'src/app/dao/PartDAO';
import { PartDAOMock } from 'src/app/dao/tests/PartDAOMock.spec';
import { PartMocks } from 'src/app/domain/PartMocks.spec';
import { JoueursDAO } from 'src/app/dao/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/tests/JoueursDAOMock.spec';
import { ChatDAO } from 'src/app/dao/ChatDAO';
import { ChatDAOMock } from 'src/app/dao/tests/ChatDAOMock.spec';
import { QuartoMove } from 'src/app/games/quarto/QuartoMove';
import { QuartoPartSlice } from 'src/app/games/quarto/QuartoPartSlice';
import { QuartoPiece } from 'src/app/games/quarto/QuartoPiece';
import { Request } from 'src/app/domain/request';
import { IPart, MGPResult, Part } from 'src/app/domain/icurrentpart';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Player } from 'src/app/jscaip/Player';
import { IJoueur } from 'src/app/domain/iuser';
import { AuthenticationServiceMock } from 'src/app/services/tests/AuthenticationService.spec';
import { QuartoComponent } from 'src/app/games/quarto/quarto.component';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { GameService } from 'src/app/services/GameService';
import { AuthUser } from 'src/app/services/AuthenticationService';

describe('OnlineGameWrapperComponent of Quarto:', () => {
    /* Life cycle summary
     * component construction (beforeEach)
     * stage 0
     * ngOnInit (triggered by detectChanges)
     * stage 1: PartCreationComponent appear
     * startGame, launched by user if game was not started yet, or automatically (via partCreationComponent)
     * stage 2: PartCreationComponent dissapear, GameIncluderComponent appear
     * tick(1): the async part of startGame is now finished
     * stage 3: P4Component appear
     * differents scenarios
     */

    let componentTestUtils: ComponentTestUtils<QuartoComponent>;

    let wrapper: OnlineGameWrapperComponent;

    let joinerDAO: JoinerDAOMock;
    let partDAO: PartDAOMock;
    let joueurDAO: JoueursDAOMock;

    const CREATOR: IJoueur = {
        pseudo: 'creator',
        state: 'online',
    };
    const OPPONENT: IJoueur = {
        pseudo: 'firstCandidate',
        displayName: 'firstCandidate',
        email: 'firstCandidate@mgp.team',
        emailVerified: true,
        last_changed: {
            seconds: Date.now() / 1000,
        },
        state: 'online',
    };
    const OBSERVER: IJoueur = {
        pseudo: 'jeanJaja',
        displayName: 'JeanJaja',
        email: 'jeanJaja@mgp.team',
        emailVerified: true,
        last_changed: {
            seconds: Date.now() / 1000,
        },
        state: 'online',
    };
    async function prepareComponent(initialJoiner: IJoiner): Promise<void> {
        partDAO = TestBed.get(PartDAO);
        joinerDAO = TestBed.get(JoinerDAO);
        joueurDAO = TestBed.get(JoueursDAO);
        const chatDAOMock: ChatDAOMock = TestBed.get(ChatDAO);
        await joinerDAO.set('joinerId', initialJoiner);
        await partDAO.set('joinerId', PartMocks.INITIAL.doc);
        await joueurDAO.set('firstCandidateDocId', OPPONENT);
        await joueurDAO.set('creatorDocId', CREATOR);
        await joueurDAO.set(OBSERVER.pseudo, OBSERVER);
        await chatDAOMock.set('joinerId', { messages: [], status: `I don't have a clue` });
        return Promise.resolve();
    }
    async function prepareStartedGameFor(user: AuthUser, shorterGlobalChrono?: boolean): Promise<void> {
        AuthenticationServiceMock.setUser(user);
        componentTestUtils.prepareFixture(OnlineGameWrapperComponent);
        wrapper = componentTestUtils.wrapper as OnlineGameWrapperComponent;
        await prepareComponent(JoinerMocks.INITIAL.doc);
        componentTestUtils.detectChanges();
        tick(1);
        componentTestUtils.bindGameComponent();

        const partCreationId: DebugElement = componentTestUtils.findElement('#partCreation');
        expect(partCreationId)
            .withContext('partCreation id should be present after ngOnInit')
            .toBeTruthy();
        expect(wrapper.partCreation)
            .withContext('partCreation field should also be present')
            .toBeTruthy();
        await joinerDAO.update('joinerId', { candidates: ['firstCandidate'] });
        componentTestUtils.detectChanges();
        await joinerDAO.update('joinerId', {
            partStatus: PartStatus.PART_CREATED.value,
            candidates: ['firstCandidate'],
            chosenPlayer: 'firstCandidate',
        });
        // TODO: replace by real actor action (chooseCandidate)
        componentTestUtils.detectChanges();
        await wrapper.partCreation.proposeConfig();
        componentTestUtils.detectChanges();
        if (shorterGlobalChrono) {
            await joinerDAO.update('joinerId', {
                partStatus: PartStatus.PART_STARTED.value,
                totalPartDuration: 10,
            });
        } else {
            await joinerDAO.update('joinerId', {
                partStatus: PartStatus.PART_STARTED.value,
            });
        }
        await partDAO.update('joinerId', { playerOne: 'firstCandidate', turn: 0, beginning: Date.now() });
        componentTestUtils.detectChanges();
        return Promise.resolve();
    }
    const FIRST_MOVE: QuartoMove = new QuartoMove(0, 3, QuartoPiece.BABB);

    const FIRST_MOVE_ENCODED: number = QuartoMove.encoder.encodeNumber(FIRST_MOVE);

    async function doMove(move: QuartoMove, legal: boolean): Promise<MGPValidation> {
        const slice: QuartoPartSlice = wrapper.gameComponent.rules.node.gamePartSlice as QuartoPartSlice;
        const result: MGPValidation = await wrapper.gameComponent.chooseMove(move, slice, null, null);
        expect(result.isSuccess()).toEqual(legal);
        componentTestUtils.detectChanges();
        tick(1);
        return result;
    }
    async function askTakeBack(): Promise<void> {
        return await componentTestUtils.clickElement('#askTakeBackButton');
    }
    async function acceptTakeBack(): Promise<void> {
        return await componentTestUtils.clickElement('#acceptTakeBackButton');
    }
    async function refuseTakeBack(): Promise<void> {
        return await componentTestUtils.clickElement('#refuseTakeBackButton');
    }
    const receiveRequest: (request: Request) => Promise<void> = async(request: Request) => {
        await partDAO.update('joinerId', { request });
        componentTestUtils.detectChanges();
        tick(1);
    };
    const receiveNewMoves: (moves: number[]) => Promise<void> = async(moves: number[]) => {
        await partDAO.update('joinerId', {
            listMoves: moves,
            turn: moves.length,
            request: null,
            scorePlayerOne: null,
            scorePlayerZero: null,
        });
        componentTestUtils.detectChanges();
        tick();
        return;
    };
    const prepareBoard: (moves: QuartoMove[]) => Promise<void> = async(moves: QuartoMove[]) => {
        await prepareStartedGameFor({ pseudo: 'creator', verified: true });
        tick(1);
        const receivedMoves: number[] = [];
        for (let i: number = 0; i < moves.length; i+=2) {
            const move: QuartoMove = moves[i];
            await doMove(moves[i], true);
            receivedMoves.push(QuartoMove.encoder.encodeNumber(move), QuartoMove.encoder.encodeNumber(moves[i+1]));
            await receiveNewMoves(receivedMoves);
        }
    };
    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame('Quarto');
    }));
    it('Should be able to prepare a started game for creator', fakeAsync(async() => {
        await prepareStartedGameFor({ pseudo: 'creator', verified: true });
        spyOn(wrapper, 'reachedOutOfTime').and.callFake(() => {});
        // Should not even been called but:
        // reachedOutOfTime is called (in test) after tick(1) even though there is still remainingTime
        tick(1);
        expect(wrapper.currentPart.doc.listMoves).toEqual([]);
        expect(wrapper.currentPart.doc.listMoves).toEqual([]);
        expect(wrapper.currentPlayer).toEqual('creator');
        wrapper.pauseCountDownsFor(Player.ZERO);
    }));
    it('Should no longer have PartCreationComponent and QuartoComponent instead', fakeAsync(async() => {
        await prepareStartedGameFor({ pseudo: 'creator', verified: true });
        const partCreationId: DebugElement = componentTestUtils.findElement('#partCreation');
        let quartoTag: DebugElement = componentTestUtils.querySelector('app-quarto');
        expect(partCreationId)
            .withContext('partCreation id should be absent after config accepted')
            .toBeFalsy();
        expect(quartoTag)
            .withContext('quarto tag should be absent before config accepted and async ms finished')
            .toBeFalsy();
        expect(wrapper.partCreation)
            .withContext('partCreation field should be absent after config accepted')
            .toBeFalsy();
        expect(componentTestUtils.getComponent())
            .withContext('gameComponent field should be absent after config accepted and async ms finished')
            .toBeFalsy();
        tick(1);

        quartoTag = componentTestUtils.querySelector('app-quarto');
        expect(quartoTag)
            .withContext('quarto tag should be present after config accepted and async millisec finished')
            .toBeTruthy();
        expect(wrapper.gameComponent)
            .withContext('gameComponent field should also be present after config accepted and async millisec finished')
            .toBeTruthy();
        tick(wrapper.maximalMoveDuration);
    }));
    it('Should allow simple move', fakeAsync(async() => {
        await prepareStartedGameFor({ pseudo: 'creator', verified: true });
        tick(1);

        await doMove(FIRST_MOVE, true);

        expect(wrapper.currentPart.doc.listMoves).toEqual([FIRST_MOVE_ENCODED]);
        expect(wrapper.currentPart.doc.turn).toEqual(1);

        // Receive second move
        await receiveNewMoves([FIRST_MOVE_ENCODED, 166]);

        expect(wrapper.currentPart.doc.turn).toEqual(2);
        expect(wrapper.currentPart.doc.listMoves).toEqual([FIRST_MOVE_ENCODED, 166]);
        tick(wrapper.maximalMoveDuration);
    }));
    it('Opponent accepting take back should move player board backward (one move)', fakeAsync(async() => {
        await prepareStartedGameFor({ pseudo: 'creator', verified: true });
        tick(1);
        // Doing a first move so take back make sens
        await doMove(FIRST_MOVE, true);

        expect(wrapper.gameComponent.rules.node.gamePartSlice.turn).toBe(1);

        // Asking take back
        await askTakeBack();

        // Opponent accept take back
        await partDAO.update('joinerId', {
            request: Request.takeBackAccepted(Player.ONE),
            listMoves: [],
            turn: 0,
        });
        componentTestUtils.detectChanges();
        tick(1);

        expect(wrapper.gameComponent.rules.node.gamePartSlice.turn).toBe(0);

        // Doing another move
        spyOn(partDAO, 'update').and.callThrough();
        const move1: QuartoMove = new QuartoMove(2, 2, QuartoPiece.AAAB);
        await doMove(move1, true);

        expect(partDAO.update).toHaveBeenCalledOnceWith('joinerId', {
            listMoves: [QuartoMove.encoder.encodeNumber(move1)], turn: 1,
            scorePlayerZero: null, scorePlayerOne: null, request: null,
        });
        tick(wrapper.maximalMoveDuration);
    }));
    it('Prepared Game for joiner should allow simple move', fakeAsync(async() => {
        await prepareStartedGameFor({ pseudo: 'firstCandidate', verified: true });
        tick(1);

        // Receive first move
        await receiveNewMoves([FIRST_MOVE_ENCODED]);

        expect(wrapper.currentPart.doc.listMoves).toEqual([FIRST_MOVE_ENCODED]);
        expect(wrapper.currentPart.doc.turn).toEqual(1);

        // Do second move
        const move: QuartoMove = new QuartoMove(1, 1, QuartoPiece.BBBA);
        await doMove(move, true);
        expect(wrapper.currentPart.doc.listMoves)
            .toEqual([FIRST_MOVE_ENCODED, QuartoMove.encoder.encodeNumber(move)]);
        expect(wrapper.currentPart.doc.turn).toEqual(2);

        tick(wrapper.maximalMoveDuration);
    }));
    it('Move should trigger db change', fakeAsync(async() => {
        await prepareStartedGameFor({ pseudo: 'creator', verified: true });
        tick(1);
        spyOn(partDAO, 'update').and.callThrough();
        await doMove(FIRST_MOVE, true);
        expect(wrapper.currentPart.doc.listMoves).toEqual([QuartoMove.encoder.encodeNumber(FIRST_MOVE)]);
        const expectedUpdate: Partial<IPart> = {
            listMoves: [QuartoMove.encoder.encodeNumber(FIRST_MOVE)], turn: 1,
            scorePlayerZero: null, scorePlayerOne: null, request: null,
        };
        expect(partDAO.update).toHaveBeenCalledTimes(1);
        expect(partDAO.update).toHaveBeenCalledWith('joinerId', expectedUpdate );
        tick(wrapper.maximalMoveDuration);
    }));
    it('Victory move from player should notifyVictory', fakeAsync(async() => {
        const move0: QuartoMove = new QuartoMove(0, 3, QuartoPiece.AAAB);
        const move1: QuartoMove = new QuartoMove(1, 3, QuartoPiece.AABA);
        const move2: QuartoMove = new QuartoMove(2, 3, QuartoPiece.BBBB);
        const move3: QuartoMove = new QuartoMove(0, 0, QuartoPiece.AABB);
        await prepareBoard([move0, move1, move2, move3]);
        componentTestUtils.expectElementNotToExist('#winnerIndicator');

        spyOn(partDAO, 'update').and.callThrough();
        const winningMove: QuartoMove = new QuartoMove(3, 3, QuartoPiece.ABAA);
        await doMove(winningMove, true);

        expect(wrapper.gameComponent.rules.node.move.toString()).toBe(winningMove.toString());
        expect(partDAO.update).toHaveBeenCalledTimes(1);
        expect(partDAO.update).toHaveBeenCalledWith('joinerId', {
            listMoves: [move0, move1, move2, move3, winningMove].map(QuartoMove.encoder.encodeNumber),
            turn: 5, scorePlayerZero: null, scorePlayerOne: null, request: null,
            winner: 'creator', loser: 'firstCandidate', result: MGPResult.VICTORY.value,
        });
        expect(componentTestUtils.findElement('#youWonIndicator'))
            .withContext('Component should show who is the winner.')
            .toBeTruthy();
    }));
    describe('Take Back', () => {
        it('Should send take back request when player ask to', fakeAsync(async() => {
            // Doing a first move so take back make sense
            await prepareStartedGameFor({ pseudo: 'creator', verified: true });
            tick(1);
            await doMove(FIRST_MOVE, true);

            // Asking take back
            spyOn(partDAO, 'update').and.callThrough();
            await askTakeBack();

            expect(partDAO.update).toHaveBeenCalledWith('joinerId', {
                request: Request.takeBackAsked(Player.ZERO),
            });

            tick(wrapper.maximalMoveDuration);
        }));
        it('Player accepting take back should move player board backward (two moves)', fakeAsync(async() => {
            await prepareStartedGameFor({ pseudo: 'creator', verified: true });
            tick(1);

            const move1: QuartoMove = new QuartoMove(3, 3, QuartoPiece.BABA);
            const move2: QuartoMove = new QuartoMove(3, 0, QuartoPiece.ABBA);

            await doMove(FIRST_MOVE, true);
            await receiveNewMoves([FIRST_MOVE_ENCODED, QuartoMove.encoder.encodeNumber(move1)]);
            await doMove(move2, true);
            await receiveRequest(Request.takeBackAsked(Player.ONE));
            expect(wrapper.gameComponent.rules.node.gamePartSlice.turn).toBe(3);

            spyOn(partDAO, 'update').and.callThrough();
            await acceptTakeBack();
            spyOn(wrapper.chronoOneGlobal, 'pause').and.callThrough();
            expect(partDAO.update).toHaveBeenCalledWith('joinerId', {
                request: Request.takeBackAccepted(Player.ZERO),
                listMoves: [FIRST_MOVE_ENCODED],
                turn: 1,
            });
            expect(wrapper.gameComponent.rules.node.gamePartSlice.turn).toBe(1);

            const move1Bis: QuartoMove = new QuartoMove(1, 1, QuartoPiece.BAAB);
            // Receiving alternative move of Player.ONE
            await receiveNewMoves([FIRST_MOVE_ENCODED, QuartoMove.encoder.encodeNumber(move1Bis)]);

            tick(wrapper.maximalMoveDuration);
        }));
        it('Should forbid to propose to take back while take back request is waiting', fakeAsync(async() => {
            await prepareStartedGameFor({ pseudo: 'creator', verified: true });
            tick(1);
            componentTestUtils.expectElementNotToExist('#askTakeBackButton');
            await doMove(FIRST_MOVE, true);
            await askTakeBack();
            componentTestUtils.detectChanges();
            componentTestUtils.expectElementNotToExist('#askTakeBackButton');

            tick(wrapper.maximalMoveDuration);
        }));
        it('Should not propose to Player.ONE to take back before his first move', fakeAsync(async() => {
            await prepareStartedGameFor({ pseudo: 'firstCandidate', verified: true });
            tick(1);
            componentTestUtils.expectElementNotToExist('#askTakeBackButton');
            await receiveNewMoves([FIRST_MOVE_ENCODED]);
            componentTestUtils.expectElementNotToExist('#askTakeBackButton');
            await doMove(new QuartoMove(2, 2, QuartoPiece.BBAA), true);
            await askTakeBack();
            componentTestUtils.expectElementNotToExist('#askTakeBackButton');

            tick(wrapper.maximalMoveDuration);
        }));
        it('Should only propose to accept take back when opponent asked', fakeAsync(async() => {
            await prepareStartedGameFor({ pseudo: 'creator', verified: true });
            tick(1);
            const move1: number = QuartoMove.encoder.encodeNumber(new QuartoMove(2, 2, QuartoPiece.BBBA));
            await doMove(FIRST_MOVE, true);
            await receiveNewMoves([FIRST_MOVE_ENCODED, move1]);
            componentTestUtils.expectElementNotToExist('#acceptTakeBackButton');
            await receiveRequest(Request.takeBackAsked(Player.ONE));
            spyOn(partDAO, 'update').and.callThrough();
            await acceptTakeBack();
            componentTestUtils.expectElementNotToExist('#acceptTakeBackButton');
            expect(partDAO.update).toHaveBeenCalledWith('joinerId', {
                request: Request.takeBackAccepted(Player.ZERO),
                turn: 1, listMoves: [FIRST_MOVE_ENCODED],
            });

            tick(wrapper.maximalMoveDuration);
        }));
        it('Should only propose player to refuse take back when opponent asked', fakeAsync(async() => {
            await prepareStartedGameFor({ pseudo: 'creator', verified: true });
            tick(1);
            const move1: number = QuartoMove.encoder.encodeNumber(new QuartoMove(2, 2, QuartoPiece.BBBA));
            await doMove(FIRST_MOVE, true);
            await receiveNewMoves([FIRST_MOVE_ENCODED, move1]);
            componentTestUtils.expectElementNotToExist('#refuseTakeBackButton');
            await receiveRequest(Request.takeBackAsked(Player.ONE));
            spyOn(partDAO, 'update').and.callThrough();
            await refuseTakeBack();
            componentTestUtils.expectElementNotToExist('#refuseTakeBackButton');
            expect(partDAO.update).toHaveBeenCalledWith('joinerId', {
                request: Request.takeBackRefused(Player.ZERO),
            });

            tick(wrapper.maximalMoveDuration);
        }));
        it('Should not allow player to play while take back request is waiting for him', fakeAsync(async() => {
            await prepareStartedGameFor({ pseudo: 'creator', verified: true });
            tick(1);
            await doMove(FIRST_MOVE, true);
            const move1: number = QuartoMove.encoder.encodeNumber(new QuartoMove(2, 2, QuartoPiece.BBBA));
            await receiveNewMoves([FIRST_MOVE_ENCODED, move1]);
            await receiveRequest(Request.takeBackAsked(Player.ONE));

            spyOn(partDAO, 'update').and.callThrough();
            const move2: QuartoMove = new QuartoMove(2, 3, QuartoPiece.ABBA);
            await doMove(move2, true);
            expect(partDAO.update).not.toHaveBeenCalled();

            tick(wrapper.maximalMoveDuration);
        }));
        it('Should cancel take back request when take back requester do a move', fakeAsync(async() => {
            await prepareStartedGameFor({ pseudo: 'creator', verified: true });
            tick(1);
            const move1: number = QuartoMove.encoder.encodeNumber(new QuartoMove(2, 2, QuartoPiece.BBBA));
            const move2: QuartoMove = new QuartoMove(2, 1, QuartoPiece.ABBA);
            await doMove(FIRST_MOVE, true);
            await receiveNewMoves([FIRST_MOVE_ENCODED, move1]);
            await askTakeBack();

            spyOn(partDAO, 'update').and.callThrough();
            await doMove(move2, true);
            expect(partDAO.update).not.toHaveBeenCalledWith('joinerId', {
                listMoves: [FIRST_MOVE_ENCODED, move1, QuartoMove.encoder.encodeNumber(move2)], turn: 3,
                playerZero: null, playerOne: null, request: null,
            });

            tick(wrapper.maximalMoveDuration);
        }));
        it('Should forbid player to ask take back again after refusal', fakeAsync(async() => {
            await prepareStartedGameFor({ pseudo: 'creator', verified: true });
            tick(1);
            await doMove(FIRST_MOVE, true);
            await askTakeBack();
            await receiveRequest(Request.takeBackRefused(Player.ONE));

            componentTestUtils.expectElementNotToExist('#askTakeBackButton');

            tick(wrapper.maximalMoveDuration);
        }));
    });
    describe('Draw', () => {
        async function setup() {
            await prepareStartedGameFor({ pseudo: 'creator', verified: true });
            tick(1);
            componentTestUtils.detectChanges();
        }
        it('should send draw request when player asks to', fakeAsync(async() => {
            await setup();
            spyOn(partDAO, 'update').and.callThrough();

            await componentTestUtils.clickElement('#proposeDrawButton');
            expect(partDAO.update).toHaveBeenCalledWith('joinerId', {
                request: Request.drawProposed(Player.ZERO),
            });

            tick(wrapper.maximalMoveDuration);
        }));
        it('should forbid to propose to draw while draw request is waiting', fakeAsync(async() => {
            await setup();
            await componentTestUtils.clickElement('#proposeDrawButton');
            componentTestUtils.expectElementNotToExist('#proposeDrawButton');

            tick(wrapper.maximalMoveDuration);
        }));
        it('should forbid to propose to draw after refusal', fakeAsync(async() => {
            await setup();
            await componentTestUtils.clickElement('#proposeDrawButton');
            await receiveRequest(Request.drawRefused(Player.ONE));

            tick(1);
            componentTestUtils.expectElementNotToExist('#proposeDrawButton');

            tick(wrapper.maximalMoveDuration);
        }));
        it('should finish the game after accepting a proposed draw', fakeAsync(async() => {
            await setup();
            await receiveRequest(Request.drawProposed(Player.ONE));

            spyOn(partDAO, 'update').and.callThrough();
            await componentTestUtils.clickElement('#acceptDrawButton');

            tick(1);
            expect(partDAO.update).toHaveBeenCalledWith('joinerId', {
                result: MGPResult.DRAW.value,
                request: null,
            });

            tick(wrapper.maximalMoveDuration);
        }));
        it('should finish the game when opponent accepts our proposed draw', fakeAsync(async() => {
            await setup();
            await componentTestUtils.clickElement('#proposeDrawButton');

            spyOn(partDAO, 'update').and.callThrough();
            await receiveRequest(Request.drawAccepted);

            tick(1);
            expect(partDAO.update).toHaveBeenCalledWith('joinerId', {
                result: MGPResult.DRAW.value,
                request: null,
            });
        }));
        it('should send refusal when player asks to', fakeAsync(async() => {
            await setup();
            await receiveRequest(Request.drawProposed(Player.ONE));

            spyOn(partDAO, 'update').and.callThrough();

            await componentTestUtils.clickElement('#refuseDrawButton');
            expect(partDAO.update).toHaveBeenCalledWith('joinerId', {
                request: Request.drawRefused(Player.ZERO),
            });

            tick(wrapper.maximalMoveDuration);
        }));
        it('should only propose to accept/refuse draw when asked', fakeAsync(async() => {
            await setup();
            componentTestUtils.expectElementNotToExist('#acceptDrawButton');
            componentTestUtils.expectElementNotToExist('#refuseDrawButton');
            await receiveRequest(Request.drawProposed(Player.ONE));

            componentTestUtils.expectElementToExist('#acceptDrawButton');
            componentTestUtils.expectElementToExist('#refuseDrawButton');

            tick(wrapper.maximalMoveDuration);
        }));
    });
    describe('Timeouts', () => {
        it(`should stop player's global chrono when local reach end`, fakeAsync(async() => {
            await prepareStartedGameFor({ pseudo: 'creator', verified: true });
            tick(1);
            spyOn(wrapper, 'reachedOutOfTime').and.callThrough();
            spyOn(wrapper.chronoZeroGlobal, 'stop').and.callThrough();
            tick(wrapper.maximalMoveDuration);
            expect(wrapper.reachedOutOfTime).toHaveBeenCalledOnceWith(0);
            expect(wrapper.chronoZeroGlobal.stop).toHaveBeenCalled();
        }));
        it(`should stop player's local chrono when global chrono reach end`, fakeAsync(async() => {
            await prepareStartedGameFor({ pseudo: 'creator', verified: true }, true);
            tick(1);
            spyOn(wrapper, 'reachedOutOfTime').and.callThrough();
            spyOn(wrapper.chronoZeroLocal, 'stop').and.callThrough();
            tick(wrapper.maximalMoveDuration);
            expect(wrapper.reachedOutOfTime).toHaveBeenCalledOnceWith(0);
            expect(wrapper.chronoZeroLocal.stop).toHaveBeenCalled();
        }));
        it(`should stop ennemy's global chrono when local reach end`, fakeAsync(async() => {
            await prepareStartedGameFor({ pseudo: 'creator', verified: true });
            tick(1);
            await doMove(FIRST_MOVE, true);
            spyOn(wrapper, 'reachedOutOfTime').and.callThrough();
            spyOn(wrapper.chronoOneGlobal, 'stop').and.callThrough();
            tick(wrapper.maximalMoveDuration);
            expect(wrapper.reachedOutOfTime).toHaveBeenCalledOnceWith(1);
            expect(wrapper.chronoOneGlobal.stop).toHaveBeenCalled();
        }));
        it(`should stop ennemy's local chrono when global chrono reach end`, fakeAsync(async() => {
            await prepareStartedGameFor({ pseudo: 'creator', verified: true }, true);
            tick(1);
            await doMove(FIRST_MOVE, true);
            spyOn(wrapper, 'reachedOutOfTime').and.callThrough();
            spyOn(wrapper.chronoOneLocal, 'stop').and.callThrough();
            tick(wrapper.maximalMoveDuration);
            expect(wrapper.reachedOutOfTime).toHaveBeenCalledOnceWith(1);
            expect(wrapper.chronoOneLocal.stop).toHaveBeenCalled();
        }));
    });
    describe('User "handshake"', () => {
        it(`Should make opponent's name lightgrey when he is absent`, fakeAsync(async() => {
            await prepareStartedGameFor({ pseudo: 'creator', verified: true });
            tick(1);
            expect(wrapper.getPlayerNameFontColor(1)).toEqual({ color: 'black' });
            joueurDAO.update('firstCandidateDocId', { state: 'offline' });
            componentTestUtils.detectChanges();
            tick();
            expect(wrapper.getPlayerNameFontColor(1)).toBe(wrapper.OFFLINE_FONT_COLOR);
            tick(wrapper.maximalMoveDuration);
        }));
    });
    it('Should not allow player to move after resigning', fakeAsync(async() => {
        await prepareStartedGameFor({ pseudo: 'creator', verified: true });
        tick(1);
        await doMove(FIRST_MOVE, true);
        const move1: number = QuartoMove.encoder.encodeNumber(new QuartoMove(2, 2, QuartoPiece.BBBA));
        await receiveNewMoves([FIRST_MOVE_ENCODED, move1]);
        await componentTestUtils.clickElement('#resignButton');

        spyOn(partDAO, 'update').and.callThrough();
        const move2: QuartoMove = new QuartoMove(2, 3, QuartoPiece.ABBA);
        await doMove(move2, false);
        expect(partDAO.update).not.toHaveBeenCalled();

        tick(wrapper.maximalMoveDuration);
    }));
    it('Should display when the opponent resigned', fakeAsync(async() => {
        await prepareStartedGameFor({ pseudo: 'creator', verified: true });
        tick(1);
        await doMove(FIRST_MOVE, true);
        await TestBed.inject(GameService).resign('joinerId', CREATOR.pseudo, OPPONENT.pseudo);
        expect(componentTestUtils.findElement('#resignIndicator'));
    }));
    it('Should allow player to pass when gameComponent allows it', fakeAsync(async() => {
        await prepareStartedGameFor({ pseudo: 'creator', verified: true });
        tick(1);
        componentTestUtils.expectElementNotToExist('#passButton');

        wrapper.gameComponent.canPass = true;
        wrapper.gameComponent['pass'] = async() => {
            return MGPValidation.SUCCESS;
        };
        componentTestUtils.detectChanges();

        await componentTestUtils.clickElement('#passButton');

        tick(wrapper.maximalMoveDuration);
    }));
    describe('getUpdateType', () => {
        it('Should recognize move as move, even when after a request removal', fakeAsync(async() => {
            await prepareStartedGameFor({ pseudo: 'creator', verified: true });
            wrapper.currentPart = new Part({
                typeGame: 'P4',
                playerZero: 'who is it from who cares',
                turn: 3,
                listMoves: [1, 2, 3],
                result: MGPResult.UNACHIEVED.value,
                playerOne: 'Sir Meryn Trant',
                beginning: 1234,
                request: Request.takeBackAccepted(Player.ZERO),
            });
            const update: Part = new Part({
                typeGame: 'P4',
                playerZero: 'who is it from who cares',
                turn: 4,
                listMoves: [1, 2, 3, 4],
                result: MGPResult.UNACHIEVED.value,
                playerOne: 'Sir Meryn Trant',
                beginning: 1234,
                // And obviously, no longer the previous request code
            });
            expect(wrapper.getUpdateType(update)).toBe(UpdateType.MOVE);
            tick(wrapper.maximalMoveDuration + 1);
        }));
        it('Should recognize update as move, even if score just added itself', fakeAsync(async() => {
            await prepareStartedGameFor({ pseudo: 'creator', verified: true });
            wrapper.currentPart = new Part({
                typeGame: 'P4',
                playerZero: 'who is it from who cares',
                turn: 0,
                listMoves: [],
                result: MGPResult.UNACHIEVED.value,
                playerOne: 'Sir Meryn Trant',
                beginning: 1234,
            });
            const update: Part = new Part({
                typeGame: 'P4',
                playerZero: 'who is it from who cares',
                turn: 1,
                listMoves: [1],
                result: MGPResult.UNACHIEVED.value,
                playerOne: 'Sir Meryn Trant',
                beginning: 1234,
                // And obviously, the added score
                scorePlayerZero: 0,
                scorePlayerOne: 0,
            });
            expect(wrapper.getUpdateType(update)).toBe(UpdateType.MOVE);
            tick(wrapper.maximalMoveDuration + 1);
        }));
        it('Should recognize update as move, even if score was updated', fakeAsync(async() => {
            await prepareStartedGameFor({ pseudo: 'creator', verified: true });
            wrapper.currentPart = new Part({
                typeGame: 'P4',
                playerZero: 'who is it from who cares',
                turn: 0,
                listMoves: [],
                result: MGPResult.UNACHIEVED.value,
                playerOne: 'Sir Meryn Trant',
                beginning: 1234,
                scorePlayerZero: 1,
                scorePlayerOne: 1,
            });
            const update: Part = new Part({
                typeGame: 'P4',
                playerZero: 'who is it from who cares',
                turn: 1,
                listMoves: [1],
                result: MGPResult.UNACHIEVED.value,
                playerOne: 'Sir Meryn Trant',
                beginning: 1234,
                // And obviously, the score update
                scorePlayerZero: 4,
                scorePlayerOne: 1,
            });
            expect(wrapper.getUpdateType(update)).toBe(UpdateType.MOVE);
            tick(wrapper.maximalMoveDuration + 1);
        }));
    });
    describe('rematch', () => {
        it('should show propose button only when game is ended', fakeAsync(async() => {
            // given a game that is not finished
            await prepareStartedGameFor({ pseudo: 'creator', verified: true });
            tick(1);
            componentTestUtils.detectChanges();
            componentTestUtils.expectElementNotToExist('#proposeRematchButton');

            // when it is finished
            await componentTestUtils.expectInterfaceClickSuccess('#resignButton');
            tick(1);

            // then it should allow to propose rematch
            componentTestUtils.expectElementToExist('#proposeRematchButton');
        }));
        it('should sent proposal request when proposing', fakeAsync(async() => {
            // given an ended game
            await prepareStartedGameFor({ pseudo: 'creator', verified: true });
            tick(1);
            componentTestUtils.detectChanges();
            await componentTestUtils.expectInterfaceClickSuccess('#resignButton');
            tick(1);

            // when the propose rematch button is clicked
            const wrapper: OnlineGameWrapperComponent = componentTestUtils.wrapper as OnlineGameWrapperComponent;
            spyOn(wrapper.gameService, 'proposeRematch').and.callThrough();
            await componentTestUtils.expectInterfaceClickSuccess('#proposeRematchButton');

            // then the gameService must be called
            expect(wrapper.gameService.proposeRematch).toHaveBeenCalledOnceWith('joinerId', Player.ZERO);
        }));
        it('should show accept/refuse button when proposition has been sent', fakeAsync(async() => {
            // given an ended game
            await prepareStartedGameFor({ pseudo: 'creator', verified: true });
            tick(1);
            componentTestUtils.detectChanges();
            await componentTestUtils.expectInterfaceClickSuccess('#resignButton');
            tick(1);

            // when request is received
            componentTestUtils.expectElementNotToExist('#acceptRematchButton');
            await receiveRequest(Request.rematchProposed(Player.ONE));

            // then accept/refuse buttons must be shown
            componentTestUtils.expectElementToExist('#acceptRematchButton');
        }));
        it('should sent accepting request when user accept rematch', fakeAsync(async() => {
            // give a part with rematch request send by opponent
            await prepareStartedGameFor({ pseudo: 'creator', verified: true });
            tick(1);
            componentTestUtils.detectChanges();
            await componentTestUtils.expectInterfaceClickSuccess('#resignButton');
            tick(1);
            await receiveRequest(Request.rematchProposed(Player.ONE));

            // when accepting it
            const wrapper: OnlineGameWrapperComponent = componentTestUtils.wrapper as OnlineGameWrapperComponent;
            spyOn(wrapper.gameService, 'acceptRematch').and.callThrough();
            await componentTestUtils.expectInterfaceClickSuccess('#acceptRematchButton');

            // then it should have called acceptRematch
            expect(wrapper.gameService.acceptRematch).toHaveBeenCalledTimes(1);
        }));
        it('should redirect to new part when rematch is accepted', fakeAsync(async() => {
            // give a part with rematch request send by you
            await prepareStartedGameFor({ pseudo: 'creator', verified: true });
            tick(1);
            componentTestUtils.detectChanges();
            await componentTestUtils.expectInterfaceClickSuccess('#resignButton');
            tick(1);
            await componentTestUtils.expectInterfaceClickSuccess('#proposeRematchButton');

            // when opponent accept it
            spyOn(componentTestUtils.wrapper.router, 'navigate');
            await receiveRequest(Request.rematchAccepted('Quarto', 'nextPartId'));

            // then it should redirect to new part
            const first: string = '/nextGameLoading';
            const second: string = '/play/Quarto/nextPartId';
            expect(componentTestUtils.wrapper.router.navigate).toHaveBeenCalledWith([first]);
            expect(componentTestUtils.wrapper.router.navigate).toHaveBeenCalledWith([second]);
        }));
    });
    describe('Non Player Experience', () => {
        it('Should not be able to do anything', fakeAsync(async() => {
            await prepareStartedGameFor({ pseudo: OBSERVER.pseudo, verified: true });
            spyOn(componentTestUtils.wrapper as OnlineGameWrapperComponent, 'startCountDownFor').and.callFake(() => null);

            const forbiddenFunctionNames: string[] = [
                'canProposeDraw',
                'canAskTakeBack',
                'acceptRematch',
                'proposeRematch',
                'canResign',
            ];
            for (const name of forbiddenFunctionNames) {
                expect(componentTestUtils.wrapper[name]()).toBeFalse();
            }
            tick(wrapper.maximalMoveDuration);
        }));
    });
});
