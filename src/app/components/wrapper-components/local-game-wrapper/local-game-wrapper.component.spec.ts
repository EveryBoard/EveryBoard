/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { P4State } from 'src/app/games/p4/P4State';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { P4Move } from 'src/app/games/p4/P4Move';
import { ConnectedUserServiceMock } from 'src/app/services/tests/ConnectedUserService.spec';
import { ComponentTestUtils, expectValidRouting } from 'src/app/utils/tests/TestUtils.spec';
import { P4Component } from 'src/app/games/p4/p4.component';
import { LocalGameWrapperComponent } from './local-game-wrapper.component';
import { DebugElement } from '@angular/core';
import { P4Minimax } from 'src/app/games/p4/P4Minimax';
import { P4Rules } from 'src/app/games/p4/P4Rules';
import { GameStatus } from 'src/app/jscaip/Rules';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { ErrorLoggerServiceMock } from 'src/app/services/tests/ErrorLoggerServiceMock.spec';
import { JSONValue } from 'src/app/utils/utils';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { Router } from '@angular/router';
import { AbstractGameComponent } from '../../game-components/game-component/GameComponent';
import { GameWrapperMessages } from '../GameWrapper';
import { NotFoundComponent } from '../../normal-component/not-found/not-found.component';
import { UserMocks } from 'src/app/domain/UserMocks.spec';
import { AuthUser } from 'src/app/services/ConnectedUserService';

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

    let componentTestUtils: ComponentTestUtils<P4Component>;
    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;
    const X: PlayerOrNone = PlayerOrNone.ONE;

    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame<P4Component>('P4', LocalGameWrapperComponent);
        ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
        TestBed.inject(ErrorLoggerService);
    }));
    it('should create', () => {
        expect(componentTestUtils.getComponent()).toBeTruthy();
    });
    it('should have game included after view init', () => {
        const gameIncluderTag: DebugElement = componentTestUtils.querySelector('app-game-includer');
        let p4Tag: DebugElement = componentTestUtils.querySelector('app-p4');
        expect(gameIncluderTag).withContext('app-game-includer tag should be present at start').toBeTruthy();

        p4Tag = componentTestUtils.querySelector('app-p4');
        expect(p4Tag).withContext('app-p4 tag should be present after view init').toBeTruthy();

        expect(componentTestUtils.wrapper.gameIncluder).withContext('gameIncluder should exist after view init').toBeTruthy();
        expect(componentTestUtils.wrapper.gameComponent)
            .withContext('gameComponent should be present once component view init').toBeTruthy();
    });
    it('connected user should be able to play', fakeAsync(async() => {
        await componentTestUtils.expectMoveSuccess('#click_4', P4Move.FOUR);
    }));
    it('should allow to go back one move', fakeAsync(async() => {
        const state: P4State = componentTestUtils.getComponent().rules.node.gameState;
        expect(state.turn).toBe(0);

        await componentTestUtils.expectMoveSuccess('#click_4', P4Move.FOUR);
        expect(componentTestUtils.getComponent().rules.node.gameState.turn).toBe(1);

        spyOn(componentTestUtils.getComponent(), 'updateBoard').and.callThrough();
        await componentTestUtils.expectInterfaceClickSuccess('#takeBack');

        expect(componentTestUtils.getComponent().rules.node.gameState.turn).toBe(0);
        expect(componentTestUtils.getComponent().updateBoard).toHaveBeenCalledTimes(1);
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
        componentTestUtils.setupState(state);

        await componentTestUtils.expectMoveSuccess('#click_3', P4Move.THREE);
        componentTestUtils.expectElementToExist('#draw');
    }));
    it('should show score if needed', fakeAsync(async() => {
        componentTestUtils.getComponent().scores = MGPOptional.empty();
        componentTestUtils.expectElementNotToExist('#scoreZero');
        componentTestUtils.expectElementNotToExist('#scoreOne');

        componentTestUtils.getComponent().scores = MGPOptional.of([0, 0]);
        componentTestUtils.forceChangeDetection();

        componentTestUtils.expectElementToExist('#scoreZero');
        componentTestUtils.expectElementToExist('#scoreOne');
    }));
    describe('restarting games', () => {
        it('should allow to restart game during the play', fakeAsync(async() => {
            componentTestUtils.expectElementToExist('#restartButton');
            await componentTestUtils.expectInterfaceClickSuccess('#restartButton');
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
            componentTestUtils.setupState(state);

            await componentTestUtils.expectMoveSuccess('#click_3', P4Move.THREE);

            componentTestUtils.expectElementToExist('#restartButton');

            await componentTestUtils.expectInterfaceClickSuccess('#restartButton');

            expect(componentTestUtils.getComponent().rules.node.gameState.turn).toBe(0);
            componentTestUtils.expectElementNotToExist('#draw');
            tick(1000);
        }));
    });
    describe('Using AI', () => {
        it('Should show level when non-human player is selected, and propose ai to play', async() => {
            // 1. Choosing AI
            const selectAI: HTMLSelectElement = componentTestUtils.findElement('#playerZeroSelect').nativeElement;
            componentTestUtils.expectElementNotToExist('#aiZeroDepthSelect');
            selectAI.value = selectAI.options[1].value;
            selectAI.dispatchEvent(new Event('change'));
            componentTestUtils.fixture.detectChanges();
            await componentTestUtils.fixture.whenStable();
            const aiName: string = selectAI.options[selectAI.selectedIndex].label;
            expect(aiName).toBe('P4Minimax');

            // 2. Choosing level
            const selectDepth: HTMLSelectElement = componentTestUtils.findElement('#aiZeroDepthSelect').nativeElement;
            const proposeAIToPlay: jasmine.Spy =
                spyOn(componentTestUtils.wrapper as LocalGameWrapperComponent, 'proposeAIToPlay').and.callThrough();
            selectDepth.value = selectDepth.options[1].value;
            selectDepth.dispatchEvent(new Event('change'));
            componentTestUtils.detectChanges();
            await componentTestUtils.fixture.whenStable();
            const aiDepth: string = selectDepth.options[selectDepth.selectedIndex].label;
            expect(aiDepth).toBe('Level 1');
            componentTestUtils.detectChanges();
            await componentTestUtils.fixture.whenStable();
            expect(proposeAIToPlay).toHaveBeenCalledTimes(2);
            // Once by changing it on the select, once after the AI move and check who is next
        });
        it('should propose AI to play when restarting game', fakeAsync(async() => {
            const wrapper: LocalGameWrapperComponent = componentTestUtils.wrapper as LocalGameWrapperComponent;
            wrapper.players[0] = MGPOptional.of('P4Minimax');
            wrapper.aiDepths[0] = '1';

            const proposeAIToPlay: jasmine.Spy = spyOn(wrapper, 'proposeAIToPlay').and.callThrough();

            await componentTestUtils.expectInterfaceClickSuccess('#restartButton');
            componentTestUtils.detectChanges();
            await componentTestUtils.fixture.whenStable();

            expect(proposeAIToPlay).toHaveBeenCalledTimes(1);
            tick(1000);
        }));
        it('should propose AI 2 to play when selecting her just before her turn', async() => {
            // given wrapper on which a first move have been done
            await componentTestUtils.expectMoveSuccess('#click_4', P4Move.FOUR);

            // when clicking on AI then its level
            const selectAI: HTMLSelectElement = componentTestUtils.findElement('#playerOneSelect').nativeElement;
            selectAI.value = selectAI.options[1].value;
            selectAI.dispatchEvent(new Event('change'));
            componentTestUtils.fixture.detectChanges();
            await componentTestUtils.fixture.whenStable();
            const selectDepth: HTMLSelectElement = componentTestUtils.findElement('#aiOneDepthSelect').nativeElement;
            const proposeAIToPlay: jasmine.Spy =
                spyOn(componentTestUtils.wrapper as LocalGameWrapperComponent, 'proposeAIToPlay').and.callThrough();
            selectDepth.value = selectDepth.options[1].value;
            selectDepth.dispatchEvent(new Event('change'));
            componentTestUtils.detectChanges();
            await componentTestUtils.fixture.whenStable();

            // then it should have proposed AI to play
            expect(proposeAIToPlay).toHaveBeenCalledTimes(2);
        });
        it('should take back to users turn when playing against AI', fakeAsync(async() => {
            // Given a board, where each player played at least one move, where AI just played
            const selectAI: HTMLSelectElement = componentTestUtils.findElement('#playerOneSelect').nativeElement;
            selectAI.value = selectAI.options[1].value;
            selectAI.dispatchEvent(new Event('change'));
            componentTestUtils.fixture.detectChanges();
            await componentTestUtils.fixture.whenStable();
            const selectDepth: HTMLSelectElement = componentTestUtils.findElement('#aiOneDepthSelect').nativeElement;
            selectDepth.value = selectDepth.options[1].value;
            selectDepth.dispatchEvent(new Event('change'));
            componentTestUtils.detectChanges();
            await componentTestUtils.fixture.whenStable();

            const state: P4State = componentTestUtils.getComponent().rules.node.gameState;
            expect(state.turn).toBe(0);

            await componentTestUtils.expectMoveSuccess('#click_4', P4Move.FOUR);
            expect(componentTestUtils.getComponent().rules.node.gameState.turn).toBe(1);

            // eslint-disable-next-line dot-notation
            tick(componentTestUtils.wrapper['botTimeOut']);
            expect(componentTestUtils.getComponent().rules.node.gameState.turn).toBe(2);

            // // when taking back
            spyOn(componentTestUtils.getComponent(), 'updateBoard').and.callThrough();
            await componentTestUtils.expectInterfaceClickSuccess('#takeBack');

            // // expect to be back two turn, not one
            expect(componentTestUtils.getComponent().rules.node.gameState.turn).toBe(0);

            tick(1000);
        }));
        it('Minimax proposing illegal move should log error and show it to the user', fakeAsync(async() => {
            const messageDisplayer: MessageDisplayer = TestBed.inject(MessageDisplayer);
            spyOn(messageDisplayer, 'criticalMessage').and.callThrough();
            spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
            // given a board on which some illegal move are possible from the IA
            const localGameWrapper: LocalGameWrapperComponent = componentTestUtils.wrapper as LocalGameWrapperComponent;
            spyOn(componentTestUtils.getComponent().rules, 'choose').and.returnValue(false);
            spyOn(componentTestUtils.getComponent().rules.node, 'findBestMove').and.returnValue(P4Move.ZERO);

            // when it is the turn of the bugged AI (that performs an illegal move)
            const minimax: P4Minimax = new P4Minimax(new P4Rules(P4State), 'P4');
            const result: MGPValidation = await localGameWrapper.doAIMove(minimax);

            // then it should fail and an error should be logged
            expect(result.isFailure()).toBeTrue();
            const errorMessage: string = 'AI chose illegal move';
            const errorData: JSONValue = { name: 'P4', move: 'P4Move(0)' };
            expect(ErrorLoggerService.logError).toHaveBeenCalledWith('LocalGameWrapper', errorMessage, errorData);
            expect(messageDisplayer.criticalMessage).toHaveBeenCalledWith('The AI chose an illegal move! This is an unexpected situation that we logged, we will try to solve this as soon as possible. In the meantime, consider that you won!');
            tick(3000);
        }));
        it('should not do an AI move when the game is finished', fakeAsync(async() => {
            const localGameWrapper: LocalGameWrapperComponent = componentTestUtils.wrapper as LocalGameWrapperComponent;
            spyOn(localGameWrapper, 'doAIMove');

            // given a game which is finished
            spyOn(componentTestUtils.getComponent().rules, 'getGameStatus').and.returnValue(GameStatus.ZERO_WON);

            // when selecting an AI for the current player
            const selectAI: HTMLSelectElement = componentTestUtils.findElement('#playerZeroSelect').nativeElement;
            selectAI.value = selectAI.options[1].value;
            selectAI.dispatchEvent(new Event('change'));
            componentTestUtils.fixture.detectChanges();
            await componentTestUtils.fixture.whenStable();
            const selectDepth: HTMLSelectElement = componentTestUtils.findElement('#aiZeroDepthSelect').nativeElement;
            selectDepth.value = selectDepth.options[1].value;
            selectDepth.dispatchEvent(new Event('change'));
            componentTestUtils.detectChanges();
            await componentTestUtils.fixture.whenStable();

            // then it should not try to play
            expect(localGameWrapper.doAIMove).not.toHaveBeenCalled();
        }));
        it('should reject human move if it tries to play (without click) when it is not its turn', fakeAsync(async() => {
            // Given a game against an AI
            const wrapper: LocalGameWrapperComponent = componentTestUtils.wrapper as LocalGameWrapperComponent;
            wrapper.players[0] = MGPOptional.of('P4Minimax');
            wrapper.aiDepths[0] = '1';

            // When receiveValidMove is called
            const state: P4State = componentTestUtils.getComponent().rules.node.gameState;
            const result: MGPValidation = await wrapper.receiveValidMove(P4Move.ZERO, state);

            // Then it should display a message
            expect(result.isFailure()).toBeTrue();
            expect(result.getReason()).toBe(GameWrapperMessages.NOT_YOUR_TURN());
        }));
    });
});
