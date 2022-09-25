/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { QuixoComponent } from '../quixo.component';
import { QuixoMove } from 'src/app/games/quixo/QuixoMove';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { Coord } from 'src/app/jscaip/Coord';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { Table } from 'src/app/utils/ArrayUtils';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { QuixoState } from 'src/app/games/quixo/QuixoState';
import { QuixoFailure } from 'src/app/games/quixo/QuixoFailure';
import { MGPOptional } from 'src/app/utils/MGPOptional';

describe('QuixoComponent', () => {

    let testUtils: ComponentTestUtils<QuixoComponent>;

    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;
    const X: PlayerOrNone = PlayerOrNone.ONE;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<QuixoComponent>('Quixo');
    }));
    it('should create', () => {
        expect(testUtils.wrapper).withContext('Wrapper should be created').toBeTruthy();
        expect(testUtils.getComponent()).withContext('Component should be created').toBeTruthy();
    });
    it('should style piece correctly', () => {
        testUtils.getComponent().chosenCoord = MGPOptional.of(new Coord(0, 0));
        expect(testUtils.getComponent().getPieceClasses(0, 0)).toContain('selected-stroke');

        testUtils.getComponent().lastMoveCoord = MGPOptional.of(new Coord(4, 4));
        expect(testUtils.getComponent().getPieceClasses(4, 4)).toContain('last-move-stroke');
    });
    it('should give correct direction', () => {
        testUtils.getComponent().chosenCoord = MGPOptional.of(new Coord(0, 0));
        expect(testUtils.getComponent().getPossiblesDirections()).toEqual(['RIGHT', 'DOWN']);

        testUtils.getComponent().onBoardClick(4, 4);
        expect(testUtils.getComponent().getPossiblesDirections()).toEqual(['LEFT', 'UP']);
    });
    it('should cancel move when trying to select opponent piece', fakeAsync(async() => {
        const board: Table<PlayerOrNone> = [
            [O, _, _, _, _],
            [_, _, _, _, _],
            [X, _, _, _, X],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const state: QuixoState = new QuixoState(board, 3);
        testUtils.setupState(state);

        await testUtils.expectClickFailure('#click_0_0', RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
    }));
    it('should cancel move when trying to select center coord', fakeAsync(async() => {
        const board: Table<PlayerOrNone> = [
            [O, _, _, _, _],
            [_, _, _, _, _],
            [X, _, _, _, X],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const state: QuixoState = new QuixoState(board, 3);
        testUtils.setupState(state);

        await testUtils.expectClickFailure('#click_1_1', QuixoFailure.NO_INSIDE_CLICK());
    }));
    it('should highlight victory', fakeAsync(async() => {
        const board: Table<PlayerOrNone> = [
            [O, O, O, O, O],
            [_, _, _, _, _],
            [X, _, _, _, X],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const state: QuixoState = new QuixoState(board, 3);
        testUtils.setupState(state);

        expect(testUtils.getComponent().getPieceClasses(0, 0)).toContain('victory-stroke');
        expect(testUtils.getComponent().getPieceClasses(1, 0)).toContain('victory-stroke');
        expect(testUtils.getComponent().getPieceClasses(2, 0)).toContain('victory-stroke');
        expect(testUtils.getComponent().getPieceClasses(3, 0)).toContain('victory-stroke');
        expect(testUtils.getComponent().getPieceClasses(4, 0)).toContain('victory-stroke');
    }));
    it('should show insertion directions when clicking on a border space', fakeAsync(async() => {
        await testUtils.expectClickSuccess('#click_0_0');
        testUtils.expectElementToExist('#chooseDirection_DOWN');
    }));
    it('should allow a simple move', fakeAsync(async() => {
        await testUtils.expectClickSuccess('#click_4_0');
        await testUtils.expectMoveSuccess('#chooseDirection_LEFT', new QuixoMove(4, 0, Orthogonal.LEFT));
    }));
    it('should allow a simple move upwards', fakeAsync(async() => {
        await testUtils.expectClickSuccess('#click_4_4');
        await testUtils.expectMoveSuccess('#chooseDirection_UP', new QuixoMove(4, 4, Orthogonal.UP));
    }));
});
