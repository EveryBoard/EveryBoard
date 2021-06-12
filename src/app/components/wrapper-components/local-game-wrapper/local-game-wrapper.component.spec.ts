import { fakeAsync, flush } from '@angular/core/testing';
import { P4PartSlice } from 'src/app/games/p4/P4PartSlice';
import { Player } from 'src/app/jscaip/Player';
import { P4Move } from 'src/app/games/p4/P4Move';
import { AuthenticationServiceMock } from 'src/app/services/tests/AuthenticationService.spec';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { P4Component } from 'src/app/games/p4/p4.component';
import { LocalGameWrapperComponent } from './local-game-wrapper.component';
import { DebugElement } from '@angular/core';

describe('LocalGameWrapperComponent', () => {
    let componentTestUtils: ComponentTestUtils<P4Component>;
    const O: number = Player.ZERO.value;
    const X: number = Player.ONE.value;
    const _: number = Player.NONE.value;

    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame<P4Component>('P4', LocalGameWrapperComponent);
        AuthenticationServiceMock.setUser(AuthenticationServiceMock.CONNECTED);
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
        const slice: P4PartSlice = componentTestUtils.getComponent().rules.node.gamePartSlice;
        expect(slice.turn).toBe(0);

        await componentTestUtils.expectMoveSuccess('#click_4', P4Move.FOUR);
        expect(componentTestUtils.getComponent().rules.node.gamePartSlice.turn).toBe(1);

        spyOn(componentTestUtils.getComponent(), 'updateBoard').and.callThrough();
        await componentTestUtils.expectInterfaceClickSuccess('#takeBack');

        expect(componentTestUtils.getComponent().rules.node.gamePartSlice.turn).toBe(0);
        expect(componentTestUtils.getComponent().updateBoard).toHaveBeenCalledTimes(1);
    }));
    it('should show draw', fakeAsync(async() => {
        const board: number[][] = [
            [O, O, O, _, O, O, O],
            [X, X, X, O, X, X, X],
            [O, O, O, X, O, O, O],
            [X, X, X, O, X, X, X],
            [O, O, O, X, O, O, O],
            [X, X, X, O, X, X, X],
        ];
        const state: P4PartSlice = new P4PartSlice(board, 41);
        componentTestUtils.setupSlice(state);

        await componentTestUtils.expectMoveSuccess('#click_3', P4Move.THREE);
        expect(componentTestUtils.findElement('#draw')).withContext('Draw indicator should be present').toBeTruthy();
    }));
    it('should show score if needed', fakeAsync(async() => {
        componentTestUtils.getComponent().showScore = false;
        componentTestUtils.expectElementNotToExist('#scoreZero');
        componentTestUtils.expectElementNotToExist('#scoreOne');

        componentTestUtils.getComponent().showScore = true;
        componentTestUtils.getComponent()['scores'] = [0, 0];
        componentTestUtils.detectChanges();

        componentTestUtils.expectElementToExist('#scoreZero');
        componentTestUtils.expectElementToExist('#scoreOne');
    }));
    describe('restarting games', () => {
        it('should allow to restart game during the play', fakeAsync(async() => {
            expect(componentTestUtils.findElement('#restartButton'));
            await componentTestUtils.expectInterfaceClickSuccess('#restartButton');
        }));
        it('should allow to restart game at the end', fakeAsync(async() => {
            const board: number[][] = [
                [O, O, O, _, O, O, O],
                [X, X, X, O, X, X, X],
                [O, O, O, X, O, O, O],
                [X, X, X, O, X, X, X],
                [O, O, O, X, O, O, O],
                [X, X, X, O, X, X, X],
            ];
            const slice: P4PartSlice = new P4PartSlice(board, 41);
            componentTestUtils.setupSlice(slice);

            await componentTestUtils.expectMoveSuccess('#click_3', P4Move.THREE);

            expect(componentTestUtils.findElement('#restartButton'))
                .withContext('Restart button should be present after end game').toBeTruthy();

            await componentTestUtils.expectInterfaceClickSuccess('#restartButton');

            expect(componentTestUtils.getComponent().rules.node.gamePartSlice.turn).toBe(0);
            expect(componentTestUtils.findElement('#draw')).withContext('Draw indicator should be removed').toBeFalsy();
            flush();
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
            expect(aiDepth).toBe('Niveau 1');
            componentTestUtils.detectChanges();
            await componentTestUtils.fixture.whenStable();
            expect(proposeAIToPlay).toHaveBeenCalledTimes(2);
            // Once by changing it on the select, once after the AI move and check who is next
        });
        it('should propose AI to play when restarting game', fakeAsync(async() => {
            const wrapper: LocalGameWrapperComponent = componentTestUtils.wrapper as LocalGameWrapperComponent;
            wrapper.players[0] = 'P4Minimax';
            wrapper.aiDepths[0] = '1';

            const proposeAIToPlay: jasmine.Spy = spyOn(wrapper, 'proposeAIToPlay').and.callThrough();

            await componentTestUtils.expectInterfaceClickSuccess('#restartButton');
            componentTestUtils.detectChanges();
            await componentTestUtils.fixture.whenStable();

            expect(proposeAIToPlay).toHaveBeenCalledTimes(1);
            flush();
        }));
        it('should propose AI 2 to play when selecting her just before her turn', async() => {
            // given wrapper on which a first move have been done
            await componentTestUtils.expectMoveSuccess('#click_4', P4Move.FOUR);

            // when clicking on AI then it's level
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
    });
});
