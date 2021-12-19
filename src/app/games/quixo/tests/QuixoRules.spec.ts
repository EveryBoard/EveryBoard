import { Orthogonal } from 'src/app/jscaip/Direction';
import { Player } from 'src/app/jscaip/Player';
import { QuixoState } from '../QuixoState';
import { QuixoMove } from '../QuixoMove';
import { QuixoNode, QuixoRules } from '../QuixoRules';
import { QuixoMinimax } from '../QuixoMinimax';
import { Coord } from 'src/app/jscaip/Coord';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Table } from 'src/app/utils/ArrayUtils';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Minimax } from 'src/app/jscaip/Minimax';
import { MGPOptional } from 'src/app/utils/MGPOptional';

describe('QuixoRules:', () => {

    let rules: QuixoRules;
    let minimaxes: Minimax<QuixoMove, QuixoState>[];
    const _: Player = Player.NONE;
    const X: Player = Player.ONE;
    const O: Player = Player.ZERO;

    beforeEach(() => {
        rules = new QuixoRules(QuixoState);
        minimaxes = [
            new QuixoMinimax(rules, 'QuixoMinimax'),
        ];
    });
    it('Should forbid player to start a move with opponents piece', () => {
        const board: Table<Player> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, X],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const state: QuixoState = new QuixoState(board, 0);
        const move: QuixoMove = new QuixoMove(4, 2, Orthogonal.LEFT);
        RulesUtils.expectMoveFailure(rules, state, move, RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
    });
    it('Should always put moved piece to currentPlayer symbol', () => {
        const board: Table<Player> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const expectedBoard: Table<Player> = [
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
    it('Should declare winner player zero when he create a line of his symbol', () => {
        const board: Table<Player> = [
            [_, _, _, _, O],
            [_, _, _, _, O],
            [_, _, _, _, _],
            [_, _, _, _, O],
            [_, _, _, _, O],
        ];
        const expectedBoard: Table<Player> = [
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
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
    });
    it('Should declare winner player one when he create a line of his symbol', () => {
        const board: Table<Player> = [
            [_, _, _, _, X],
            [_, _, _, _, X],
            [_, _, _, _, _],
            [_, _, _, _, X],
            [_, _, _, _, X],
        ];
        const expectedBoard: Table<Player> = [
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
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
    });
    it('Should declare looser player zero who create a line of his opponent symbol, even if creating a line of his symbol too', () => {
        const board: Table<Player> = [
            [X, _, _, _, O],
            [X, _, _, _, O],
            [_, X, _, _, _],
            [X, _, _, _, O],
            [X, _, _, _, O],
        ];
        const expectedBoard: Table<Player> = [
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
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
    });
    it('Should declare looser player one who create a line of his opponent symbol, even if creating a line of his symbol too', () => {
        const board: Table<Player> = [
            [O, _, _, _, X],
            [O, _, _, _, X],
            [_, O, _, _, _],
            [O, _, _, _, X],
            [O, _, _, _, X],
        ];
        const expectedBoard: Table<Player> = [
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
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
    });
    describe('getVictoriousCoords', () => {
        it('should return victorious column', () => {
            const board: Table<Player> = [
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
            const board: Table<Player> = [
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
            const board: Table<Player> = [
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
            const board: Table<Player> = [
                [_, _, _, _, O],
                [_, _, _, O, _],
                [_, _, O, _, _],
                [_, O, _, _, _],
                [O, _, _, _, _],
            ];
            const state: QuixoState = new QuixoState(board, 1);
            expect(QuixoRules.getVictoriousCoords(state))
                .toEqual([new Coord(0, 4), new Coord(1, 3), new Coord(2, 2), new Coord(3, 1), new Coord(4, 0)]);
        });
    });
});
