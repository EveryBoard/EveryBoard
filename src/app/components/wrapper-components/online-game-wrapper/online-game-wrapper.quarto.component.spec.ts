import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { By } from '@angular/platform-browser';

import { of } from 'rxjs';

import { AppModule } from 'src/app/app.module';
import { OnlineGameWrapperComponent, UpdateType } from './online-game-wrapper.component';

import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';

import { JoinerDAO } from 'src/app/dao/joiner/JoinerDAO';
import { JoinerDAOMock } from 'src/app/dao/joiner/JoinerDAOMock';

import { IJoiner } from 'src/app/domain/ijoiner';
import { JoinerMocks } from 'src/app/domain/JoinerMocks';
import { PartDAO } from 'src/app/dao/part/PartDAO';
import { PartDAOMock } from 'src/app/dao/part/PartDAOMock';
import { PartMocks } from 'src/app/domain/PartMocks';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { ChatDAO } from 'src/app/dao/chat/ChatDAO';
import { ChatDAOMock } from 'src/app/dao/chat/ChatDAOMock';
import { QuartoMove } from 'src/app/games/quarto/quarto-move/QuartoMove';
import { QuartoPartSlice } from 'src/app/games/quarto/QuartoPartSlice';
import { QuartoPiece } from 'src/app/games/quarto/QuartoPiece';
import { Request } from 'src/app/domain/request';
import { ICurrentPart, MGPResult, Part, PICurrentPart } from 'src/app/domain/icurrentpart';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';
import { RouterTestingModule } from '@angular/router/testing';
import { Player } from 'src/app/jscaip/player/Player';
import { IJoueur } from 'src/app/domain/iuser';

const activatedRouteStub: unknown = {
    snapshot: {
        paramMap: {
            get: (str: string) => {
                if (str === 'id') return 'joinerId';
                if (str === 'compo') return 'Quarto';
            },
        },
    },
};
class AuthenticationServiceMock {
    public static USER: {pseudo: string, verified: boolean};

