import { TablutComponent } from '../tablut.component';
import { TablutMove } from 'src/app/games/tablut/TablutMove';
import { Coord } from 'src/app/jscaip/Coord';
import { TablutCase } from 'src/app/games/tablut/TablutCase';
import { TablutPartSlice } from 'src/app/games/tablut/TablutPartSlice';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { fakeAsync } from '@angular/core/testing';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';

describe('TablutComponent', () => {
    let componentTestUtils: ComponentTestUtils<TablutComponent>;

    const _: number = TablutCase.UNOCCUPIED.value;
    const x: number = TablutCase.INVADERS.value;
    const i: number = TablutCase.DEFENDERS.value;
    const A: number = TablutCase.PLAYER_ONE_KING.value;

    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame<TablutComponent>('Tablut');
    }));
    it('should create', () => {
        expect(componentTestUtils.wrapper).withContext('Wrapper should be created').toBeDefined();
        expect(componentTestUtils.getComponent()).withContext('Component should be created').toBeDefined();
    });
    it('Should cancel move when clicking on opponent piece', fakeAsync( async() => {
        await componentTestUtils.expectClickFailure('#click_4_4', RulesFailure.CANNOT_CHOOSE_ENEMY_PIECE());
    }));
    it('Should cancel move when first click on empty case', fakeAsync( async() => {
        await componentTestUtils.expectClickFailure('#click_0_0', RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
    }));
    it('Should allow simple move', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_4_1');
        const move: TablutMove = new TablutMove(new Coord(4, 1), new Coord(0, 1));
        await componentTestUtils.expectMoveSuccess('#click_0_1', move);
    }));
    it('Diagonal move attempt should not throw', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_3_0');
        const message: string = 'TablutMove cannot be diagonal.';
        expect(async() => await componentTestUtils.expectClickFailure('#click_4_1', message)).not.toThrow();
    }));
    it('Should show captured piece and left cases', fakeAsync(async() => {
        const board: number[][] = [
            [_, A, _, _, _, _, _, _, _],
            [_, x, x, _, _, _, _, _, _],
            [_, _, i, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const initialSlice: TablutPartSlice = new TablutPartSlice(board, 1);
        componentTestUtils.setupSlice(initialSlice);

        await componentTestUtils.expectClickSuccess('#click_1_0');
        const move: TablutMove = new TablutMove(new Coord(1, 0), new Coord(2, 0));
        await componentTestUtils.expectMoveSuccess('#click_2_0', move);

        const tablutGameComponent: TablutComponent = componentTestUtils.getComponent();
        expect(tablutGameComponent.getRectClasses(2, 1)).toContain('captured');
        expect(tablutGameComponent.getRectClasses(1, 0)).toContain('moved');
        expect(tablutGameComponent.getRectClasses(2, 0)).toContain('moved');
    }));
});
