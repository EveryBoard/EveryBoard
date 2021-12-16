import { fakeAsync } from '@angular/core/testing';
import { QuixoComponent } from '../quixo.component';
import { QuixoMove } from 'src/app/games/quixo/QuixoMove';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { Coord } from 'src/app/jscaip/Coord';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { Table } from 'src/app/utils/ArrayUtils';
import { Player } from 'src/app/jscaip/Player';
import { QuixoState } from 'src/app/games/quixo/QuixoState';
import { QuixoFailure } from 'src/app/games/quixo/QuixoFailure';
import { MGPOptional } from 'src/app/utils/MGPOptional';

describe('QuixoComponent', () => {

    let componentTestUtils: ComponentTestUtils<QuixoComponent>;

    const _: Player = Player.NONE;
    const X: Player = Player.ONE;
    const O: Player = Player.ZERO;

    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame<QuixoComponent>('Quixo');
    }));
    it('should create', () => {
        expect(componentTestUtils.wrapper).withContext('Wrapper should be created').toBeTruthy();
        expect(componentTestUtils.getComponent()).withContext('Component should be created').toBeTruthy();
    });
    it('should style piece correctly', () => {
        componentTestUtils.getComponent().chosenCoord = MGPOptional.of(new Coord(0, 0));
        expect(componentTestUtils.getComponent().getPieceClasses(0, 0)).toContain('selected');

        componentTestUtils.getComponent().lastMoveCoord = MGPOptional.of(new Coord(4, 4));
        expect(componentTestUtils.getComponent().getPieceClasses(4, 4)).toContain('last-move');
    });
    it('should give correct direction', () => {
        componentTestUtils.getComponent().chosenCoord = MGPOptional.of(new Coord(0, 0));
        expect(componentTestUtils.getComponent().getPossiblesDirections()).toEqual(['RIGHT', 'DOWN']);

        componentTestUtils.getComponent().onBoardClick(4, 4);
        expect(componentTestUtils.getComponent().getPossiblesDirections()).toEqual(['LEFT', 'UP']);
    });
    it('should cancel move when trying to select opponent piece', fakeAsync(async() => {
        const board: Table<Player> = [
            [O, _, _, _, _],
            [_, _, _, _, _],
            [X, _, _, _, X],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const state: QuixoState = new QuixoState(board, 3);
        componentTestUtils.setupState(state);

        await componentTestUtils.expectClickFailure('#click_0_0', RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
    }));
    it('should cancel move when trying to select center coord', fakeAsync(async() => {
        const board: Table<Player> = [
            [O, _, _, _, _],
            [_, _, _, _, _],
            [X, _, _, _, X],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const state: QuixoState = new QuixoState(board, 3);
        componentTestUtils.setupState(state);

        await componentTestUtils.expectClickFailure('#click_1_1', QuixoFailure.NO_INSIDE_CLICK());
    }));
    it('should highlight victory', fakeAsync(async() => {
        const board: Table<Player> = [
            [O, O, O, O, O],
            [_, _, _, _, _],
            [X, _, _, _, X],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const state: QuixoState = new QuixoState(board, 3);
        componentTestUtils.setupState(state);

        expect(componentTestUtils.getComponent().getPieceClasses(0, 0)).toContain('victory-stroke');
        expect(componentTestUtils.getComponent().getPieceClasses(1, 0)).toContain('victory-stroke');
        expect(componentTestUtils.getComponent().getPieceClasses(2, 0)).toContain('victory-stroke');
        expect(componentTestUtils.getComponent().getPieceClasses(3, 0)).toContain('victory-stroke');
        expect(componentTestUtils.getComponent().getPieceClasses(4, 0)).toContain('victory-stroke');
    }));
    it('should show insertion directions when clicking on a border case', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_0_0');
        componentTestUtils.expectElementToExist('#chooseDirection_DOWN');
    }));
    it('should allow a simple move', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_4_0');
        await componentTestUtils.expectMoveSuccess('#chooseDirection_LEFT', new QuixoMove(4, 0, Orthogonal.LEFT));
    }));
    it('should allow a simple move upwards', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_4_4');
        await componentTestUtils.expectMoveSuccess('#chooseDirection_UP', new QuixoMove(4, 4, Orthogonal.UP));
    }));
});
