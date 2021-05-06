import { fakeAsync } from '@angular/core/testing';
import { P4PartSlice } from 'src/app/games/p4/P4PartSlice';
import { Player } from 'src/app/jscaip/Player';
import { P4Move } from 'src/app/games/p4/P4Move';
import { AuthenticationServiceMock } from 'src/app/services/authentication/AuthenticationService.spec';
import { ComponentTestUtils } from 'src/app/utils/TestUtils.spec';
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
    it('should have game included after view init', fakeAsync(() => {
        const gameIncluderTag: DebugElement = componentTestUtils.querySelector('app-game-includer');
        let p4Tag: DebugElement = componentTestUtils.querySelector('app-p4');
        expect(gameIncluderTag).toBeTruthy('app-game-includer tag should be present at start');

        p4Tag = componentTestUtils.querySelector('app-p4');
        expect(p4Tag).toBeTruthy('app-p4 tag should be present after view init');

        expect(componentTestUtils.wrapper.gameIncluder).toBeTruthy('gameIncluder should exist after view init');
        expect(componentTestUtils.wrapper.gameComponent)
            .toBeTruthy('gameComponent should be present once component view init');
    }));
    it('connected user should be able to play', fakeAsync(async() => {
        const slice: P4PartSlice = componentTestUtils.getComponent().rules.node.gamePartSlice;
        componentTestUtils.setupSlice(slice);
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
            [X, X, X, _, X, X, X],
            [O, O, O, X, O, O, O],
            [X, X, X, O, X, X, X],
            [O, O, O, X, O, O, O],
            [X, X, X, O, X, X, X],
            [O, O, O, X, O, O, O],
        ];
        const slice: P4PartSlice = new P4PartSlice(board, 0);
        componentTestUtils.setupSlice(slice);

        await componentTestUtils.expectMoveSuccess('#click_3', P4Move.THREE);
        expect(componentTestUtils.findElement('#draw')).toBeTruthy('Draw indicator should be present');
    }));
    it('should show score if needed', fakeAsync(async() => {
        componentTestUtils.getComponent().showScore = false;
        expect(componentTestUtils.findElement('#scoreZero')).toBeFalsy();
        expect(componentTestUtils.findElement('#scoreOne')).toBeFalsy();

        componentTestUtils.getComponent().showScore = true;
        componentTestUtils.getComponent()['scores'] = [0, 0];
        componentTestUtils.fixture.detectChanges();

        expect(componentTestUtils.findElement('#scoreZero')).toBeTruthy();
        expect(componentTestUtils.findElement('#scoreOne')).toBeTruthy();
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

        expect(componentTestUtils.findElement('#restartButton'))
            .toBeFalsy('Restart button should be absent during the game');

        await componentTestUtils.expectMoveSuccess('#click_3', P4Move.THREE);

        expect(componentTestUtils.findElement('#restartButton'))
            .toBeTruthy('Restart button should be present after end game');

        await componentTestUtils.expectInterfaceClickSuccess('#restartButton');

        expect(componentTestUtils.getComponent().rules.node.gamePartSlice.turn).toBe(0);
        expect(componentTestUtils.findElement('#draw')).toBeFalsy('Draw indicator should be removed');
    }));
});
