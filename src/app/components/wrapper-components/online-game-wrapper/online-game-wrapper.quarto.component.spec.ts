import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { By } from '@angular/platform-browser';

import { of } from 'rxjs';

import { AppModule, INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';
import { OnlineGameWrapperComponent } from './online-game-wrapper.component';

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
import { RequestCode } from 'src/app/domain/request';
import { MGPResult } from 'src/app/domain/icurrentpart';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';
import { RouterTestingModule } from '@angular/router/testing';

const activatedRouteStub = {
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

    const prepareComponent: (initialJoiner: IJoiner) => Promise<void> = async(initialJoiner: IJoiner) => {
        fixture = TestBed.createComponent(OnlineGameWrapperComponent);
        debugElement = fixture.debugElement;
        partDAO = TestBed.get(PartDAO);
        joinerDAO = TestBed.get(JoinerDAO);
        const chatDAOMock: ChatDAOMock = TestBed.get(ChatDAO);
        component = debugElement.componentInstance;
        await joinerDAO.set('joinerId', initialJoiner);
        await partDAO.set('joinerId', PartMocks.INITIAL.copy());
        await chatDAOMock.set('joinerId', { messages: [], status: 'I don\'t have a clue' });
        return Promise.resolve();
    };
    const prepareStartedGameFor: (user: {pseudo: string, verified: boolean}) => Promise<void> = async(user: {pseudo: string, verified: boolean}) => {
        AuthenticationServiceMock.USER = user;
        await prepareComponent(JoinerMocks.INITIAL.copy());
        fixture.detectChanges();
        tick(1);

        const partCreationId = fixture.debugElement.query(By.css('#partCreation'));
        expect(partCreationId).toBeTruthy('partCreation id should be present after ngOnInit');
        expect(component.partCreation).toBeTruthy('partCreation field should also be present');
        await joinerDAO.update('joinerId', { candidatesNames: ['firstCandidate'] });
        fixture.detectChanges();
        await fixture.whenStable();
        await joinerDAO.update('joinerId',
            { partStatus: 1, candidatesNames: [], chosenPlayer: 'firstCandidate' });
        // TODO: replace by real actor action (chooseCandidate)
        fixture.detectChanges();
        await component.partCreation.proposeConfig();
        fixture.detectChanges();
        await joinerDAO.update('joinerId', { partStatus: 3 });
        await partDAO.update('joinerId', { playerOne: 'firstCandidate', turn: 0, beginning: Date.now() });
        fixture.detectChanges();
        return Promise.resolve();
    };
    const FIRST_MOVE: QuartoMove = new QuartoMove(0, 3, QuartoPiece.BABB);

    const FIRST_MOVE_ENCODED: number = FIRST_MOVE.encode();

    const doMove: (move: QuartoMove) => Promise<MGPValidation> = async(move: QuartoMove) => {
        const slice: QuartoPartSlice = component.gameComponent.rules.node.gamePartSlice as QuartoPartSlice;
        const result: MGPValidation = await component.gameComponent.chooseMove(move, slice, null, null);
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
    const receiveRequest: (request: RequestCode) => Promise<void> = async(request: RequestCode) => {
        await partDAO.update('joinerId', {
            request: request.toInterface(),
        });
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
    const prepareBoard: (moves: QuartoMove[]) => Promise<void> = async(moves: QuartoMove[]) => {
        await prepareStartedGameFor({ pseudo: 'creator', verified: true });
        tick(1);
        const receivedMoves: number[] = [];
        for (let i: number = 0; i < moves.length; i+=2) {
            const move: QuartoMove = moves[i];
            await doMove(moves[i]);
            receivedMoves.push(move.encode(), moves[i+1].encode());
            await receiveNewMoves(receivedMoves);
        }
    };
    beforeAll(() => {
        OnlineGameWrapperComponent.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || OnlineGameWrapperComponent.VERBOSE;
    });
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
        tick(1);
        expect(component.currentPart.copy().listMoves).toEqual([]);
        expect(component.currentPlayer).toEqual('creator');
        tick(component.maximalMoveDuration);
    }));
    it('Prepared Game for creator should no longer have PartCreationComponent and QuartoComponent instead', fakeAsync(async() => {
        await prepareStartedGameFor({ pseudo: 'creator', verified: true });

        const partCreationId: DebugElement = getElement('#partCreation');
        let quartoTag = fixture.debugElement.nativeElement.querySelector('app-quarto');
        expect(partCreationId).toBeFalsy('partCreation id should be absent after config accepted');
        expect(quartoTag).toBeFalsy('quarto tag should be absent before config accepted and async millisec finished');
        expect(component.partCreation).toBeFalsy('partCreation field should also be absent after config accepted');
        expect(component.gameComponent).toBeFalsy('gameComponent field should also be absent after config accepted and async millisec finished');

        tick(1);

        quartoTag = fixture.debugElement.nativeElement.querySelector('app-quarto');
        expect(quartoTag).toBeTruthy('quarto tag should be present after config accepted and async millisec finished');
        expect(component.gameComponent).toBeTruthy('gameComponent field should also be present after config accepted and async millisec finished');
        tick(component.maximalMoveDuration);
    }));
    it('Prepared Game for creator should allow simple move', fakeAsync(async() => {
        await prepareStartedGameFor({ pseudo: 'creator', verified: true });
        tick(1);

        expect((await doMove(FIRST_MOVE)).isSuccess()).toBeTrue();

        expect(component.currentPart.copy().listMoves).toEqual([FIRST_MOVE_ENCODED]);
        expect(component.currentPart.copy().turn).toEqual(1);

        // Receive second move
        await receiveNewMoves([FIRST_MOVE_ENCODED, 166]);

        expect(component.currentPart.copy().turn).toEqual(2);
        expect(component.currentPart.copy().listMoves).toEqual([FIRST_MOVE_ENCODED, 166]);
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
        await doMove(move);
        expect(component.currentPart.copy().listMoves).toEqual([FIRST_MOVE_ENCODED, move.encode()]);
        expect(component.currentPart.copy().turn).toEqual(2);

        tick(component.maximalMoveDuration);
    }));
    it('Move should trigger db change', fakeAsync(async() => {
        await prepareStartedGameFor({ pseudo: 'creator', verified: true });
        tick(1);
        spyOn(partDAO, 'update').and.callThrough();
        await doMove(FIRST_MOVE);
        expect(component.currentPart.copy().listMoves).toEqual([FIRST_MOVE.encode()]);
        const expectedUpdate = {
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
        await doMove(winningMove);

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
    it('Should send take back request when player ask to', fakeAsync(async() => {
        // Doing a first move so take back make sens
        await prepareStartedGameFor({ pseudo: 'creator', verified: true });
        tick(1);

        await doMove(FIRST_MOVE);

        // Asking take back
        spyOn(partDAO, 'update').and.callThrough();

        await askTakeBack();
        expect(partDAO.update).toHaveBeenCalledWith('joinerId', {
            request: RequestCode.ZERO_ASKED_TAKE_BACK.toInterface(),
        });

        tick(component.maximalMoveDuration);
    }));
    it('Opponent accepting take back should move player board backward (one move)', fakeAsync(async() => {
        await prepareStartedGameFor({ pseudo: 'creator', verified: true });
        tick(1);
        // Doing a first move so take back make sens
        await doMove(FIRST_MOVE);

        expect(component.gameComponent.rules.node.gamePartSlice.turn).toBe(1);

        // Asking take back
        await askTakeBack();

        // Opponent accept take back
        await partDAO.update('joinerId', {
            request: RequestCode.ONE_ACCEPTED_TAKE_BACK.toInterface(),
            listMoves: [],
            turn: 0,
        });
        fixture.detectChanges(); tick(1);

        expect(component.gameComponent.rules.node.gamePartSlice.turn).toBe(0);

        // Doing another move
        spyOn(partDAO, 'update').and.callThrough();
        const move1: QuartoMove = new QuartoMove(2, 2, QuartoPiece.AAAB);
        await doMove(move1);

        expect(partDAO.update).toHaveBeenCalledWith('joinerId', {
            listMoves: [move1.encode()], turn: 1,
            scorePlayerZero: null, scorePlayerOne: null, request: null,
        });
        tick(component.maximalMoveDuration);
    }));
    it('Player accepting take back should move player board backward (two moves)', fakeAsync(async() => {
        await prepareStartedGameFor({ pseudo: 'creator', verified: true });
        tick(1);

        const move1: QuartoMove = new QuartoMove(3, 3, QuartoPiece.BABA);
        const move2: QuartoMove = new QuartoMove(3, 0, QuartoPiece.ABBA);

        await doMove(FIRST_MOVE);
        await receiveNewMoves([FIRST_MOVE_ENCODED, move1.encode()]);
        await doMove(move2);
        await receiveRequest(RequestCode.ONE_ASKED_TAKE_BACK);
        expect(component.gameComponent.rules.node.gamePartSlice.turn).toBe(3);

        spyOn(partDAO, 'update').and.callThrough();
        // Accepting Take Back Request of Player.ONE
        await acceptTakeBack();
        expect(partDAO.update).toHaveBeenCalledWith('joinerId', {
            request: RequestCode.ZERO_ACCEPTED_TAKE_BACK.toInterface(),
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
        await doMove(FIRST_MOVE);
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
        await doMove(new QuartoMove(2, 2, QuartoPiece.BBAA));
        expect(await askTakeBack()).toBeTrue();
        expect(await askTakeBack()).toBeFalse();

        tick(component.maximalMoveDuration);
    }));
    it('Should only propose to accept take back when opponent asked', fakeAsync(async() => {
        await prepareStartedGameFor({ pseudo: 'creator', verified: true });
        tick(1);
        const move1: number = new QuartoMove(2, 2, QuartoPiece.BBBA).encode();
        await doMove(FIRST_MOVE);
        await receiveNewMoves([FIRST_MOVE_ENCODED, move1]);
        expect(await acceptTakeBack()).toBeFalse();
        await receiveRequest(RequestCode.ONE_ASKED_TAKE_BACK);
        spyOn(partDAO, 'update').and.callThrough();
        expect(await acceptTakeBack()).toBeTrue();
        expect(await acceptTakeBack()).toBeFalse();
        expect(partDAO.update).toHaveBeenCalledWith('joinerId', {
            request: RequestCode.ZERO_ACCEPTED_TAKE_BACK.toInterface(),
            turn: 1, listMoves: [FIRST_MOVE_ENCODED],
        });

        tick(component.maximalMoveDuration);
    }));
    it('Should only propose player to refuse take back when opponent asked', fakeAsync(async() => {
        await prepareStartedGameFor({ pseudo: 'creator', verified: true });
        tick(1);
        const move1: number = new QuartoMove(2, 2, QuartoPiece.BBBA).encode();
        await doMove(FIRST_MOVE);
        await receiveNewMoves([FIRST_MOVE_ENCODED, move1]);
        expect(await refuseTakeBack()).toBeFalse();
        await receiveRequest(RequestCode.ONE_ASKED_TAKE_BACK);
        spyOn(partDAO, 'update').and.callThrough();
        expect(await refuseTakeBack()).toBeTrue();
        expect(await refuseTakeBack()).toBeFalse();
        expect(partDAO.update).toHaveBeenCalledWith('joinerId', {
            request: RequestCode.ZERO_REFUSED_TAKE_BACK.toInterface(),
        });

        tick(component.maximalMoveDuration);
    }));
    it('Should not allow player to play while take back request is waiting for him', fakeAsync(async() => {
        await prepareStartedGameFor({ pseudo: 'creator', verified: true });
        tick(1);
        await doMove(FIRST_MOVE);
        const move1: number = new QuartoMove(2, 2, QuartoPiece.BBBA).encode();
        await receiveNewMoves([FIRST_MOVE_ENCODED, move1]);
        await receiveRequest(RequestCode.ONE_ASKED_TAKE_BACK);

        spyOn(partDAO, 'update').and.callThrough();
        const move2: QuartoMove = new QuartoMove(2, 3, QuartoPiece.ABBA);
        await doMove(move2);
        expect(partDAO.update).not.toHaveBeenCalled();

        tick(component.maximalMoveDuration);
    }));
    it('Should cancel take back request when take back requester do a move', fakeAsync(async() => {
        await prepareStartedGameFor({ pseudo: 'creator', verified: true });
        tick(1);
        const move1: number = new QuartoMove(2, 2, QuartoPiece.BBBA).encode();
        const move2: QuartoMove = new QuartoMove(2, 1, QuartoPiece.ABBA);
        await doMove(FIRST_MOVE);
        await receiveNewMoves([FIRST_MOVE_ENCODED, move1]);
        await askTakeBack();

        spyOn(partDAO, 'update').and.callThrough();
        await doMove(move2);
        expect(partDAO.update).not.toHaveBeenCalledWith('joinerId', {
            listMoves: [FIRST_MOVE_ENCODED, move1, move2.encode()], turn: 3,
            playerZero: null, playerOne: null, request: null,
        });

        tick(component.maximalMoveDuration);
    }));
    it('Should forbid player to ask take back again after refusal', fakeAsync(async() => {
        await prepareStartedGameFor({ pseudo: 'creator', verified: true });
        tick(1);
        await doMove(FIRST_MOVE);
        await askTakeBack();
        await receiveRequest(RequestCode.ONE_REFUSED_TAKE_BACK);

        expect(await askTakeBack()).toBeFalse();

        tick(component.maximalMoveDuration);
    }));
    it('Should not allow player to move after resigning', fakeAsync(async() => {
        await prepareStartedGameFor({ pseudo: 'creator', verified: true });
        tick(1);
        await doMove(FIRST_MOVE);
        const move1: number = new QuartoMove(2, 2, QuartoPiece.BBBA).encode();
        await receiveNewMoves([FIRST_MOVE_ENCODED, move1]);
        expect(await clickElement('#resignButton')).toBeTruthy('Should be possible to resign');

        spyOn(partDAO, 'update').and.callThrough();
        const move2: QuartoMove = new QuartoMove(2, 3, QuartoPiece.ABBA);
        expect((await doMove(move2)).isSuccess()).toBeFalse();
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
    afterEach(fakeAsync(async() => {
        fixture.destroy();
        await fixture.whenStable();
        tick();
    }));
});
