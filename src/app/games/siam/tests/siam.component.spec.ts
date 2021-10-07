import { SiamComponent } from '../siam.component';
import { SiamMove } from 'src/app/games/siam/SiamMove';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { SiamPiece } from 'src/app/games/siam/SiamPiece';
import { NumberTable } from 'src/app/utils/ArrayUtils';
import { SiamPartSlice } from 'src/app/games/siam/SiamPartSlice';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { fakeAsync } from '@angular/core/testing';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { SiamFailure } from '../SiamFailure';

describe('SiamComponent', () => {
    let componentTestUtils: ComponentTestUtils<SiamComponent>;

    const _: number = SiamPiece.EMPTY.value;
    const M: number = SiamPiece.MOUNTAIN.value;
    const U: number = SiamPiece.WHITE_UP.value;
    const u: number = SiamPiece.BLACK_UP.value;

    const expectMoveLegality: (move: SiamMove) => Promise<void> = async(move: SiamMove) => {
        if (move.isInsertion()) {
            await componentTestUtils.expectClickSuccess('#insertAt_' + move.coord.x + '_' + move.coord.y);
            const orientation: string = move.landingOrientation.toString();
            return componentTestUtils.expectMoveSuccess('#chooseOrientation_' + orientation, move);
        } else {
            await componentTestUtils.expectClickSuccess('#clickPiece_' + move.coord.x + '_' + move.coord.y);
            const direction: Orthogonal = move.moveDirection.getOrNull();
            const moveDirection: string = direction ? direction.toString() : '';
            await componentTestUtils.expectClickSuccess('#chooseDirection_' + moveDirection);
            const landingOrientation: string = move.landingOrientation.toString();
            return componentTestUtils.expectMoveSuccess('#chooseOrientation_' + landingOrientation, move);
        }
    };
    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame<SiamComponent>('Siam');
    }));
    it('should create', () => {
        expect(componentTestUtils.wrapper).withContext('Wrapper should be created').toBeTruthy();
        expect(componentTestUtils.getComponent()).withContext('Component should be created').toBeTruthy();
    });
    it('should accept insertion at first turn', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#insertAt_2_-1');
        const move: SiamMove = new SiamMove(2, -1, MGPOptional.of(Orthogonal.DOWN), Orthogonal.DOWN);
        await componentTestUtils.expectMoveSuccess('#chooseOrientation_DOWN', move);
    }));
    it('Should not allow to move ennemy pieces', fakeAsync(async() => {
        const board: NumberTable = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, u],
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        componentTestUtils.setupSlice(slice);

        await componentTestUtils.expectClickFailure('#clickPiece_4_4', RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
    }));
    it('should cancel move when trying to insert while having selected a piece', fakeAsync(async() => {
        const board: NumberTable = [
            [U, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        componentTestUtils.setupSlice(slice);

        await componentTestUtils.expectClickSuccess('#clickPiece_0_0');

        await componentTestUtils.expectClickFailure('#insertAt_-1_2', SiamFailure.CANNOT_INSERT_WHEN_SELECTED());
    }));
    it('should allow rotation', fakeAsync(async() => {
        const board: NumberTable = [
            [U, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        componentTestUtils.setupSlice(slice);

        const move: SiamMove = new SiamMove(0, 0, MGPOptional.empty(), Orthogonal.DOWN);
        await expectMoveLegality(move);
    }));
    it('should allow normal move', fakeAsync(async() => {
        const board: NumberTable = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, U],
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        componentTestUtils.setupSlice(slice);

        const move: SiamMove = new SiamMove(4, 4, MGPOptional.of(Orthogonal.LEFT), Orthogonal.LEFT);
        await expectMoveLegality(move);
    }));
    it('should highlight all moved pieces upon push', fakeAsync(async() => {
        const board: NumberTable = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, U],
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        componentTestUtils.setupSlice(slice);

        const move: SiamMove = new SiamMove(5, 4, MGPOptional.of(Orthogonal.LEFT), Orthogonal.LEFT);
        await expectMoveLegality(move);

        expect(componentTestUtils.expectElementToHaveClasses('#insertAt_4_4', ['base', 'moved']));
        expect(componentTestUtils.expectElementToHaveClasses('#insertAt_3_4', ['base', 'moved']));
        expect(componentTestUtils.expectElementToHaveClasses('#insertAt_2_4', ['base']));
    }));
    it('should decide outing orientation automatically', fakeAsync(async() => {
        const board: NumberTable = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, U],
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        componentTestUtils.setupSlice(slice);

        await componentTestUtils.expectClickSuccess('#clickPiece_4_4');
        const move: SiamMove = new SiamMove(4, 4, MGPOptional.of(Orthogonal.DOWN), Orthogonal.DOWN);
        await componentTestUtils.expectMoveSuccess('#chooseDirection_DOWN', move);
    }));
});
