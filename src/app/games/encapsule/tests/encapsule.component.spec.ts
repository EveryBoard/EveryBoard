/* eslint-disable max-lines-per-function */
import { EncapsuleComponent } from '../encapsule.component';
import { EncapsuleMove } from 'src/app/games/encapsule/EncapsuleMove';
import { Coord } from 'src/app/jscaip/Coord';
import { EncapsuleCase, EncapsuleState } from 'src/app/games/encapsule/EncapsuleState';
import { EncapsuleMinimax } from 'src/app/games/encapsule/EncapsuleMinimax';
import { Player } from 'src/app/jscaip/Player';
import { EncapsulePiece } from 'src/app/games/encapsule/EncapsulePiece';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { fakeAsync } from '@angular/core/testing';
import { EncapsuleFailure } from '../EncapsuleFailure';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { EncapsuleNode } from '../EncapsuleRules';

describe('EncapsuleComponent', () => {

    let componentTestUtils: ComponentTestUtils<EncapsuleComponent>;

    const _: EncapsuleCase = new EncapsuleCase(Player.NONE, Player.NONE, Player.NONE);
    const emptyBoard: EncapsuleCase[][] = [
        [_, _, _],
        [_, _, _],
        [_, _, _],
    ];
    const P0Turn: number = 6;

    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame<EncapsuleComponent>('Encapsule');
    }));
    it('should create', () => {
        expect(componentTestUtils.wrapper).withContext('Wrapper should be created').toBeTruthy();
        expect(componentTestUtils.getComponent()).withContext('EncapsuleComponent should be created').toBeTruthy();
    });
    it('should drop a piece on the board when selecting it and dropping it', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#piece_0_SMALL_BLACK');

        const move: EncapsuleMove = EncapsuleMove.fromDrop(EncapsulePiece.SMALL_BLACK, new Coord(0, 0));
        await componentTestUtils.expectMoveSuccess('#click_0_0', move);
    }));
    it('should forbid clicking directly on the board without selecting a piece', fakeAsync(async() => {
        await componentTestUtils.expectClickFailure('#click_0_0', EncapsuleFailure.INVALID_PIECE_SELECTED());
    }));
    it('should allow dropping a piece on a smaller one', fakeAsync(async() => {
        const x: EncapsuleCase = new EncapsuleCase(Player.ONE, Player.NONE, Player.NONE);
        const board: EncapsuleCase[][] = [
            [_, _, _],
            [x, _, _],
            [_, _, _],
        ];
        componentTestUtils.setupState(new EncapsuleState(board, P0Turn, [EncapsulePiece.MEDIUM_BLACK]));
        await componentTestUtils.expectClickSuccess('#piece_0_MEDIUM_BLACK');

        const move: EncapsuleMove = EncapsuleMove.fromDrop(EncapsulePiece.MEDIUM_BLACK, new Coord(0, 1));
        await componentTestUtils.expectMoveSuccess('#click_0_1', move);
    }));
    it('should forbid dropping a piece on a bigger one', fakeAsync(async() => {
        const x: EncapsuleCase = new EncapsuleCase(Player.NONE, Player.ONE, Player.NONE);
        const board: EncapsuleCase[][] = [
            [_, _, _],
            [x, _, _],
            [_, _, _],
        ];
        componentTestUtils.setupState(new EncapsuleState(board, P0Turn, [EncapsulePiece.SMALL_BLACK]));
        await componentTestUtils.expectClickSuccess('#piece_0_SMALL_BLACK');

        const move: EncapsuleMove = EncapsuleMove.fromDrop(EncapsulePiece.SMALL_BLACK, new Coord(0, 1));
        await componentTestUtils.expectMoveFailure('#click_0_1', EncapsuleFailure.INVALID_PLACEMENT(), move);
    }));
    it('should forbid selecting a piece that is not remaining', fakeAsync(async() => {
        componentTestUtils.setupState(new EncapsuleState(emptyBoard, P0Turn, []));

        componentTestUtils.expectElementNotToExist('#piece_0_SMALL_BLACK');
    }));
    it('should forbid selecting a piece from the other player', fakeAsync(async() => {
        componentTestUtils.setupState(new EncapsuleState(emptyBoard, P0Turn, [EncapsulePiece.SMALL_WHITE]));

        await componentTestUtils.expectClickFailure('#piece_1_SMALL_WHITE', EncapsuleFailure.NOT_DROPPABLE());
    }));
    it('should move a piece when clicking on the piece and clicking on its destination coord', fakeAsync(async() => {
        const x: EncapsuleCase = new EncapsuleCase(Player.NONE, Player.ZERO, Player.NONE);
        const board: EncapsuleCase[][] = [
            [_, _, _],
            [x, _, _],
            [_, _, _],
        ];
        componentTestUtils.setupState(new EncapsuleState(board, P0Turn, []));

        await componentTestUtils.expectClickSuccess('#click_0_1');

        const move: EncapsuleMove = EncapsuleMove.fromMove(new Coord(0, 1), new Coord(0, 2));
        await componentTestUtils.expectMoveSuccess('#click_0_2', move);
    }));
    it('should forbid moving from a space that the player is not controlling', fakeAsync(async() => {
        const x: EncapsuleCase = new EncapsuleCase(Player.NONE, Player.ONE, Player.NONE);
        const board: EncapsuleCase[][] = [
            [_, _, _],
            [x, _, _],
            [_, _, _],
        ];
        componentTestUtils.setupState(new EncapsuleState(board, P0Turn, []));

        await componentTestUtils.expectClickFailure('#click_0_1', EncapsuleFailure.INVALID_PIECE_SELECTED());
    }));
    it('should allow moving a piece on top of a smaller one', fakeAsync(async() => {
        const x: EncapsuleCase = new EncapsuleCase(Player.NONE, Player.ZERO, Player.NONE);
        const X: EncapsuleCase = new EncapsuleCase(Player.NONE, Player.NONE, Player.ZERO);
        const board: EncapsuleCase[][] = [
            [_, _, _],
            [x, X, _],
            [_, _, _],
        ];
        componentTestUtils.setupState(new EncapsuleState(board, P0Turn, []));

        await componentTestUtils.expectClickSuccess('#click_1_1');

        const move: EncapsuleMove = EncapsuleMove.fromMove(new Coord(1, 1), new Coord(0, 1));
        await componentTestUtils.expectMoveSuccess('#click_0_1', move);
    }));
    it('should forbid moving a piece on top of a bigger one', fakeAsync(async() => {
        const x: EncapsuleCase = new EncapsuleCase(Player.NONE, Player.ZERO, Player.NONE);
        const X: EncapsuleCase = new EncapsuleCase(Player.NONE, Player.NONE, Player.ZERO);
        const board: EncapsuleCase[][] = [
            [_, _, _],
            [x, X, _],
            [_, _, _],
        ];
        componentTestUtils.setupState(new EncapsuleState(board, P0Turn, []));

        await componentTestUtils.expectClickSuccess('#click_0_1');

        const move: EncapsuleMove = EncapsuleMove.fromMove(new Coord(0, 1), new Coord(1, 1));
        await componentTestUtils.expectMoveFailure('#click_1_1', EncapsuleFailure.INVALID_PLACEMENT(), move);
    }));
    it('should detect victory', fakeAsync(async() => {
        const x: EncapsuleCase = new EncapsuleCase(Player.NONE, Player.ZERO, Player.NONE);
        const X: EncapsuleCase = new EncapsuleCase(Player.NONE, Player.NONE, Player.ZERO);
        const board: EncapsuleCase[][] = [
            [_, _, _],
            [x, X, _],
            [_, _, _],
        ];
        componentTestUtils.setupState(new EncapsuleState(board, P0Turn, [EncapsulePiece.MEDIUM_BLACK]));

        await componentTestUtils.expectClickSuccess('#piece_0_MEDIUM_BLACK');

        const move: EncapsuleMove = EncapsuleMove.fromDrop(EncapsulePiece.MEDIUM_BLACK, new Coord(2, 1));
        await componentTestUtils.expectMoveSuccess('#click_2_1', move);

        const component: EncapsuleComponent = componentTestUtils.getComponent();
        const minimax: EncapsuleMinimax = new EncapsuleMinimax(component.rules, 'EncapsuleMinimax');

        const node: EncapsuleNode = new EncapsuleNode(component.rules.node.gameState,
                                                      MGPOptional.empty(),
                                                      MGPOptional.of(move));
        expect(minimax.getBoardValue(node).value).toBe(Number.MIN_SAFE_INTEGER);
    }));
    it('should forbid selecting the same coord for destination and origin', fakeAsync(async() => {
        const x: EncapsuleCase = new EncapsuleCase(Player.NONE, Player.ZERO, Player.NONE);
        const board: EncapsuleCase[][] = [
            [_, _, _],
            [x, _, _],
            [_, _, _],
        ];
        componentTestUtils.setupState(new EncapsuleState(board, P0Turn, []));

        await componentTestUtils.expectClickSuccess('#click_0_1');

        await componentTestUtils.expectClickFailure('#click_0_1', EncapsuleFailure.SAME_DEST_AS_ORIGIN());
    }));
    it('should forbid selecting a remaining piece is a move is being constructed', fakeAsync(async() => {
        const x: EncapsuleCase = new EncapsuleCase(Player.NONE, Player.ZERO, Player.NONE);
        const board: EncapsuleCase[][] = [
            [_, _, _],
            [x, _, _],
            [_, _, _],
        ];
        componentTestUtils.setupState(new EncapsuleState(board, P0Turn, [EncapsulePiece.SMALL_BLACK]));

        await componentTestUtils.expectClickSuccess('#click_0_1');

        await componentTestUtils.expectClickFailure('#piece_0_SMALL_BLACK', EncapsuleFailure.END_YOUR_MOVE());
    }));
});
