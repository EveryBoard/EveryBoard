import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { Minimax } from 'src/app/jscaip/Minimax';
import { Player } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { TaflConfig } from '../TaflConfig';
import { TaflFailure } from '../TaflFailure';
import { TaflNode } from '../TaflMinimax';
import { TaflMove } from '../TaflMove';
import { TaflPawn } from '../TaflPawn';
import { TaflState } from '../TaflState';
import { MyTaflMove } from './MyTaflMove.spec';
import { MyTaflRules } from './MyTaflRules.spec';
import { MyTaflState } from './MyTaflState.spec';

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
    let minimaxes: Minimax<TaflMove, TaflState>[];

    const _: TaflPawn = TaflPawn.UNOCCUPIED;
    const O: TaflPawn = TaflPawn.INVADERS;
    const X: TaflPawn = TaflPawn.DEFENDERS;
    const A: TaflPawn = TaflPawn.PLAYER_ONE_KING;

    beforeEach(() => {
        rules = MyTaflRules.get();
        minimaxes = [
        ];
    });
    describe('getSurroundings', () => {
        it('Should return neighborings cases', () => {
            const startingState: TaflState = rules.node.gameState;
            const { backCoord } =
                rules.getSurroundings(new Coord(3, 1), Orthogonal.RIGHT, Player.ZERO, startingState);
            expect(backCoord).toEqual(new Coord(4, 1));
        });
    });
    it('should be illegal to move an empty square', () => {
        // Given the initial board
        const state: MyTaflState = MyTaflState.getInitialState();

        // When trying to move an empty square
        const move: MyTaflMove = MyTaflMove.from(new Coord(0, 1), new Coord(1, 1));

        // Then the move should be illegal
        const reason: string = RulesFailure.MUST_CHOOSE_PLAYER_PIECE();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should be illegal to move an opponent pawn', () => {
        // Given the initial board
        const state: MyTaflState = MyTaflState.getInitialState();

        // When trying to move an opponent pawn
        const move: MyTaflMove = MyTaflMove.from(new Coord(4, 2), new Coord(4, 3));

        // Then the move should be deemed illegal
        const reason: string = RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should be illegal to land on a pawn', () => {
        // Given the initial board
        const state: MyTaflState = MyTaflState.getInitialState();

        // When doing a move landing on the opponent
        const move: MyTaflMove = MyTaflMove.from(new Coord(1, 0), new Coord(1, 3));

        // Then the move should be illegal
        const reason: string = TaflFailure.LANDING_ON_OCCUPIED_CASE();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should be illegal to pass through a pawn', () => {
        // Given the initial board
        const state: MyTaflState = MyTaflState.getInitialState();

        // When doing a move passing through a piece
        const move: MyTaflMove = MyTaflMove.from(new Coord(1, 0), new Coord(1, 4));

        // Then the move should be illegal
        const reason: string = TaflFailure.SOMETHING_IN_THE_WAY();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('Should consider defender winner when all invaders are dead', () => {
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
        const state: MyTaflState = new MyTaflState(board, 23);

        // When sacrificing him
        const move: MyTaflMove = MyTaflMove.from(new Coord(3, 0), new Coord(2, 0));

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
        const expectedState: MyTaflState = new MyTaflState(expectedBoard, 24);
        const node: TaflNode = new TaflNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
    });
    it('Should consider invader winner when all defender are immobilized', () => {
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
        const state: MyTaflState = new MyTaflState(board, 24);

        // When sacrificing him
        const move: MyTaflMove = MyTaflMove.from(new Coord(8, 4), new Coord(1, 4));

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
        const expectedState: MyTaflState = new MyTaflState(expectedBoard, 25);
        const node: TaflNode = new TaflNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
    });
});
