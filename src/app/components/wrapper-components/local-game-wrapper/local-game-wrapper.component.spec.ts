/* eslint-disable max-lines-per-function */
import { Router } from '@angular/router';
import { DebugElement } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { JSONValue } from 'src/app/utils/utils';
import { ComponentTestUtils, expectValidRouting } from 'src/app/utils/tests/TestUtils.spec';

import { UserMocks } from 'src/app/domain/UserMocks.spec';

import { P4State } from 'src/app/games/p4/P4State';
import { P4Move } from 'src/app/games/p4/P4Move';
import { P4Component } from 'src/app/games/p4/p4.component';
import { P4Minimax } from 'src/app/games/p4/P4Minimax';
import { P4Rules } from 'src/app/games/p4/P4Rules';

import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { GameStatus } from 'src/app/jscaip/Rules';

import { ConnectedUserServiceMock } from 'src/app/services/tests/ConnectedUserService.spec';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { ErrorLoggerServiceMock } from 'src/app/services/tests/ErrorLoggerServiceMock.spec';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { AuthUser } from 'src/app/services/ConnectedUserService';

import { LocalGameWrapperComponent } from './local-game-wrapper.component';
import { AbstractGameComponent } from '../../game-components/game-component/GameComponent';
import { GameWrapperMessages } from '../GameWrapper';
import { NotFoundComponent } from '../../normal-component/not-found/not-found.component';

describe('LocalGameWrapperComponent for non-existing game', () => {
    it('should redirect to /notFound', fakeAsync(async() => {
        // Given a game wrapper for a game that does not exist
        const testUtils: ComponentTestUtils<AbstractGameComponent> = await ComponentTestUtils.basic('invalid-game', true);
        ConnectedUserServiceMock.setUser(AuthUser.NOT_CONNECTED);
        testUtils.prepareFixture(LocalGameWrapperComponent);
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.resolveTo();

        // When loading the wrapper
        testUtils.detectChanges();
        tick(3000);

        // Then it goes to /notFound with the expected error message
        expectValidRouting(router, ['/notFound', GameWrapperMessages.NO_MATCHING_GAME('invalid-game')], NotFoundComponent, { skipLocationChange: true });
    }));
});

