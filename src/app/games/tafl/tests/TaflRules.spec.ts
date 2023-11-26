/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { Player } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { TaflConfig } from '../TaflConfig';
import { TaflFailure } from '../TaflFailure';
import { TaflPawn } from '../TaflPawn';
import { TaflState } from '../TaflState';
import { MyTaflMove } from './MyTaflMove.spec';
import { MyTaflNode, MyTaflRules } from './MyTaflRules.spec';

export const myTaflConfig: TaflConfig = {

    CASTLE_IS_LEFT_FOR_GOOD: true,

    INVADER: Player.ZERO,

    KING_FAR_FROM_CENTRAL_THRONE_CAN_BE_SANDWICHED: true,

    CENTRAL_THRONE_CAN_SURROUND_KING: true,

    BORDER_CAN_SURROUND_KING: true,

    WIDTH: 7,
};

describe('TaflRules', () => {

    let rules: MyTaflRules;

    const _: TaflPawn = TaflPawn.UNOCCUPIED;
    const O: TaflPawn = TaflPawn.INVADERS;
    const X: TaflPawn = TaflPawn.DEFENDERS;
    const A: TaflPawn = TaflPawn.PLAYER_ONE_KING;

    beforeEach(() => {
        rules = MyTaflRules.get();
    });
    describe('getSurroundings', () => {
        it('should return neighborings spaces', () => {
            const startingState: TaflState = rules.getInitialNode().gameState;
            const { backCoord } =
                rules.getSurroundings(new Coord(3, 1), Orthogonal.RIGHT, Player.ZERO, startingState);
            expect(backCoord).toEqual(new Coord(4, 1));
        });
    });
    it('should be illegal to move an empty square', () => {
        // Given the initial board
        const state: TaflState = MyTaflRules.get().getInitialState();

        // When trying to move an empty square
        const move: MyTaflMove = MyTaflMove.from(new Coord(0, 1), new Coord(1, 1)).get();

        // Then the move should be illegal
        const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should be illegal to move an opponent pawn', () => {
        // Given the initial board
        const state: TaflState = MyTaflRules.get().getInitialState();

        // When trying to move an opponent pawn
        const move: MyTaflMove = MyTaflMove.from(new Coord(4, 2), new Coord(4, 3)).get();

        // Then the move should be deemed illegal
        const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should be illegal to land on a pawn', () => {
        // Given the initial board
        const state: TaflState = MyTaflRules.get().getInitialState();

        // When doing a move landing on the opponent
        const move: MyTaflMove = MyTaflMove.from(new Coord(1, 0), new Coord(1, 3)).get();

        // Then the move should be illegal
        const reason: string = TaflFailure.LANDING_ON_OCCUPIED_SQUARE();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should be illegal to pass through a pawn', () => {
        // Given the initial board
        const state: TaflState = MyTaflRules.get().getInitialState();

        // When doing a move passing through a piece
        const move: MyTaflMove = MyTaflMove.from(new Coord(1, 0), new Coord(1, 4)).get();

        // Then the move should be illegal
        const reason: string = RulesFailure.SOMETHING_IN_THE_WAY();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should consider defender winner when all invaders are dead', () => {
        // Given a board where the last invader is about to be slaughter on an altar dedicated to Thor
        const board: Table<TaflPawn> = [
            [_, O, _, A, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, X, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const state: TaflState = new TaflState(board, 23);

        // When sacrificing him
        const move: MyTaflMove = MyTaflMove.from(new Coord(3, 0), new Coord(2, 0)).get();

        // Then the move should be a success and the part a victory of Odin's Kin.
        const expectedBoard: Table<TaflPawn> = [
            [_, _, A, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, X, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const expectedState: TaflState = new TaflState(expectedBoard, 24);
        const node: MyTaflNode = new MyTaflNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE);
    });
    it('should consider invader winner when all defender are immobilized', () => {
        // Given a board where the last invader is about to be slaughter on an altar dedicated to Thor
        const board: Table<TaflPawn> = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _],
            [X, O, _, _, _, _, _, _, _],
            [A, _, _, _, _, _, _, _, O],
            [X, O, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const state: TaflState = new TaflState(board, 24);

        // When sacrificing him
        const move: MyTaflMove = MyTaflMove.from(new Coord(8, 4), new Coord(1, 4)).get();

        // Then the move should be a success and the part a victory of Odin's Kin.
        const expectedBoard: Table<TaflPawn> = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _],
            [X, O, _, _, _, _, _, _, _],
            [A, O, _, _, _, _, _, _, _],
            [X, O, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const expectedState: TaflState = new TaflState(expectedBoard, 25);
        const node: MyTaflNode = new MyTaflNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO);
    });
});
