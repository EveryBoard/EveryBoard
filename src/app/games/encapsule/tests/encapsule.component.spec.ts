/* eslint-disable max-lines-per-function */
import { EncapsuleComponent } from '../encapsule.component';
import { EncapsuleMove } from 'src/app/games/encapsule/EncapsuleMove';
import { Coord } from 'src/app/jscaip/Coord';
import { EncapsuleCase, EncapsuleState } from 'src/app/games/encapsule/EncapsuleState';
import { EncapsuleMinimax } from 'src/app/games/encapsule/EncapsuleMinimax';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { EncapsulePiece } from 'src/app/games/encapsule/EncapsulePiece';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { fakeAsync } from '@angular/core/testing';
import { EncapsuleFailure } from '../EncapsuleFailure';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { EncapsuleNode } from '../EncapsuleRules';

describe('EncapsuleComponent', () => {

    let testUtils: ComponentTestUtils<EncapsuleComponent>;

    const _: EncapsuleCase = new EncapsuleCase(PlayerOrNone.NONE, PlayerOrNone.NONE, PlayerOrNone.NONE);
    const emptyBoard: EncapsuleCase[][] = [
        [_, _, _],
        [_, _, _],
        [_, _, _],
    ];
    const P0Turn: number = 6;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<EncapsuleComponent>('Encapsule');
    }));
    it('should create', () => {
        expect(testUtils.wrapper).withContext('Wrapper should be created').toBeTruthy();
        expect(testUtils.getComponent()).withContext('EncapsuleComponent should be created').toBeTruthy();
    });
    it('should drop a piece on the board when selecting it and dropping it', fakeAsync(async() => {
        await testUtils.expectClickSuccess('#piece_0_SMALL_DARK');

        const move: EncapsuleMove = EncapsuleMove.fromDrop(EncapsulePiece.SMALL_DARK, new Coord(0, 0));
        await testUtils.expectMoveSuccess('#click_0_0', move);
    }));
    it('should forbid clicking directly on the board without selecting a piece', fakeAsync(async() => {
        await testUtils.expectClickFailure('#click_0_0', EncapsuleFailure.INVALID_PIECE_SELECTED());
    }));
    it('should allow dropping a piece on a smaller one', fakeAsync(async() => {
        const x: EncapsuleCase = new EncapsuleCase(Player.ONE, PlayerOrNone.NONE, PlayerOrNone.NONE);
        const board: EncapsuleCase[][] = [
            [_, _, _],
            [x, _, _],
            [_, _, _],
        ];
        testUtils.setupState(new EncapsuleState(board, P0Turn, [EncapsulePiece.MEDIUM_DARK]));
        await testUtils.expectClickSuccess('#piece_0_MEDIUM_DARK');

        const move: EncapsuleMove = EncapsuleMove.fromDrop(EncapsulePiece.MEDIUM_DARK, new Coord(0, 1));
        await testUtils.expectMoveSuccess('#click_0_1', move);
    }));
    it('should forbid dropping a piece on a bigger one', fakeAsync(async() => {
        const x: EncapsuleCase = new EncapsuleCase(PlayerOrNone.NONE, Player.ONE, PlayerOrNone.NONE);
        const board: EncapsuleCase[][] = [
            [_, _, _],
            [x, _, _],
            [_, _, _],
        ];
        testUtils.setupState(new EncapsuleState(board, P0Turn, [EncapsulePiece.SMALL_DARK]));
        await testUtils.expectClickSuccess('#piece_0_SMALL_DARK');

        const move: EncapsuleMove = EncapsuleMove.fromDrop(EncapsulePiece.SMALL_DARK, new Coord(0, 1));
        await testUtils.expectMoveFailure('#click_0_1', EncapsuleFailure.INVALID_PLACEMENT(), move);
    }));
    it('should forbid selecting a piece that is not remaining', fakeAsync(async() => {
        testUtils.setupState(new EncapsuleState(emptyBoard, P0Turn, []));

        testUtils.expectElementNotToExist('#piece_0_SMALL_DARK');
    }));
    it('should forbid selecting a piece from the other player', fakeAsync(async() => {
        testUtils.setupState(new EncapsuleState(emptyBoard, P0Turn, [EncapsulePiece.SMALL_LIGHT]));

        await testUtils.expectClickFailure('#piece_1_SMALL_LIGHT', EncapsuleFailure.NOT_DROPPABLE());
    }));
    it('should move a piece when clicking on the piece and clicking on its destination coord', fakeAsync(async() => {
        const x: EncapsuleCase = new EncapsuleCase(PlayerOrNone.NONE, Player.ZERO, PlayerOrNone.NONE);
        const board: EncapsuleCase[][] = [
            [_, _, _],
            [x, _, _],
            [_, _, _],
        ];
        testUtils.setupState(new EncapsuleState(board, P0Turn, []));

        await testUtils.expectClickSuccess('#click_0_1');

        const move: EncapsuleMove = EncapsuleMove.fromMove(new Coord(0, 1), new Coord(0, 2));
        await testUtils.expectMoveSuccess('#click_0_2', move);
    }));
    it('should forbid moving from a space that the player is not controlling', fakeAsync(async() => {
        const x: EncapsuleCase = new EncapsuleCase(PlayerOrNone.NONE, Player.ONE, PlayerOrNone.NONE);
        const board: EncapsuleCase[][] = [
            [_, _, _],
            [x, _, _],
            [_, _, _],
        ];
        testUtils.setupState(new EncapsuleState(board, P0Turn, []));

        await testUtils.expectClickFailure('#click_0_1', EncapsuleFailure.INVALID_PIECE_SELECTED());
    }));
    it('should allow moving a piece on top of a smaller one', fakeAsync(async() => {
        const x: EncapsuleCase = new EncapsuleCase(PlayerOrNone.NONE, Player.ZERO, PlayerOrNone.NONE);
        const X: EncapsuleCase = new EncapsuleCase(PlayerOrNone.NONE, PlayerOrNone.NONE, Player.ZERO);
        const board: EncapsuleCase[][] = [
            [_, _, _],
            [x, X, _],
            [_, _, _],
        ];
        testUtils.setupState(new EncapsuleState(board, P0Turn, []));

        await testUtils.expectClickSuccess('#click_1_1');

        const move: EncapsuleMove = EncapsuleMove.fromMove(new Coord(1, 1), new Coord(0, 1));
        await testUtils.expectMoveSuccess('#click_0_1', move);
    }));
    it('should forbid moving a piece on top of a bigger one', fakeAsync(async() => {
        const x: EncapsuleCase = new EncapsuleCase(PlayerOrNone.NONE, Player.ZERO, PlayerOrNone.NONE);
        const X: EncapsuleCase = new EncapsuleCase(PlayerOrNone.NONE, PlayerOrNone.NONE, Player.ZERO);
        const board: EncapsuleCase[][] = [
            [_, _, _],
            [x, X, _],
            [_, _, _],
        ];
        testUtils.setupState(new EncapsuleState(board, P0Turn, []));

        await testUtils.expectClickSuccess('#click_0_1');

        const move: EncapsuleMove = EncapsuleMove.fromMove(new Coord(0, 1), new Coord(1, 1));
        await testUtils.expectMoveFailure('#click_1_1', EncapsuleFailure.INVALID_PLACEMENT(), move);
    }));
    it('should detect victory', fakeAsync(async() => {
        const x: EncapsuleCase = new EncapsuleCase(PlayerOrNone.NONE, Player.ZERO, PlayerOrNone.NONE);
        const X: EncapsuleCase = new EncapsuleCase(PlayerOrNone.NONE, PlayerOrNone.NONE, Player.ZERO);
        const board: EncapsuleCase[][] = [
            [_, _, _],
            [x, X, _],
            [_, _, _],
        ];
        testUtils.setupState(new EncapsuleState(board, P0Turn, [EncapsulePiece.MEDIUM_DARK]));

        await testUtils.expectClickSuccess('#piece_0_MEDIUM_DARK');

        const move: EncapsuleMove = EncapsuleMove.fromDrop(EncapsulePiece.MEDIUM_DARK, new Coord(2, 1));
        await testUtils.expectMoveSuccess('#click_2_1', move);

        const component: EncapsuleComponent = testUtils.getComponent();
        const minimax: EncapsuleMinimax = new EncapsuleMinimax(component.rules, 'EncapsuleMinimax');

        const node: EncapsuleNode = new EncapsuleNode(component.getState(),
                                                      MGPOptional.empty(),
                                                      MGPOptional.of(move));
        expect(minimax.getBoardValue(node).value).toBe(Number.MIN_SAFE_INTEGER);
    }));
    it('should forbid selecting the same coord for destination and origin', fakeAsync(async() => {
        const x: EncapsuleCase = new EncapsuleCase(PlayerOrNone.NONE, Player.ZERO, PlayerOrNone.NONE);
        const board: EncapsuleCase[][] = [
            [_, _, _],
            [x, _, _],
            [_, _, _],
        ];
        testUtils.setupState(new EncapsuleState(board, P0Turn, []));

        await testUtils.expectClickSuccess('#click_0_1');

        await testUtils.expectClickFailure('#click_0_1', EncapsuleFailure.SAME_DEST_AS_ORIGIN());
    }));
    it('should forbid selecting a remaining piece is a move is being constructed', fakeAsync(async() => {
        const x: EncapsuleCase = new EncapsuleCase(PlayerOrNone.NONE, Player.ZERO, PlayerOrNone.NONE);
        const board: EncapsuleCase[][] = [
            [_, _, _],
            [x, _, _],
            [_, _, _],
        ];
        testUtils.setupState(new EncapsuleState(board, P0Turn, [EncapsulePiece.SMALL_DARK]));

        await testUtils.expectClickSuccess('#click_0_1');

        await testUtils.expectClickFailure('#piece_0_SMALL_DARK', EncapsuleFailure.END_YOUR_MOVE());
    }));
});