describe('LocalGameWrapperComponent', () => {

    let testUtils: ComponentTestUtils<P4Component>;
    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;
    const X: PlayerOrNone = PlayerOrNone.ONE;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<P4Component>('P4');
        ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
        TestBed.inject(ErrorLoggerService);
    }));
    it('should create', () => {
        expect(testUtils.getComponent()).toBeTruthy();
    });
    it('should have game included after view init', () => {
        let p4Tag: DebugElement = testUtils.findElement('app-p4');

        p4Tag = testUtils.findElement('app-p4');
        expect(p4Tag).withContext('app-p4 tag should be present after view init').toBeTruthy();

        expect(testUtils.wrapper.gameComponent)
            .withContext('gameComponent should be present once component view init').toBeTruthy();
    });
    it('connected user should be able to play', fakeAsync(async() => {
        await testUtils.expectMoveSuccess('#click_4', P4Move.FOUR);
    }));
    it('should allow to go back one move', fakeAsync(async() => {
        const state: P4State = testUtils.getComponent().getState();
        expect(state.turn).toBe(0);

        await testUtils.expectMoveSuccess('#click_4', P4Move.FOUR);
        expect(testUtils.getComponent().getTurn()).toBe(1);

        spyOn(testUtils.getComponent(), 'updateBoard').and.callThrough();
        await testUtils.expectInterfaceClickSuccess('#takeBack');

        expect(testUtils.getComponent().getTurn()).toBe(0);
        expect(testUtils.getComponent().updateBoard).toHaveBeenCalledTimes(1);
    }));
    it('should show draw', fakeAsync(async() => {
        const board: PlayerOrNone[][] = [
            [O, O, O, _, O, O, O],
            [X, X, X, O, X, X, X],
            [O, O, O, X, O, O, O],
            [X, X, X, O, X, X, X],
            [O, O, O, X, O, O, O],
            [X, X, X, O, X, X, X],
        ];
        const state: P4State = new P4State(board, 41);
        testUtils.setupState(state);

        await testUtils.expectMoveSuccess('#click_3', P4Move.THREE);
        testUtils.expectElementToExist('#draw');
    }));
    it('should show score if needed', fakeAsync(async() => {
        testUtils.getComponent().scores = MGPOptional.empty();
        testUtils.expectElementNotToExist('#scoreZero');
        testUtils.expectElementNotToExist('#scoreOne');

        testUtils.getComponent().scores = MGPOptional.of([0, 0]);
        testUtils.forceChangeDetection();

        testUtils.expectElementToExist('#scoreZero');
        testUtils.expectElementToExist('#scoreOne');
    }));
    describe('restarting games', () => {
        it('should allow to restart game during the play', fakeAsync(async() => {
            testUtils.expectElementToExist('#restartButton');
            await testUtils.expectInterfaceClickSuccess('#restartButton');
        }));
        it('should allow to restart game at the end', fakeAsync(async() => {
            const board: PlayerOrNone[][] = [
                [O, O, O, _, O, O, O],
                [X, X, X, O, X, X, X],
                [O, O, O, X, O, O, O],
                [X, X, X, O, X, X, X],
                [O, O, O, X, O, O, O],
                [X, X, X, O, X, X, X],
            ];
            const state: P4State = new P4State(board, 41);
            testUtils.setupState(state);

            await testUtils.expectMoveSuccess('#click_3', P4Move.THREE);

            testUtils.expectElementToExist('#restartButton');

            await testUtils.expectInterfaceClickSuccess('#restartButton');

            expect(testUtils.getComponent().getTurn()).toBe(0);
            testUtils.expectElementNotToExist('#draw');
            tick(1000);
        }));
    });
    async function selectAIPlayer(player: Player): Promise<void> {
        await choosingAIOrHuman(player, 'AI');
        await choosingAILevel(player);
    }
    async function choosingAIOrHuman(player: Player, aiOrHuman: 'AI' | 'human'): Promise<void> {
        const playerSelect: string = player === Player.ZERO ? '#playerZeroSelect' : '#playerOneSelect';
        const selectAI: HTMLSelectElement = testUtils.findElement(playerSelect).nativeElement;
        selectAI.value = aiOrHuman === 'AI' ? selectAI.options[1].value : selectAI.options[0].value;
        selectAI.dispatchEvent(new Event('change'));
        testUtils.detectChanges();
        await testUtils.fixture.whenStable();
    }
    async function choosingAILevel(player: Player): Promise<void> {
        const aiDepthSelect: string = player === Player.ZERO ? '#aiZeroDepthSelect' : '#aiOneDepthSelect';
        const selectDepth: HTMLSelectElement = testUtils.findElement(aiDepthSelect).nativeElement;
        selectDepth.value = selectDepth.options[1].value;
        selectDepth.dispatchEvent(new Event('change'));
        testUtils.detectChanges();
        const aiDepth: string = selectDepth.options[selectDepth.selectedIndex].label;
        expect(aiDepth).toBe('Level 1');
        testUtils.detectChanges();
    }
    describe('Using AI', () => {
        it('should show level when non-human player is selected', async() => {
            // Given a board where human are playing human
            testUtils.expectElementNotToExist('#aiZeroDepthSelect');

            // When selecting an AI for player ZERO
            const selectAI: HTMLSelectElement = testUtils.findElement('#playerZeroSelect').nativeElement;
            selectAI.value = selectAI.options[1].value;
            selectAI.dispatchEvent(new Event('change'));
            testUtils.detectChanges();
            await testUtils.fixture.whenStable();

            // Then AI name should be diplayed and the level selectable
            const aiName: string = selectAI.options[selectAI.selectedIndex].label;
            expect(aiName).toBe('P4Minimax');
            testUtils.expectElementToExist('#aiZeroDepthSelect');
        });
        it('should show level when non-human player is selected, and propose AI to play', async() => {
            // Given any board

            // When selecting player zero as AI
            await choosingAIOrHuman(Player.ZERO, 'AI');
            const proposeAIToPlay: jasmine.Spy =
                spyOn(testUtils.wrapper as LocalGameWrapperComponent, 'proposeAIToPlay').and.callThrough();
            await choosingAILevel(Player.ZERO);
            await testUtils.fixture.whenStable();

            // Then proposeAIToPlay should have been called, so that IA play
            expect(proposeAIToPlay).toHaveBeenCalledTimes(2);
            // Once by changing it on the select, once after the AI move and check who is next
        });
        it('should rotate the board when selecting AI as player zero', async() => {
            // Given a board of a reversible component
            testUtils.getComponent().hasAsymmetricBoard = true;

            // When chosing the AI as player zero
            await selectAIPlayer(Player.ZERO);

            // Then the board should have been rotated so that player one, the human, stays below
            const rotation: string = testUtils.getComponent().rotation;
            expect(rotation).toBe('rotate(180)');
        });
        it('should de-rotate the board when selecting human as player zero again', async() => {
            // Given a board of a reversible component, where AI is player zero
            testUtils.getComponent().hasAsymmetricBoard = true;
            await selectAIPlayer(Player.ZERO);

            // When chosing the human as player zero again
            await choosingAIOrHuman(Player.ZERO, 'human');

            // Then the board should have been rotated so that player zero is below again
            const rotation: string = testUtils.getComponent().rotation;
            expect(rotation).toBe('rotate(0)');
        });
        it('should propose AI to play when restarting game', fakeAsync(async() => {
            const wrapper: LocalGameWrapperComponent = testUtils.wrapper as LocalGameWrapperComponent;
            wrapper.players[0] = MGPOptional.of('P4Minimax');
            wrapper.aiDepths[0] = '1';

            const proposeAIToPlay: jasmine.Spy = spyOn(wrapper, 'proposeAIToPlay').and.callThrough();

            await testUtils.expectInterfaceClickSuccess('#restartButton');
            testUtils.detectChanges();
            await testUtils.fixture.whenStable();

            expect(proposeAIToPlay).toHaveBeenCalledTimes(1);
            tick(1000);
        }));
        it('should propose AI 2 to play when selecting her just before her turn', async() => {
            // Given wrapper on which a first move have been done
            await testUtils.expectMoveSuccess('#click_4', P4Move.FOUR);

            // When clicking on AI then its level
            const selectAI: HTMLSelectElement = testUtils.findElement('#playerOneSelect').nativeElement;
            selectAI.value = selectAI.options[1].value;
            selectAI.dispatchEvent(new Event('change'));
            testUtils.detectChanges();
            await testUtils.fixture.whenStable();
            const selectDepth: HTMLSelectElement = testUtils.findElement('#aiOneDepthSelect').nativeElement;
            const proposeAIToPlay: jasmine.Spy =
                spyOn(testUtils.wrapper as LocalGameWrapperComponent, 'proposeAIToPlay').and.callThrough();
            selectDepth.value = selectDepth.options[1].value;
            selectDepth.dispatchEvent(new Event('change'));
            testUtils.detectChanges();
            await testUtils.fixture.whenStable();

            // Then it should have proposed AI to play
            expect(proposeAIToPlay).toHaveBeenCalledTimes(2);
        });
        it('should take back to users turn when playing against AI', fakeAsync(async() => {
            // Given a board, where each player played at least one move, where AI just played
            const selectAI: HTMLSelectElement = testUtils.findElement('#playerOneSelect').nativeElement;
            selectAI.value = selectAI.options[1].value;
            selectAI.dispatchEvent(new Event('change'));
            testUtils.detectChanges();
            await testUtils.fixture.whenStable();
            const selectDepth: HTMLSelectElement = testUtils.findElement('#aiOneDepthSelect').nativeElement;
            selectDepth.value = selectDepth.options[1].value;
            selectDepth.dispatchEvent(new Event('change'));
            testUtils.detectChanges();
            await testUtils.fixture.whenStable();

            const state: P4State = testUtils.getComponent().getState();
            expect(state.turn).toBe(0);

            await testUtils.expectMoveSuccess('#click_4', P4Move.FOUR);
            expect(testUtils.getComponent().getTurn()).toBe(1);

            // eslint-disable-next-line dot-notation
            tick(testUtils.wrapper['botTimeOut']);
            expect(testUtils.getComponent().getTurn()).toBe(2);

            // // When taking back
            spyOn(testUtils.getComponent(), 'updateBoard').and.callThrough();
            await testUtils.expectInterfaceClickSuccess('#takeBack');

            // // expect to be back two turn, not one
            expect(testUtils.getComponent().getTurn()).toBe(0);

            tick(1000);
        }));
        it('Minimax proposing illegal move should log error and show it to the user', fakeAsync(async() => {
            const messageDisplayer: MessageDisplayer = TestBed.inject(MessageDisplayer);
            spyOn(messageDisplayer, 'criticalMessage').and.resolveTo();
            spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
            // Given a board on which some illegal move are possible from the AI
            const localGameWrapper: LocalGameWrapperComponent = testUtils.wrapper as LocalGameWrapperComponent;
            spyOn(testUtils.getComponent().rules, 'choose').and.returnValue(false);
            spyOn(testUtils.getComponent().rules.node, 'findBestMove').and.returnValue(P4Move.ZERO);

            // When it is the turn of the bugged AI (that performs an illegal move)
            const minimax: P4Minimax = new P4Minimax(new P4Rules(P4State), 'P4');
            const result: MGPValidation = await localGameWrapper.doAIMove(minimax);

            // Then it should fail and an error should be logged
            expect(result.isFailure()).toBeTrue();
            const errorMessage: string = 'AI chose illegal move';
            const errorData: JSONValue = { name: 'P4', move: 'P4Move(0)' };
            expect(ErrorLoggerService.logError).toHaveBeenCalledWith('LocalGameWrapper', errorMessage, errorData);
            expect(messageDisplayer.criticalMessage).toHaveBeenCalledWith('The AI chose an illegal move! This is an unexpected situation that we logged, we will try to solve this as soon as possible. In the meantime, consider that you won!');
        }));
        it('should not do an AI move when the game is finished', fakeAsync(async() => {
            const localGameWrapper: LocalGameWrapperComponent = testUtils.wrapper as LocalGameWrapperComponent;
            spyOn(localGameWrapper, 'doAIMove').and.callThrough();

            // Given a game which is finished
            spyOn(testUtils.getComponent().rules, 'getGameStatus').and.returnValue(GameStatus.ZERO_WON);

            // When selecting an AI for the current player
            const selectAI: HTMLSelectElement = testUtils.findElement('#playerZeroSelect').nativeElement;
            selectAI.value = selectAI.options[1].value;
            selectAI.dispatchEvent(new Event('change'));
            testUtils.detectChanges();
            await testUtils.fixture.whenStable();
            const selectDepth: HTMLSelectElement = testUtils.findElement('#aiZeroDepthSelect').nativeElement;
            selectDepth.value = selectDepth.options[1].value;
            selectDepth.dispatchEvent(new Event('change'));
            testUtils.detectChanges();
            await testUtils.fixture.whenStable();

            // Then it should not try to play
            expect(localGameWrapper.doAIMove).not.toHaveBeenCalled();
        }));
        it('should reject human move if it tries to play (without click) when it is not its turn', fakeAsync(async() => {
            // Given a game against an AI
            const wrapper: LocalGameWrapperComponent = testUtils.wrapper as LocalGameWrapperComponent;
            wrapper.players[0] = MGPOptional.of('P4Minimax');
            wrapper.aiDepths[0] = '1';

            // When receiveValidMove is called
            const state: P4State = testUtils.getComponent().getState();
            const result: MGPValidation = await wrapper.receiveValidMove(P4Move.ZERO, state);

            // Then it should display a message
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toBe(GameWrapperMessages.NOT_YOUR_TURN());
        }));
    });
    describe('winner indicator', () => {

        const preVictoryBoard: PlayerOrNone[][] = [
            [O, O, O, _, _, O, O],
            [X, X, O, _, O, X, X],
            [O, O, X, _, X, X, O],
            [X, X, X, O, O, X, X],
            [O, O, X, O, X, O, O],
            [X, X, O, O, X, X, X],
        ];
        it(`should display 'Player <N> won' when human vs human victory`, fakeAsync(async() => {
            // Given a Human-vs-human board where victory is imminent
            const state: P4State = new P4State(preVictoryBoard, 40);
            testUtils.setupState(state);

            // When player zero does the winning move
            await testUtils.expectMoveSuccess('#click_3', P4Move.THREE);

            // Then 'Player 0 won' should be displayed
            const winnerTag: string = testUtils.findElement('#winner').nativeElement.innerHTML;
            expect(winnerTag).toBe('Player 1 won');
        }));
        it(`should display 'You Lost' when human lose against AI`, fakeAsync(async() => {
            // Given a board where victory is imminent for AI
            const board: PlayerOrNone[][] = [
                [O, O, O, _, _, O, O],
                [X, X, O, _, O, X, X],
                [O, O, X, _, X, X, O],
                [X, X, X, O, O, X, X],
                [O, O, X, O, X, O, O],
                [X, X, O, O, X, X, X],
            ];
            const state: P4State = new P4State(board, 37);
            testUtils.setupState(state);
            await testUtils.expectMoveSuccess('#click_4', P4Move.FOUR);

            // When selecting AI, and AI then doing winning move
            await selectAIPlayer(Player.ZERO);
            tick((testUtils.wrapper as LocalGameWrapperComponent).botTimeOut);

            // Then 'You lost' should be displayed
            const winnerTag: string = testUtils.findElement('#winner').nativeElement.innerHTML;
            expect(winnerTag).toBe('You lost');
        }));
        it(`should display 'You won' when human win again AI`, fakeAsync(async() => {
            // Given a board where victory is imminent for human (against AI)
            const state: P4State = new P4State(preVictoryBoard, 39);
            testUtils.setupState(state);
            await selectAIPlayer(Player.ZERO);

            // When user does the winning move
            await testUtils.expectMoveSuccess('#click_3', P4Move.THREE);

            // Then 'You won' should be displayed
            const winnerTag: string = testUtils.findElement('#winner').nativeElement.innerHTML;
            expect(winnerTag).toBe('You won');
        }));
        it(`should display '<AI name> (Player <N>) Win' when AI fight AI`, fakeAsync(async() => {
            // Given a board where victory is imminent for AI zero
            const board: PlayerOrNone[][] = [
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, O, _, _, _],
                [_, _, _, O, _, _, _],
                [_, _, X, X, X, _, _],
            ];
            const state: P4State = new P4State(board, 40);
            testUtils.setupState(state);
            await selectAIPlayer(Player.ZERO);
            tick((testUtils.wrapper as LocalGameWrapperComponent).botTimeOut);

            // When AI zero does the winning move
            await selectAIPlayer(Player.ONE);
            tick((testUtils.wrapper as LocalGameWrapperComponent).botTimeOut);

            // Then 'AI (Player 0) won' should be displayed
            const winnerTag: string = testUtils.findElement('#winner').nativeElement.innerHTML;
            expect(winnerTag).toBe('P4Minimax (Player 2) won');
        }));
    });
    describe('onCancelMove', () => {
        it('should showLastMove when there is one', fakeAsync(async() => {
            // Given a component with a last move
            const component: P4Component = testUtils.getComponent();
            await testUtils.expectMoveSuccess('#click_4', P4Move.FOUR);
            spyOn(component, 'showLastMove').and.callThrough();

            // When calling onCancelMove
            testUtils.wrapper.onCancelMove();

            // Then showLastMove should have been called
            expect(component.showLastMove).toHaveBeenCalledOnceWith();
        }));
        it('should not showLastMove when there is none', fakeAsync(async() => {
            // Given a component with a last move
            const component: P4Component = testUtils.getComponent();
            spyOn(component, 'showLastMove').and.callThrough();

            // When calling onCancelMove
            testUtils.wrapper.onCancelMove();

            // Then showLastMove should have been called
            expect(component.showLastMove).not.toHaveBeenCalled();
        }));
    });
    it('should display AI metrics when parameter is set to true', fakeAsync(async() => {
        // Given a component where we want to show the AI metrics in the middle of a part
        (testUtils.wrapper as LocalGameWrapperComponent).displayAIMetrics = true;
        await testUtils.expectMoveSuccess('#click_4', P4Move.FOUR);

        // When displaying it
        testUtils.detectChanges();

        // Then the AI metrics are shown
        testUtils.expectElementToExist('#AIMetrics');
    }));
});