    public getJoueurObs() {
        return of({
            pseudo: AuthenticationServiceMock.USER.pseudo,
            verified: AuthenticationServiceMock.USER.verified,
        });
    }
    public getAuthenticatedUser(): {pseudo: string, verified: boolean} {
        return {
            pseudo: AuthenticationServiceMock.USER.pseudo,
            verified: AuthenticationServiceMock.USER.verified,
        };
    }
}

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

    let fixture: ComponentFixture<OnlineGameWrapperComponent>;

    let debugElement: DebugElement;

    let component: OnlineGameWrapperComponent;

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

    const prepareComponent: (initialJoiner: IJoiner) => Promise<void> = async(initialJoiner: IJoiner) => {
        fixture = TestBed.createComponent(OnlineGameWrapperComponent);
        debugElement = fixture.debugElement;
        partDAO = TestBed.get(PartDAO);
        joinerDAO = TestBed.get(JoinerDAO);
        joueurDAO = TestBed.get(JoueursDAO);
        const chatDAOMock: ChatDAOMock = TestBed.get(ChatDAO);
        component = debugElement.componentInstance;
        await joinerDAO.set('joinerId', initialJoiner);
        await partDAO.set('joinerId', PartMocks.INITIAL.copy());
        await joueurDAO.set('firstCandidateDocId', OPPONENT);
        await joueurDAO.set('creatorDocId', CREATOR);
        await chatDAOMock.set('joinerId', { messages: [], status: 'I don\'t have a clue' });
        return Promise.resolve();
    };
    const prepareStartedGameFor: (user: {pseudo: string, verified: boolean},
                                  shorterGlobalChrono?: boolean) => Promise<void> =
    async(user: {pseudo: string, verified: boolean}, shorterGlobalChrono?: boolean) => {
        AuthenticationServiceMock.USER = user;
        await prepareComponent(JoinerMocks.INITIAL.copy());
        fixture.detectChanges();
        tick(1);

        const partCreationId: DebugElement = fixture.debugElement.query(By.css('#partCreation'));
        expect(partCreationId).toBeTruthy('partCreation id should be present after ngOnInit');
        expect(component.partCreation).toBeTruthy('partCreation field should also be present');
        await joinerDAO.update('joinerId', { candidatesNames: ['firstCandidate'] });
        fixture.detectChanges();
        await fixture.whenStable();
        await joinerDAO.update('joinerId', { partStatus: 1, candidatesNames: [], chosenPlayer: 'firstCandidate' });
        // TODO: replace by real actor action (chooseCandidate)
        fixture.detectChanges();
        await component.partCreation.proposeConfig();
        fixture.detectChanges();
        if (shorterGlobalChrono) {
            await joinerDAO.update('joinerId', { partStatus: 3, maximalMoveDuration: 120 });
        } else {
            await joinerDAO.update('joinerId', { partStatus: 3 });
        }
        await partDAO.update('joinerId', { playerOne: 'firstCandidate', turn: 0, beginning: Date.now() });
        fixture.detectChanges();
        return Promise.resolve();
    };
    const FIRST_MOVE: QuartoMove = new QuartoMove(0, 3, QuartoPiece.BABB);

    const FIRST_MOVE_ENCODED: number = FIRST_MOVE.encode();

    const doMove: (move: QuartoMove, legal: boolean) => Promise<MGPValidation> =
    async(move: QuartoMove, legal: boolean) => {
        const slice: QuartoPartSlice = component.gameComponent.rules.node.gamePartSlice as QuartoPartSlice;
        const result: MGPValidation = await component.gameComponent.chooseMove(move, slice, null, null);
        expect(result.isSuccess()).toEqual(legal);
        fixture.detectChanges();
        tick(1);
        return result;
    };
    const askTakeBack: () => Promise<boolean> = async() => {
        return await clickElement('#askTakeBackButton');
    };
    const acceptTakeBack: () => Promise<boolean> = async() => {
        return await clickElement('#acceptTakeBackButton');
    };
    const refuseTakeBack: () => Promise<boolean> = async() => {
        return await clickElement('#refuseTakeBackButton');
    };
    const receiveRequest: (request: Request) => Promise<void> = async(request: Request) => {
        await partDAO.update('joinerId', { request });
        fixture.detectChanges(); tick(1);
    };
    const receiveNewMoves: (moves: number[]) => Promise<void> = async(moves: number[]) => {
        await partDAO.update('joinerId', {
            listMoves: moves,
            turn: moves.length,
            request: null,
            scorePlayerOne: null,
            scorePlayerZero: null,
        });
        fixture.detectChanges();
        tick();
        return;
    };
    const getElement: (elementName: string) => DebugElement = (elementName: string) => {
        return debugElement.query(By.css(elementName));
    };
    const clickElement: (elementName: string) => Promise<boolean> = async(elementName: string) => {
        const element: DebugElement = getElement(elementName);
        if (element == null) {
            return false;
        } else {
            element.triggerEventHandler('click', null);
            await fixture.whenStable();
            fixture.detectChanges();
            return true;
        }
    };
    function expectElementNotToExist(elementName: string): void {
        expect(getElement(elementName)).toBeNull();
    }
    function expectElementToExist(elementName: string): void {
        expect(getElement(elementName)).toBeTruthy();
    }
    const prepareBoard: (moves: QuartoMove[]) => Promise<void> = async(moves: QuartoMove[]) => {
        await prepareStartedGameFor({ pseudo: 'creator', verified: true });
        tick(1);
        const receivedMoves: number[] = [];
        for (let i: number = 0; i < moves.length; i+=2) {
            const move: QuartoMove = moves[i];
            await doMove(moves[i], true);
            receivedMoves.push(move.encode(), moves[i+1].encode());
            await receiveNewMoves(receivedMoves);
        }
    };
    beforeEach(fakeAsync(async() => {
        await TestBed.configureTestingModule({
            imports: [
                AppModule,
                RouterTestingModule.withRoutes([
                    { path: 'play', component: OnlineGameWrapperComponent }]),
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: ActivatedRoute, useValue: activatedRouteStub },
                { provide: JoinerDAO, useClass: JoinerDAOMock },
                { provide: PartDAO, useClass: PartDAOMock },
                { provide: JoueursDAO, useClass: JoueursDAOMock },
                { provide: ChatDAO, useClass: ChatDAOMock },
                { provide: AuthenticationService, useClass: AuthenticationServiceMock },
            ],
        }).compileComponents();
    }));
    it('Should be able to prepare a started game for creator', fakeAsync(async() => {
        await prepareStartedGameFor({ pseudo: 'creator', verified: true });
        spyOn(component, 'reachedOutOfTime').and.callFake(() => {});
        // Should not even been called but:
        // reachedOutOfTime is called (in test) after tick(1) even though there is still remainingTime
        tick(1);
        expect(component.currentPart.copy().listMoves).toEqual([]);
        expect(component.currentPart.copy().listMoves).toEqual([]);
        expect(component.currentPlayer).toEqual('creator');
        component.pauseCountDownsFor(Player.ZERO);
    }));
    it('Should no longer have PartCreationComponent and QuartoComponent instead', fakeAsync(async() => {
        await prepareStartedGameFor({ pseudo: 'creator', verified: true });
        const partCreationId: DebugElement = getElement('#partCreation');
        let quartoTag: DebugElement = fixture.debugElement.nativeElement.querySelector('app-quarto');
        expect(partCreationId).toBeFalsy('partCreation id should be absent after config accepted');
        expect(quartoTag).toBeFalsy('quarto tag should be absent before config accepted and async ms finished');
        expect(component.partCreation).toBeFalsy('partCreation field should be absent after config accepted');
        expect(component.gameComponent)
            .toBeFalsy('gameComponent field should be absent after config accepted and async ms finished');

        tick(1);

        quartoTag = fixture.debugElement.nativeElement.querySelector('app-quarto');
        expect(quartoTag).toBeTruthy('quarto tag should be present after config accepted and async millisec finished');
        expect(component.gameComponent)
            .toBeTruthy('gameComponent field should also be present after config accepted and async millisec finished');
        tick(component.maximalMoveDuration);
    }));
    it('Should allow simple move', fakeAsync(async() => {
        await prepareStartedGameFor({ pseudo: 'creator', verified: true });
        tick(1);

        await doMove(FIRST_MOVE, true);

        expect(component.currentPart.copy().listMoves).toEqual([FIRST_MOVE_ENCODED]);
        expect(component.currentPart.copy().turn).toEqual(1);

        // Receive second move
        await receiveNewMoves([FIRST_MOVE_ENCODED, 166]);

        expect(component.currentPart.copy().turn).toEqual(2);
        expect(component.currentPart.copy().listMoves).toEqual([FIRST_MOVE_ENCODED, 166]);
        tick(component.maximalMoveDuration);
    }));
    it('Opponent accepting take back should move player board backward (one move)', fakeAsync(async() => {
        await prepareStartedGameFor({ pseudo: 'creator', verified: true });
        tick(1);
        // Doing a first move so take back make sens
        await doMove(FIRST_MOVE, true);

        expect(component.gameComponent.rules.node.gamePartSlice.turn).toBe(1);

        // Asking take back
        await askTakeBack();

        // Opponent accept take back
        await partDAO.update('joinerId', {
            request: Request.takeBackAccepted(Player.ONE),
            listMoves: [],
            turn: 0,
        });
        fixture.detectChanges();
        tick(1);

        expect(component.gameComponent.rules.node.gamePartSlice.turn).toBe(0);

        // Doing another move
        spyOn(partDAO, 'update').and.callThrough();
        const move1: QuartoMove = new QuartoMove(2, 2, QuartoPiece.AAAB);
        await doMove(move1, true);

        expect(partDAO.update).toHaveBeenCalledOnceWith('joinerId', {
            listMoves: [move1.encode()], turn: 1,
            scorePlayerZero: null, scorePlayerOne: null, request: null,
        });
        tick(component.maximalMoveDuration);
    }));
    it('Prepared Game for joiner should allow simple move', fakeAsync(async() => {
        await prepareStartedGameFor({ pseudo: 'firstCandidate', verified: true });
        tick(1);

        // Receive first move
        await receiveNewMoves([FIRST_MOVE_ENCODED]);

        expect(component.currentPart.copy().listMoves).toEqual([FIRST_MOVE_ENCODED]);
        expect(component.currentPart.copy().turn).toEqual(1);

        // Do second move
        const move: QuartoMove = new QuartoMove(1, 1, QuartoPiece.BBBA);
        await doMove(move, true);
        expect(component.currentPart.copy().listMoves).toEqual([FIRST_MOVE_ENCODED, move.encode()]);
        expect(component.currentPart.copy().turn).toEqual(2);

        tick(component.maximalMoveDuration);
    }));
    it('Move should trigger db change', fakeAsync(async() => {
        await prepareStartedGameFor({ pseudo: 'creator', verified: true });
        tick(1);
        spyOn(partDAO, 'update').and.callThrough();
        await doMove(FIRST_MOVE, true);
        expect(component.currentPart.copy().listMoves).toEqual([FIRST_MOVE.encode()]);
        const expectedUpdate: PICurrentPart = {
            listMoves: [FIRST_MOVE.encode()], turn: 1,
            scorePlayerZero: null, scorePlayerOne: null, request: null,
        };
        expect(partDAO.update).toHaveBeenCalledTimes(1);
        expect(partDAO.update).toHaveBeenCalledWith('joinerId', expectedUpdate );
        tick(component.maximalMoveDuration);
    }));
    it('Victory move from player should notifyVictory', fakeAsync(async() => {
        const move0: QuartoMove = new QuartoMove(0, 3, QuartoPiece.AAAB);
        const move1: QuartoMove = new QuartoMove(1, 3, QuartoPiece.AABA);
        const move2: QuartoMove = new QuartoMove(2, 3, QuartoPiece.BBBB);
        const move3: QuartoMove = new QuartoMove(0, 0, QuartoPiece.AABB);
        await prepareBoard([move0, move1, move2, move3]);
        expect(getElement('#winnerIndicator')).toBeFalsy('Element should not exist yet');

        spyOn(partDAO, 'update').and.callThrough();
        const winningMove: QuartoMove = new QuartoMove(3, 3, QuartoPiece.ABAA);
        await doMove(winningMove, true);

        expect(component.gameComponent.rules.node.move.toString()).toBe(winningMove.toString());
        expect(partDAO.update).toHaveBeenCalledTimes(1);
        expect(partDAO.update).toHaveBeenCalledWith('joinerId', {
            listMoves: [move0.encode(), move1.encode(), move2.encode(), move3.encode(), winningMove.encode()],
            turn: 5, scorePlayerZero: null, scorePlayerOne: null, request: null,
            winner: 'creator', result: MGPResult.VICTORY.toInterface(),
        });
        await fixture.whenStable();
        expect(getElement('#youWonIndicator')).toBeTruthy('Component should show who is the winner.');
    }));
    describe('Take Back', () => {
        it('Should send take back request when player ask to', fakeAsync(async() => {
            // Doing a first move so take back make sens
            await prepareStartedGameFor({ pseudo: 'creator', verified: true });
            tick(1);

            await doMove(FIRST_MOVE, true);

            // Asking take back
            spyOn(partDAO, 'update').and.callThrough();

            await askTakeBack();
            expect(partDAO.update).toHaveBeenCalledWith('joinerId', {
                request: Request.takeBackAsked(Player.ZERO),
            });

            tick(component.maximalMoveDuration);
        }));
        it('Player accepting take back should move player board backward (dtwo moves)', fakeAsync(async() => {
            await prepareStartedGameFor({ pseudo: 'creator', verified: true });
            tick(1);

            const move1: QuartoMove = new QuartoMove(3, 3, QuartoPiece.BABA);
            const move2: QuartoMove = new QuartoMove(3, 0, QuartoPiece.ABBA);

            await doMove(FIRST_MOVE, true);
            await receiveNewMoves([FIRST_MOVE_ENCODED, move1.encode()]);
            await doMove(move2, true);
            await receiveRequest(Request.takeBackAsked(Player.ONE));
            expect(component.gameComponent.rules.node.gamePartSlice.turn).toBe(3);

            spyOn(partDAO, 'update').and.callThrough();
            await acceptTakeBack();
            spyOn(component.chronoOneGlobal, 'pause').and.callThrough();
            expect(partDAO.update).toHaveBeenCalledWith('joinerId', {
                request: Request.takeBackAccepted(Player.ZERO),
                listMoves: [FIRST_MOVE_ENCODED],
                turn: 1,
            });
            expect(component.gameComponent.rules.node.gamePartSlice.turn).toBe(1);

            const move1Bis: QuartoMove = new QuartoMove(1, 1, QuartoPiece.BAAB);
            // Receiving alternative move of Player.ONE
            await receiveNewMoves([FIRST_MOVE_ENCODED, move1Bis.encode()]);

            tick(component.maximalMoveDuration);
        }));
        it('Should forbid to propose to take back while take back request is waiting', fakeAsync(async() => {
            await prepareStartedGameFor({ pseudo: 'creator', verified: true });
            tick(1);
            expect(await askTakeBack()).toBeFalse();
            await doMove(FIRST_MOVE, true);
            expect(await askTakeBack()).toBeTrue();
            fixture.detectChanges();
            expect(await askTakeBack()).toBeFalse();

            tick(component.maximalMoveDuration);
        }));
        it('Should not propose to Player.ONE to take back before his first move', fakeAsync(async() => {
            await prepareStartedGameFor({ pseudo: 'firstCandidate', verified: true });
            tick(1);
            expect(await askTakeBack()).toBeFalse();
            await receiveNewMoves([FIRST_MOVE_ENCODED]);
            expect(await askTakeBack()).toBeFalse();
            await doMove(new QuartoMove(2, 2, QuartoPiece.BBAA), true);
            expect(await askTakeBack()).toBeTrue();
            expect(await askTakeBack()).toBeFalse();

            tick(component.maximalMoveDuration);
        }));
        it('Should only propose to accept take back when opponent asked', fakeAsync(async() => {
            await prepareStartedGameFor({ pseudo: 'creator', verified: true });
            tick(1);
            const move1: number = new QuartoMove(2, 2, QuartoPiece.BBBA).encode();
            await doMove(FIRST_MOVE, true);
            await receiveNewMoves([FIRST_MOVE_ENCODED, move1]);
            expect(await acceptTakeBack()).toBeFalse();
            await receiveRequest(Request.takeBackAsked(Player.ONE));
            spyOn(partDAO, 'update').and.callThrough();
            expect(await acceptTakeBack()).toBeTrue();
            expect(await acceptTakeBack()).toBeFalse();
            expect(partDAO.update).toHaveBeenCalledWith('joinerId', {
                request: Request.takeBackAccepted(Player.ZERO),
                turn: 1, listMoves: [FIRST_MOVE_ENCODED],
            });

            tick(component.maximalMoveDuration);
        }));
        it('Should only propose player to refuse take back when opponent asked', fakeAsync(async() => {
            await prepareStartedGameFor({ pseudo: 'creator', verified: true });
            tick(1);
            const move1: number = new QuartoMove(2, 2, QuartoPiece.BBBA).encode();
            await doMove(FIRST_MOVE, true);
            await receiveNewMoves([FIRST_MOVE_ENCODED, move1]);
            expect(await refuseTakeBack()).toBeFalse();
            await receiveRequest(Request.takeBackAsked(Player.ONE));
            spyOn(partDAO, 'update').and.callThrough();
            expect(await refuseTakeBack()).toBeTrue();
            expect(await refuseTakeBack()).toBeFalse();
            expect(partDAO.update).toHaveBeenCalledWith('joinerId', {
                request: Request.takeBackRefused(Player.ZERO),
            });

            tick(component.maximalMoveDuration);
        }));
        it('Should not allow player to play while take back request is waiting for him', fakeAsync(async() => {
            await prepareStartedGameFor({ pseudo: 'creator', verified: true });
            tick(1);
            await doMove(FIRST_MOVE, true);
            const move1: number = new QuartoMove(2, 2, QuartoPiece.BBBA).encode();
            await receiveNewMoves([FIRST_MOVE_ENCODED, move1]);
            await receiveRequest(Request.takeBackAsked(Player.ONE));

            spyOn(partDAO, 'update').and.callThrough();
            const move2: QuartoMove = new QuartoMove(2, 3, QuartoPiece.ABBA);
            await doMove(move2, true);
            expect(partDAO.update).not.toHaveBeenCalled();

            tick(component.maximalMoveDuration);
        }));
        it('Should cancel take back request when take back requester do a move', fakeAsync(async() => {
            await prepareStartedGameFor({ pseudo: 'creator', verified: true });
            tick(1);
            const move1: number = new QuartoMove(2, 2, QuartoPiece.BBBA).encode();
            const move2: QuartoMove = new QuartoMove(2, 1, QuartoPiece.ABBA);
            await doMove(FIRST_MOVE, true);
            await receiveNewMoves([FIRST_MOVE_ENCODED, move1]);
            await askTakeBack();

            spyOn(partDAO, 'update').and.callThrough();
            await doMove(move2, true);
            expect(partDAO.update).not.toHaveBeenCalledWith('joinerId', {
                listMoves: [FIRST_MOVE_ENCODED, move1, move2.encode()], turn: 3,
                playerZero: null, playerOne: null, request: null,
            });

            tick(component.maximalMoveDuration);
        }));
        it('Should forbid player to ask take back again after refusal', fakeAsync(async() => {
            await prepareStartedGameFor({ pseudo: 'creator', verified: true });
            tick(1);
            await doMove(FIRST_MOVE, true);
            await askTakeBack();
            await receiveRequest(Request.takeBackRefused(Player.ONE));

            expect(await askTakeBack()).toBeFalse();

            tick(component.maximalMoveDuration);
        }));
    });
    describe('Draw', () => {
        async function setup() {
            await prepareStartedGameFor({ pseudo: 'creator', verified: true });
            tick(1);
            fixture.detectChanges();
        }
        it('should send draw request when player asks to', fakeAsync(async() => {
            await setup();
            spyOn(partDAO, 'update').and.callThrough();

            expect(await clickElement('#proposeDrawButton')).toBeTrue();
            expect(partDAO.update).toHaveBeenCalledWith('joinerId', {
                request: Request.drawProposed(Player.ZERO),
            });

            tick(component.maximalMoveDuration);
        }));
        it('should forbid to propose to draw while draw request is waiting', fakeAsync(async() => {
            await setup();
            expect(await clickElement('#proposeDrawButton')).toBeTrue();
            expect(await clickElement('#proposeDrawButton')).toBeFalse();

            tick(component.maximalMoveDuration);
        }));
        it('should forbid to propose to draw after refusal', fakeAsync(async() => {
            await setup();
            expect(await clickElement('#proposeDrawButton')).toBeTrue();
            await receiveRequest(Request.drawRefused(Player.ONE));

            tick(1);
            expect(await clickElement('#proposeDrawButton')).toBeFalse();

            tick(component.maximalMoveDuration);
        }));
        it('should finish the game after accepting a proposed draw', fakeAsync(async() => {
            await setup();
            await receiveRequest(Request.drawProposed(Player.ONE));

            spyOn(partDAO, 'update').and.callThrough();
            expect(await clickElement('#acceptDrawButton')).toBeTrue();

            tick(1);
            expect(partDAO.update).toHaveBeenCalledWith('joinerId', {
                draw: true,
                result: MGPResult.DRAW.toInterface(),
                request: null,
            });

            tick(component.maximalMoveDuration);
        }));
        it('should finish the game when opponent accepts our proposed draw', fakeAsync(async() => {
            await setup();
            expect(await clickElement('#proposeDrawButton')).toBeTrue();

            spyOn(partDAO, 'update').and.callThrough();
            await receiveRequest(Request.drawAccepted);

            tick(1);
            expect(partDAO.update).toHaveBeenCalledWith('joinerId', {
                draw: true,
                result: MGPResult.DRAW.toInterface(),
                request: null,
            });
        }));
        it('should send refusal when player asks to', fakeAsync(async() => {
            await setup();
            await receiveRequest(Request.drawProposed(Player.ONE));

            spyOn(partDAO, 'update').and.callThrough();

            expect(await clickElement('#refuseDrawButton')).toBeTrue();
            expect(partDAO.update).toHaveBeenCalledWith('joinerId', {
                request: Request.drawRefused(Player.ZERO),
            });

            tick(component.maximalMoveDuration);
        }));
        it('should only propose to accept/refuse draw when asked', fakeAsync(async() => {
            await setup();
            expectElementNotToExist('#acceptDrawButton');
            expectElementNotToExist('#refuseDrawButton');
            await receiveRequest(Request.drawProposed(Player.ONE));

            expectElementToExist('#acceptDrawButton');
            expectElementToExist('#refuseDrawButton');

            tick(component.maximalMoveDuration);
        }));
    });
    describe('Timeouts', () => {
        it('should stop player\'s global chrono when local reach end', fakeAsync(async() => {
            await prepareStartedGameFor({ pseudo: 'creator', verified: true });
            tick(1);
            spyOn(component, 'reachedOutOfTime').and.callThrough();
            spyOn(component.chronoZeroGlobal, 'stop').and.callThrough();
            tick(component.maximalMoveDuration);
            expect(component.reachedOutOfTime).toHaveBeenCalledOnceWith(0);
            expect(component.chronoZeroGlobal.stop).toHaveBeenCalled();
        }));
        it('should stop player\'s local chrono when local global', fakeAsync(async() => {
            await prepareStartedGameFor({ pseudo: 'creator', verified: true }, true);
            tick(1);
            spyOn(component, 'reachedOutOfTime').and.callThrough();
            spyOn(component.chronoZeroLocal, 'stop').and.callThrough();
            tick(component.maximalMoveDuration);
            expect(component.reachedOutOfTime).toHaveBeenCalledOnceWith(0);
            expect(component.chronoZeroLocal.stop).toHaveBeenCalled();
        }));
        it('should stop ennemy\'s global chrono when local reach end', fakeAsync(async() => {
            await prepareStartedGameFor({ pseudo: 'creator', verified: true });
            tick(1);
            await doMove(FIRST_MOVE, true);
            spyOn(component, 'reachedOutOfTime').and.callThrough();
            spyOn(component.chronoOneGlobal, 'stop').and.callThrough();
            tick(component.maximalMoveDuration);
            expect(component.reachedOutOfTime).toHaveBeenCalledOnceWith(1);
            expect(component.chronoOneGlobal.stop).toHaveBeenCalled();
        }));
        it('should stop ennemy\'s local chrono when local global', fakeAsync(async() => {
            await prepareStartedGameFor({ pseudo: 'creator', verified: true }, true);
            tick(1);
            await doMove(FIRST_MOVE, true);
            spyOn(component, 'reachedOutOfTime').and.callThrough();
            spyOn(component.chronoOneLocal, 'stop').and.callThrough();
            tick(component.maximalMoveDuration);
            expect(component.reachedOutOfTime).toHaveBeenCalledOnceWith(1);
            expect(component.chronoOneLocal.stop).toHaveBeenCalled();
        }));
    });
    describe('User "handshake"', () => {
        it('Should make opponent\'s name lightgrey when he is absent', fakeAsync(async() => {
            await prepareStartedGameFor({ pseudo: 'creator', verified: true });
            tick(1);
            expect(component.getPlayerNameFontColor(1)).toEqual({ color: 'black' });
            joueurDAO.update('firstCandidateDocId', { state: 'offline' });
            fixture.detectChanges();
            tick();
            expect(component.getPlayerNameFontColor(1)).toBe(component.OFFLINE_FONT_COLOR);
            tick(component.maximalMoveDuration);
        }));
    });
    it('Should not allow player to move after resigning', fakeAsync(async() => {
        await prepareStartedGameFor({ pseudo: 'creator', verified: true });
        tick(1);
        await doMove(FIRST_MOVE, true);
        const move1: number = new QuartoMove(2, 2, QuartoPiece.BBBA).encode();
        await receiveNewMoves([FIRST_MOVE_ENCODED, move1]);
        expect(await clickElement('#resignButton')).toBeTruthy('Should be possible to resign');

        spyOn(partDAO, 'update').and.callThrough();
        const move2: QuartoMove = new QuartoMove(2, 3, QuartoPiece.ABBA);
        await doMove(move2, false);
        expect(partDAO.update).not.toHaveBeenCalled();

        tick(component.maximalMoveDuration);
    }));
    it('Should allow player to pass when gameComponent allows it', fakeAsync(async() => {
        await prepareStartedGameFor({ pseudo: 'creator', verified: true });
        tick(1);
        expect(await clickElement('#passButton')).toBeFalse();

        component.gameComponent.canPass = true;
        component.gameComponent.pass = async() => {
            return MGPValidation.SUCCESS;
        };
        fixture.detectChanges();

        expect(await clickElement('#passButton')).toBeTruthy();

        tick(component.maximalMoveDuration);
    }));
    describe('getUpdateType', () => {
        it('Should recognize move as move, even when after a request removal', fakeAsync(async() => {
            await prepareStartedGameFor({ pseudo: 'creator', verified: true });
            component.currentPart = new Part(
                'P4',
                'who is it from who cares',
                3,
                [1, 2, 3],
                { value: MGPResult.UNACHIEVED.toInterface().value },
                'Sir Meryn Trant',
                1234,
                null, null, null, null, null, null,
                Request.takeBackAccepted(Player.ZERO),
            );
            const update: ICurrentPart = {
                typeGame: 'P4',
                playerZero: 'who is it from who cares',
                turn: 4,
                listMoves: [1, 2, 3, 4],
                result: { value: MGPResult.UNACHIEVED.toInterface().value },
                playerOne: 'Sir Meryn Trant',
                beginning: 1234,
                // And obviously, no longer the previous request code
            };
            expect(component.getUpdateType(update)).toBe(UpdateType.MOVE);
            tick(component.maximalMoveDuration + 1);
        }));
        it('Should recognize update as move, even if score just added itself', fakeAsync(async() => {
            await prepareStartedGameFor({ pseudo: 'creator', verified: true });
            component.currentPart = new Part(
                'P4',
                'who is it from who cares',
                0,
                [],
                { value: MGPResult.UNACHIEVED.toInterface().value },
                'Sir Meryn Trant',
                1234,
                null, null, null, null, null, null, null,
            );
            const update: ICurrentPart = {
                typeGame: 'P4',
                playerZero: 'who is it from who cares',
                turn: 1,
                listMoves: [1],
                result: { value: MGPResult.UNACHIEVED.toInterface().value },
                playerOne: 'Sir Meryn Trant',
                beginning: 1234,
                // And obviously, the added score
                scorePlayerZero: 0,
                scorePlayerOne: 0,
            };
            expect(component.getUpdateType(update)).toBe(UpdateType.MOVE);
            tick(component.maximalMoveDuration + 1);
        }));
        it('Should recognize update as move, even if score was updated', fakeAsync(async() => {
            await prepareStartedGameFor({ pseudo: 'creator', verified: true });
            component.currentPart = new Part(
                'P4',
                'who is it from who cares',
                0,
                [],
                { value: MGPResult.UNACHIEVED.toInterface().value },
                'Sir Meryn Trant',
                1234,
                null, null, null, 1, 1, null, null,
            );
            const update: ICurrentPart = {
                typeGame: 'P4',
                playerZero: 'who is it from who cares',
                turn: 1,
                listMoves: [1],
                result: { value: MGPResult.UNACHIEVED.toInterface().value },
                playerOne: 'Sir Meryn Trant',
                beginning: 1234,
                // And obviously, the score update
                scorePlayerZero: 4,
                scorePlayerOne: 1,
            };
            expect(component.getUpdateType(update)).toBe(UpdateType.MOVE);
            tick(component.maximalMoveDuration + 1);
        }));
    });
    afterEach(fakeAsync(async() => {
        fixture.destroy();
        await fixture.whenStable();
        tick();
    }));
});
