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
import { EncapsuleLegalityInformation, EncapsuleNode, EncapsuleRules } from '../EncapsuleRules';
import { Minimax } from 'src/app/jscaip/Minimax';

describe('EncapsuleComponent', () => {

    let testUtils: ComponentTestUtils<EncapsuleComponent>;

    const _: EncapsuleCase = new EncapsuleCase(PlayerOrNone.NONE, PlayerOrNone.NONE, PlayerOrNone.NONE);
    const emptyBoard: EncapsuleCase[][] = [
        [_, _, _],
        [_, _, _],
        [_, _, _],
    ];
    const P0Turn: number = 6;
    let minimaxes: Minimax<EncapsuleMove, EncapsuleState, EncapsuleLegalityInformation>[];
    let rules: EncapsuleRules;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<EncapsuleComponent>('Encapsule');
        rules = testUtils.getComponent().rules;
        minimaxes = [
            new EncapsuleMinimax(rules, 'EncapsuleMinimax'),
        ];
    }));
    it('should create', () => {
        expect(testUtils.wrapper).withContext('Wrapper should be created').toBeTruthy();
        expect(testUtils.getComponent()).withContext('EncapsuleComponent should be created').toBeTruthy();
    });
    describe('First click', () => {
        it('should forbid clicking directly on the board without selecting a piece', fakeAsync(async() => {
            await testUtils.expectClickFailure('#click_0_0', EncapsuleFailure.INVALID_PIECE_SELECTED());
        }));
        it('should forbid selecting a piece that is not remaining', fakeAsync(async() => {
            testUtils.setupState(new EncapsuleState(emptyBoard, P0Turn, []));

            testUtils.expectElementNotToExist('#piece_0_SMALL_DARK_0');
        }));
        it('should forbid selecting a piece from the other player', fakeAsync(async() => {
            testUtils.setupState(new EncapsuleState(emptyBoard, P0Turn, [EncapsulePiece.SMALL_LIGHT]));

            await testUtils.expectClickFailure('#piece_1_SMALL_LIGHT_0', EncapsuleFailure.NOT_DROPPABLE());
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
        it('should select remaining piece that you clicked', fakeAsync(async() => {
            // Given any state with remaining pieces
            // When clicking on one of them
            await testUtils.expectClickSuccess('#piece_0_SMALL_DARK_5');

            // Then that piece should be selected
            testUtils.expectElementToHaveClass('#piece_0_SMALL_DARK_5', 'selected');
        }));
        it('should select starting coord when clicking on occupied coord', fakeAsync(async() => {
            // Given a board on which one piece is owned by current player
            const x: EncapsuleCase = new EncapsuleCase(PlayerOrNone.NONE, Player.ONE, PlayerOrNone.NONE);
            const board: EncapsuleCase[][] = [
                [_, _, _],
                [x, _, _],
                [_, _, _],
            ];
            testUtils.setupState(new EncapsuleState(board, 1, []));

            // When clicking on this coord
            await testUtils.expectClickSuccess('#click_0_1');

            // Then it should be selected
            testUtils.expectElementToExist('#chosenCoord_0_1');
        }));
    });
    describe('Second click', () => {
        it('should drop a piece on the board when selecting it and dropping it', fakeAsync(async() => {
            await testUtils.expectClickSuccess('#piece_0_SMALL_DARK_5');

            const move: EncapsuleMove = EncapsuleMove.fromDrop(EncapsulePiece.SMALL_DARK, new Coord(0, 0));
            await testUtils.expectMoveSuccess('#click_0_0', move);
        }));
        it('should allow dropping a piece on a smaller one', fakeAsync(async() => {
            const x: EncapsuleCase = new EncapsuleCase(Player.ONE, PlayerOrNone.NONE, PlayerOrNone.NONE);
            const board: EncapsuleCase[][] = [
                [_, _, _],
                [x, _, _],
                [_, _, _],
            ];
            testUtils.setupState(new EncapsuleState(board, P0Turn, [EncapsulePiece.MEDIUM_DARK]));
            await testUtils.expectClickSuccess('#piece_0_MEDIUM_DARK_0');

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
            await testUtils.expectClickSuccess('#piece_0_SMALL_DARK_0');

            const move: EncapsuleMove = EncapsuleMove.fromDrop(EncapsulePiece.SMALL_DARK, new Coord(0, 1));
            await testUtils.expectMoveFailure('#click_0_1', EncapsuleFailure.INVALID_PLACEMENT(), move);
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
        it('should forbid selecting a remaining piece when a move is being constructed', fakeAsync(async() => {
            const x: EncapsuleCase = new EncapsuleCase(PlayerOrNone.NONE, Player.ZERO, PlayerOrNone.NONE);
            const board: EncapsuleCase[][] = [
                [_, _, _],
                [x, _, _],
                [_, _, _],
            ];
            testUtils.setupState(new EncapsuleState(board, P0Turn, [EncapsulePiece.SMALL_DARK]));

            await testUtils.expectClickSuccess('#click_0_1');

            await testUtils.expectClickFailure('#piece_0_SMALL_DARK_0', EncapsuleFailure.END_YOUR_MOVE());
        }));
        it('should deselect piece when clicking on it again', fakeAsync(async() => {
            // Given any state with a remaining pieces selected
            await testUtils.expectClickSuccess('#piece_0_SMALL_DARK_5');

            // When clicking on it again
            await testUtils.expectClickSuccess('#piece_0_SMALL_DARK_5');

            // Then that piece should be selected no more
            testUtils.expectElementNotToHaveClass('#piece_0_SMALL_DARK_5', 'selected');
        }));
        it('should change select piece when clicking another', fakeAsync(async() => {
            // Given any state with a remaining pieces selected
            await testUtils.expectClickSuccess('#piece_0_SMALL_DARK_5');

            // When clicking on another one
            await testUtils.expectClickSuccess('#piece_0_SMALL_DARK_4');

            // Then that other piece should be selected
            testUtils.expectElementNotToHaveClass('#piece_0_SMALL_DARK_5', 'selected');
            testUtils.expectElementToHaveClass('#piece_0_SMALL_DARK_4', 'selected');
        }));
        it('should deselect starting coord when clicking on it again', fakeAsync(async() => {
            // Given a board on which one piece is owned by current player and one is selected
            const x: EncapsuleCase = new EncapsuleCase(PlayerOrNone.NONE, Player.ONE, PlayerOrNone.NONE);
            const board: EncapsuleCase[][] = [
                [_, _, _],
                [x, _, _],
                [_, _, _],
            ];
            testUtils.setupState(new EncapsuleState(board, 1, []));
            await testUtils.expectClickSuccess('#click_0_1');

            // When clicking on this coord again
            await testUtils.expectClickSuccess('#click_0_1');

            // Then it should no longer be selected, and component should not throw
            testUtils.expectElementNotToExist('#chosenCoord_0_1');
        }));
    });
    it('should detect victory', fakeAsync(async() => {
        const x: EncapsuleCase = new EncapsuleCase(PlayerOrNone.NONE, Player.ZERO, PlayerOrNone.NONE);
        const X: EncapsuleCase = new EncapsuleCase(PlayerOrNone.NONE, PlayerOrNone.NONE, Player.ZERO);
        const board: EncapsuleCase[][] = [
            [_, _, _],
            [x, X, _],
            [_, _, _],
        ];
        testUtils.setupState(new EncapsuleState(board, P0Turn, [EncapsulePiece.MEDIUM_DARK]));

        await testUtils.expectClickSuccess('#piece_0_MEDIUM_DARK_0');

        const move: EncapsuleMove = EncapsuleMove.fromDrop(EncapsulePiece.MEDIUM_DARK, new Coord(2, 1));
        await testUtils.expectMoveSuccess('#click_2_1', move);

        const node: EncapsuleNode = new EncapsuleNode(rules.node.gameState,
                                                      MGPOptional.empty(),
                                                      MGPOptional.of(move));
        expect(minimaxes[0].getBoardValue(node).value).toBe(Number.MIN_SAFE_INTEGER);
        // TODOTODO OH NO NO, minimaxes ! USE CENTRALISED METHOD!
    }));
});
