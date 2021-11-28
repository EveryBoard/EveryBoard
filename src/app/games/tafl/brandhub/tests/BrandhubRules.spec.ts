import { Coord } from 'src/app/jscaip/Coord';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Minimax } from 'src/app/jscaip/Minimax';
import { Player } from 'src/app/jscaip/Player';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Table } from 'src/app/utils/ArrayUtils';
import { BrandhubNode, BrandhubRules } from '../BrandhubRules';
import { BrandhubState } from '../BrandhubState';
import { TaflFailure } from '../../TaflFailure';
import { BrandhubMove } from '../BrandhubMove';
import { TaflPawn } from '../../TaflPawn';

describe('BrandhubRules', () => {

    const _: TaflPawn = TaflPawn.UNOCCUPIED;
    const O: TaflPawn = TaflPawn.INVADERS;
    const X: TaflPawn = TaflPawn.DEFENDERS;
    const A: TaflPawn = TaflPawn.PLAYER_ONE_KING;

    let rules: BrandhubRules;

    let minimaxes: Minimax<BrandhubMove, BrandhubState>[];

    beforeEach(() => {
        rules = BrandhubRules.get();
        rules.node = rules.node.getInitialNode();
        minimaxes = [
        ];
    });
    it('should start by invaders', () => {
        // Given the initial board
        const board: Table<TaflPawn> = [
            [_, _, _, O, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, X, _, _, _],
            [O, O, X, A, X, O, O],
            [_, _, _, X, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, O, _, _, _],
        ];
        const state: BrandhubState = new BrandhubState(board, 0);

        // When moving an invader
        const move: BrandhubMove = new BrandhubMove(new Coord(1, 3), new Coord(1, 5));

        // Then invader piece should be moved
        const expectedBoard: Table<TaflPawn> = [
            [_, _, _, O, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, X, _, _, _],
            [O, _, X, A, X, O, O],
            [_, _, _, X, _, _, _],
            [_, O, _, O, _, _, _],
            [_, _, _, O, _, _, _],
        ];
        const expectedState: BrandhubState = new BrandhubState(expectedBoard, 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should allow soldier to be captured against a throne', () => {
        // Given the initial board
        const board: Table<TaflPawn> = [
            [_, _, _, _, _, O, _],
            [_, _, _, O, _, _, _],
            [_, _, _, X, _, _, _],
            [O, O, X, A, X, O, O],
            [_, _, _, X, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, O, _, _, _],
        ];
        const state: BrandhubState = new BrandhubState(board, 1);

        // When moving an invader
        const move: BrandhubMove = new BrandhubMove(new Coord(4, 3), new Coord(4, 0));

        // Then invader piece should be moved
        const expectedBoard: Table<TaflPawn> = [
            [_, _, _, _, X, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, X, _, _, _],
            [O, O, X, A, _, O, O],
            [_, _, _, X, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, O, _, _, _],
        ];
        const expectedState: BrandhubState = new BrandhubState(expectedBoard, 2);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should forbid king to move back on the throne', () => {
        // Given a board where the king has the possibility to move back to his throne
        const board: Table<TaflPawn> = [
            [_, _, O, A, _, _, _],
            [_, O, _, _, _, _, _],
            [_, O, _, _, O, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, X, _, _, _],
        ];
        const state: BrandhubState = new BrandhubState(board, 1);

        // When moving the king to his throne
        const move: BrandhubMove = new BrandhubMove(new Coord(3, 0), new Coord(3, 3));

        // Then the move should be deemed illegal
        const reason: string = TaflFailure.THRONE_IS_LEFT_FOR_GOOD();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should allow capturing the king on his throne with 4 soldier', () => {
        // Given a board where the king is one move ahead from being captured on his throne
        const board: Table<TaflPawn> = [
            [_, _, _, _, _, _, _],
            [_, X, _, _, _, _, _],
            [_, O, _, _, _, _, _],
            [_, _, O, A, O, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, X, _, _, _],
        ];
        const state: BrandhubState = new BrandhubState(board, 0);

        // When moving a fourth invader next to the king
        const move: BrandhubMove = new BrandhubMove(new Coord(1, 2), new Coord(3, 2));

        // Then the king should be captured and the game over
        const expectedBoard: Table<TaflPawn> = [
            [_, _, _, _, _, _, _],
            [_, X, _, _, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, O, _, O, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, X, _, _, _],
        ];
        const expectedState: BrandhubState = new BrandhubState(expectedBoard, 1);
        const node: BrandhubNode = new MGPNode(null, null, expectedState);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
    });
    it('should allow capturing the king beside his throne with 3 invader', () => {
        // Given a board where the king is one move ahead from being captured on his throne
        const board: Table<TaflPawn> = [
            [_, _, _, _, _, _, _],
            [_, O, _, _, _, _, _],
            [_, O, O, A, O, _, _],
            [_, _, _, _, O, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, X, _, _, _],
        ];
        const state: BrandhubState = new BrandhubState(board, 0);

        // When moving a third piece next to the king
        const move: BrandhubMove = new BrandhubMove(new Coord(1, 1), new Coord(3, 1));

        // Then the king should be captured and the game over
        const expectedBoard: Table<TaflPawn> = [
            [_, _, _, _, _, _, _],
            [_, _, _, O, _, _, _],
            [_, O, O, _, O, _, _],
            [_, _, _, _, O, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, X, _, _, _],
        ];
        const expectedState: BrandhubState = new BrandhubState(expectedBoard, 1);
        const node: BrandhubNode = new MGPNode(null, null, expectedState);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
    });
    it('should allow capturing the king with only two soldier when not touching a throne', () => {
        // Given a board where the king is one move ahead from being captured far from central throne
        const board: Table<TaflPawn> = [
            [_, _, O, _, _, _, _],
            [_, O, _, A, _, _, _],
            [_, O, _, O, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, X, _, _, _],
        ];
        const state: BrandhubState = new BrandhubState(board, 0);

        // When moving a second piece next to the king
        const move: BrandhubMove = new BrandhubMove(new Coord(2, 0), new Coord(3, 0));

        // Then the king should be captured and the game over
        const expectedBoard: Table<TaflPawn> = [
            [_, _, _, O, _, _, _],
            [_, O, _, _, _, _, _],
            [_, O, _, O, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, X, _, _, _],
        ];
        const expectedState: BrandhubState = new BrandhubState(expectedBoard, 1);
        const node: BrandhubNode = new MGPNode(null, null, expectedState);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
    });
    it('should allow capturing the king between one soldier and a corner-throne', () => {
        // Given a board where the king is one move ahead from being captured next to corner throne
        const board: Table<TaflPawn> = [
            [_, _, O, _, _, A, _],
            [_, O, _, _, _, _, _],
            [_, O, _, O, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, X, _, _, _],
        ];
        const state: BrandhubState = new BrandhubState(board, 0);

        // When moving a second piece next to the king
        const move: BrandhubMove = new BrandhubMove(new Coord(2, 0), new Coord(4, 0));

        // Then the king should be captured and the game over
        const expectedBoard: Table<TaflPawn> = [
            [_, _, _, _, O, _, _],
            [_, O, _, _, _, _, _],
            [_, O, _, O, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, X, _, _, _],
        ];
        const expectedState: BrandhubState = new BrandhubState(expectedBoard, 1);
        const node: BrandhubNode = new MGPNode(null, null, expectedState);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
    });
    it('Should forbid Soldier to land on the central throne (3, 3)', () => {
        // Given a board where a soldier could land on the throne
        const board: Table<TaflPawn> = [
            [_, _, O, O, _, _, _],
            [_, O, _, _, _, A, _],
            [_, O, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, X, _, _, _],
        ];
        const state: BrandhubState = new BrandhubState(board, 0);

        // When attempting it
        const move: BrandhubMove = new BrandhubMove(new Coord(3, 0), new Coord(3, 3));

        // Then the move should be deemed illegal
        const reason: string = TaflFailure.SOLDIERS_CANNOT_SIT_ON_THRONE();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
});
