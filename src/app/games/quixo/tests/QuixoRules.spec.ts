/* eslint-disable max-lines-per-function */
import { Orthogonal } from 'src/app/jscaip/Direction';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { QuixoState } from '../QuixoState';
import { QuixoMove } from '../QuixoMove';
import { QuixoNode, QuixoRules } from '../QuixoRules';
import { Coord } from 'src/app/jscaip/Coord';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Table } from 'src/app/utils/ArrayUtils';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPSet } from 'src/app/utils/MGPSet';
import { QuixoFailure } from '../QuixoFailure';

describe('QuixoRules', () => {

    let rules: QuixoRules;
    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;
    const X: PlayerOrNone = PlayerOrNone.ONE;

    beforeEach(() => {
        rules = QuixoRules.get();
    });

    it('should forbid player to start a move with opponents piece', () => {
        const board: Table<PlayerOrNone> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, X],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const state: QuixoState = new QuixoState(board, 0);
        const move: QuixoMove = new QuixoMove(4, 2, Orthogonal.LEFT);
        const reason: string = RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });

    it('should forbid move creation from coord not on the side', () => {
        // Given a normal config board
        const state: QuixoState = QuixoState.getInitialState(QuixoRules.DEFAULT_CONFIG);

        // When doing a move inside the board
        const move: QuixoMove = new QuixoMove(1, 1, Orthogonal.UP);

        // Then it should be illegal
        const reason: string = QuixoFailure.NO_INSIDE_CLICK();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });

    it('should throw when suggesting move for out of range', () => {
        // Given an normal config board
        const state: QuixoState = QuixoState.getInitialState(QuixoRules.DEFAULT_CONFIG);

        // When doing a move out of range
        const move: QuixoMove = new QuixoMove(-1, 0, Orthogonal.DOWN);
        RulesUtils.expectToThrowAndLog(() => {
            RulesUtils.expectMoveFailure(rules, state, move, `won't reach the return of isLegal`);
        }, 'Invalid coord for QuixoMove: (-1, 0) is outside the board.');
    });

    const moveByDirection: QuixoMove[] = [
        new QuixoMove(0, 2, Orthogonal.LEFT),
        new QuixoMove(4, 2, Orthogonal.RIGHT),
        new QuixoMove(2, 0, Orthogonal.UP),
        new QuixoMove(2, 4, Orthogonal.DOWN),
    ];
    const errorByDirection: string [] = [
        `Invalid direction: pawn on the left side can't be moved to the left.`,
        `Invalid direction: pawn on the right side can't be moved to the right.`,
        `Invalid direction: pawn on the top side can't be moved up.`,
        `Invalid direction: pawn on the bottom side can't be moved down.`,
    ];

    for (let i: number = 0; i < 4; i++) {
        it(`should throw when suggesting move with coord whose side is the same as the direction (${ i })`, () => {
            // Given any normal config board
            const state: QuixoState = QuixoState.getInitialState(QuixoRules.DEFAULT_CONFIG);

            // When providing a move where a piece try to leave the board
            const move: QuixoMove = moveByDirection[i];

            // Then it should throw
            const reason: string = errorByDirection[i];
            RulesUtils.expectToThrowAndLog(() => {
                RulesUtils.expectMoveFailure(rules, state, move, `won't reach the return of isLegal`);
            }, reason);
        });
    }

    it('should always put moved piece to currentPlayer symbol', () => {
        const board: Table<PlayerOrNone> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const expectedBoard: Table<PlayerOrNone> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, O],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const state: QuixoState = new QuixoState(board, 0);
        const move: QuixoMove = new QuixoMove(0, 2, Orthogonal.RIGHT);
        const expectedState: QuixoState = new QuixoState(expectedBoard, 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });

    it('should declare winner player zero when he create a line of his symbol', () => {
        const board: Table<PlayerOrNone> = [
            [_, _, _, _, O],
            [_, _, _, _, O],
            [_, _, _, _, _],
            [_, _, _, _, O],
            [_, _, _, _, O],
        ];
        const expectedBoard: Table<PlayerOrNone> = [
            [_, _, _, _, O],
            [_, _, _, _, O],
            [_, _, _, _, O],
            [_, _, _, _, O],
            [_, _, _, _, O],
        ];
        const state: QuixoState = new QuixoState(board, 0);
        const move: QuixoMove = new QuixoMove(0, 2, Orthogonal.RIGHT);
        const expectedState: QuixoState = new QuixoState(expectedBoard, 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        const node: QuixoNode = new QuixoNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO);
    });

    it('should declare winner player one when he create a line of his symbol', () => {
        const board: Table<PlayerOrNone> = [
            [_, _, _, _, X],
            [_, _, _, _, X],
            [_, _, _, _, _],
            [_, _, _, _, X],
            [_, _, _, _, X],
        ];
        const expectedBoard: Table<PlayerOrNone> = [
            [_, _, _, _, X],
            [_, _, _, _, X],
            [_, _, _, _, X],
            [_, _, _, _, X],
            [_, _, _, _, X],
        ];
        const state: QuixoState = new QuixoState(board, 1);
        const move: QuixoMove = new QuixoMove(0, 2, Orthogonal.RIGHT);
        const expectedState: QuixoState = new QuixoState(expectedBoard, 2);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        const node: QuixoNode = new QuixoNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE);
    });

    it('should declare loser player zero who create a line of his opponent symbol, even if creating a line of his symbol too', () => {
        const board: Table<PlayerOrNone> = [
            [X, _, _, _, O],
            [X, _, _, _, O],
            [_, X, _, _, _],
            [X, _, _, _, O],
            [X, _, _, _, O],
        ];
        const expectedBoard: Table<PlayerOrNone> = [
            [X, _, _, _, O],
            [X, _, _, _, O],
            [X, _, _, _, O],
            [X, _, _, _, O],
            [X, _, _, _, O],
        ];
        const state: QuixoState = new QuixoState(board, 0);
        const move: QuixoMove = new QuixoMove(0, 2, Orthogonal.RIGHT);
        const expectedState: QuixoState = new QuixoState(expectedBoard, 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        const node: QuixoNode = new QuixoNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE);
    });

    it('should declare loser player one who create a line of his opponent symbol, even if creating a line of his symbol too', () => {
        const board: Table<PlayerOrNone> = [
            [O, _, _, _, X],
            [O, _, _, _, X],
            [_, O, _, _, _],
            [O, _, _, _, X],
            [O, _, _, _, X],
        ];
        const expectedBoard: Table<PlayerOrNone> = [
            [O, _, _, _, X],
            [O, _, _, _, X],
            [O, _, _, _, X],
            [O, _, _, _, X],
            [O, _, _, _, X],
        ];
        const state: QuixoState = new QuixoState(board, 1);
        const move: QuixoMove = new QuixoMove(0, 2, Orthogonal.RIGHT);
        const expectedState: QuixoState = new QuixoState(expectedBoard, 2);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        const node: QuixoNode = new QuixoNode(expectedState, MGPOptional.empty(), MGPOptional.of(move));
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO);
    });

    describe('getVictoriousCoords', () => {

        it('should return victorious column', () => {
            const board: Table<PlayerOrNone> = [
                [O, _, _, _, X],
                [O, _, _, _, X],
                [O, _, _, _, _],
                [O, _, _, _, X],
                [O, _, _, _, X],
            ];
            const state: QuixoState = new QuixoState(board, 1);
            expect(QuixoRules.getVictoriousCoords(state))
                .toEqual([new Coord(0, 0), new Coord(0, 1), new Coord(0, 2), new Coord(0, 3), new Coord(0, 4)]);
        });

        it('should return victorious row', () => {
            const board: Table<PlayerOrNone> = [
                [O, O, O, O, O],
                [_, _, _, _, X],
                [_, _, _, _, _],
                [_, _, _, _, X],
                [_, _, _, _, X],
            ];
            const state: QuixoState = new QuixoState(board, 1);
            expect(QuixoRules.getVictoriousCoords(state))
                .toEqual([new Coord(0, 0), new Coord(1, 0), new Coord(2, 0), new Coord(3, 0), new Coord(4, 0)]);
        });

        it('should return victorious first diagonal', () => {
            const board: Table<PlayerOrNone> = [
                [O, _, _, _, _],
                [_, O, _, _, _],
                [_, _, O, _, _],
                [_, _, _, O, _],
                [_, _, _, _, O],
            ];
            const state: QuixoState = new QuixoState(board, 1);
            expect(QuixoRules.getVictoriousCoords(state))
                .toEqual([new Coord(0, 0), new Coord(1, 1), new Coord(2, 2), new Coord(3, 3), new Coord(4, 4)]);
        });

        it('should return victorious second diagonal', () => {
            const board: Table<PlayerOrNone> = [
                [_, _, _, _, O],
                [_, _, _, O, _],
                [_, _, O, _, _],
                [_, O, _, _, _],
                [O, _, _, _, _],
            ];
            const state: QuixoState = new QuixoState(board, 1);
            const victoriousCoord: MGPSet<Coord> = new MGPSet(QuixoRules.getVictoriousCoords(state));
            const expectedVictoriousCoord: MGPSet<Coord> =
                new MGPSet([new Coord(0, 4), new Coord(1, 3), new Coord(2, 2), new Coord(3, 1), new Coord(4, 0)]);
            expect(victoriousCoord.equals(expectedVictoriousCoord)).toBeTrue();
        });

        it('should return victorious diagonal when rectangular board', () => {
            // Given a rectangular board from a custom config
            const board: Table<PlayerOrNone> = [
                [_, _, O, _, _, _, _],
                [_, _, _, O, _, _, _],
                [_, _, _, _, O, _, _],
                [_, _, _, _, _, O, _],
                [_, _, _, _, _, _, O],
            ];
            const state: QuixoState = new QuixoState(board, 1);
            const victoriousCoord: MGPSet<Coord> = new MGPSet(QuixoRules.getVictoriousCoords(state));
            const expectedVictoriousCoord: MGPSet<Coord> = new MGPSet([
                new Coord(2, 0),
                new Coord(3, 1),
                new Coord(4, 2),
                new Coord(5, 3),
                new Coord(6, 4),
            ]);
            expect(victoriousCoord.equals(expectedVictoriousCoord)).toBeTrue();
        });

    });

});
