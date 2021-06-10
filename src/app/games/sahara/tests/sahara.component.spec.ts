import { fakeAsync } from '@angular/core/testing';
import { SaharaComponent } from '../sahara.component';
import { Coord } from 'src/app/jscaip/Coord';
import { SaharaMove } from 'src/app/games/sahara/SaharaMove';
import { NumberTable } from 'src/app/utils/ArrayUtils';
import { SaharaPawn } from 'src/app/games/sahara/SaharaPawn';
import { SaharaPartSlice } from 'src/app/games/sahara/SaharaPartSlice';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';

describe('SaharaComponent', () => {
    let componentTestUtils: ComponentTestUtils<SaharaComponent>;
    const N: number = SaharaPawn.NONE;
    const O: number = SaharaPawn.BLACK;
    const X: number = SaharaPawn.WHITE;
    const _: number = SaharaPawn.EMPTY;

    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame<SaharaComponent>('Sahara');
    }));
    it('should create', () => {
        expect(componentTestUtils.wrapper).toBeTruthy('Wrapper should be created');
        expect(componentTestUtils.getComponent()).toBeTruthy('Component should be created');
    });
    it('Should play correctly shortest victory', fakeAsync(async() => {
        const board: NumberTable = [
            [N, N, _, X, _, _, _, O, X, N, N],
            [N, _, O, _, _, _, _, _, _, _, N],
            [X, _, _, _, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, _, _, _, X],
            [N, _, _, _, _, _, _, X, _, _, N],
            [N, N, X, O, _, _, _, _, O, N, N],
        ];
        const initialSlice: SaharaPartSlice = new SaharaPartSlice(board, 2);
        componentTestUtils.setupSlice(initialSlice);

        await componentTestUtils.expectClickSuccess('#click_2_1'); // select first piece
        const move: SaharaMove = new SaharaMove(new Coord(2, 1), new Coord(1, 2));
        await componentTestUtils.expectMoveSuccess('#click_1_2', move); // select landing

        expect(componentTestUtils.wrapper.endGame).toBeTrue();
    }));
    it('should not allow to click on empty case when no pyramid selected', fakeAsync(async() => {
        // given initial board
        // when clicking on empty case, expect move to be refused
        await componentTestUtils.expectClickFailure('#click_2_2', 'Vous devez d\'abord choisir une de vos pyramides!');
    }));
    it('should not allow to select ennemy pyramid', fakeAsync(async() => {
        // given initial board
        // when clicking on empty case, expect move to be refused
        await componentTestUtils.expectClickFailure('#click_0_4', 'Vous devez choisir une de vos pyramides!');
    }));
    it('should not allow to land on ennemy pyramid', fakeAsync(async() => {
        // given initial board
        await componentTestUtils.expectClickSuccess('#click_2_0');
        const move: SaharaMove = new SaharaMove(new Coord(2, 0), new Coord(3, 0));
        await componentTestUtils.expectMoveFailure('#click_3_0', RulesFailure.MUST_LAND_ON_EMPTY_CASE, move);
    }));
    it('should not allow to bounce on occupied brown case', fakeAsync(async() => {
        // given initial board
        await componentTestUtils.expectClickSuccess('#click_7_0');
        const move: SaharaMove = new SaharaMove(new Coord(7, 0), new Coord(8, 1));
        const reason: string = 'Vous ne pouvez rebondir que sur les cases rouges!';
        await componentTestUtils.expectMoveFailure('#click_8_1', reason, move);
    }));
    it('should not allow invalid moves', fakeAsync(async() => {
        // given initial board
        await componentTestUtils.expectClickSuccess('#click_0_3');
        const reason: string = 'Vous pouvez vous déplacer maximum de 2 cases, pas de 3.';
        await componentTestUtils.expectClickFailure('#click_2_2', reason);
    }));
    it('should change selected piece when clicking twice in a row on current player pieces', fakeAsync(async() => {
        // given initial board
        await componentTestUtils.expectClickSuccess('#click_2_0');
        await componentTestUtils.expectClickSuccess('#click_7_0');
    }));
});
