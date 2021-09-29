import { SiamComponent } from '../siam.component';
import { SiamMove } from 'src/app/games/siam/SiamMove';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { SiamPiece } from 'src/app/games/siam/SiamPiece';
import { Table } from 'src/app/utils/ArrayUtils';
import { SiamState } from 'src/app/games/siam/SiamState';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { fakeAsync } from '@angular/core/testing';

describe('SiamComponent', () => {

    let componentTestUtils: ComponentTestUtils<SiamComponent>;

    const _: SiamPiece = SiamPiece.EMPTY;
    const M: SiamPiece = SiamPiece.MOUNTAIN;
    const U: SiamPiece = SiamPiece.WHITE_UP;
    const u: SiamPiece = SiamPiece.BLACK_UP;

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
        expect(componentTestUtils.wrapper).toBeTruthy('Wrapper should be created');
        expect(componentTestUtils.getComponent()).toBeTruthy('Component should be created');
    });
    it('should accept insertion at first turn', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#insertAt_2_-1');
        const move: SiamMove = new SiamMove(2, -1, MGPOptional.of(Orthogonal.DOWN), Orthogonal.DOWN);
        await componentTestUtils.expectMoveSuccess('#chooseOrientation_DOWN', move);
    }));
    it('Should not allow to move ennemy pieces', fakeAsync(async() => {
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, u],
        ];
        const state: SiamState = new SiamState(board, 0);
        componentTestUtils.setupState(state);

        await componentTestUtils.expectClickFailure('#clickPiece_4_4', `Can't choose ennemy's pieces`);
    }));
    it('should cancel move when trying to insert while having selected a piece', fakeAsync(async() => {
        const board: Table<SiamPiece> = [
            [U, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);
        componentTestUtils.setupState(state);

        await componentTestUtils.expectClickSuccess('#clickPiece_0_0');

        const reason: string = `Can't insert when there is already a selected piece`;
        await componentTestUtils.expectClickFailure('#insertAt_-1_2', reason);
    }));
    it('should allow rotation', fakeAsync(async() => {
        const board: Table<SiamPiece> = [
            [U, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const state: SiamState = new SiamState(board, 0);
        componentTestUtils.setupState(state);

        const move: SiamMove = new SiamMove(0, 0, MGPOptional.empty(), Orthogonal.DOWN);
        await expectMoveLegality(move);
    }));
    it('should allow normal move', fakeAsync(async() => {
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, U],
        ];
        const state: SiamState = new SiamState(board, 0);
        componentTestUtils.setupState(state);

        const move: SiamMove = new SiamMove(4, 4, MGPOptional.of(Orthogonal.LEFT), Orthogonal.LEFT);
        await expectMoveLegality(move);
    }));
    it('should highlight all moved pieces upon push', fakeAsync(async() => {
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, U],
        ];
        const state: SiamState = new SiamState(board, 0);
        componentTestUtils.setupState(state);

        const move: SiamMove = new SiamMove(5, 4, MGPOptional.of(Orthogonal.LEFT), Orthogonal.LEFT);
        await expectMoveLegality(move);

        expect(componentTestUtils.expectElementToHaveClasses('#insertAt_4_4', ['base', 'moved']));
        expect(componentTestUtils.expectElementToHaveClasses('#insertAt_3_4', ['base', 'moved']));
        expect(componentTestUtils.expectElementToHaveClasses('#insertAt_2_4', ['base']));
    }));
    it('should decide outing orientation automatically', fakeAsync(async() => {
        const board: Table<SiamPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, U],
        ];
        const state: SiamState = new SiamState(board, 0);
        componentTestUtils.setupState(state);

        await componentTestUtils.expectClickSuccess('#clickPiece_4_4');
        const move: SiamMove = new SiamMove(4, 4, MGPOptional.of(Orthogonal.DOWN), Orthogonal.DOWN);
        await componentTestUtils.expectMoveSuccess('#chooseDirection_DOWN', move);
    }));
});
