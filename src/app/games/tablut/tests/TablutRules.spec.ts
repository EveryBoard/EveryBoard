import { TablutNode, TablutRules } from '../TablutRules';
import { TablutMinimax } from '../TablutMinimax';
import { TablutMove } from '../TablutMove';
import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { TablutState } from '../TablutState';
import { TablutCase } from '../TablutCase';
import { Player } from 'src/app/jscaip/Player';
import { TablutLegalityStatus } from '../TablutLegalityStatus';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { TablutFailure } from '../TablutFailure';
import { Table } from 'src/app/utils/ArrayUtils';
import { Minimax } from 'src/app/jscaip/Minimax';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';

describe('TablutRules', () => {

    let rules: TablutRules;
    let minimaxes: Minimax<TablutMove, TablutState, TablutLegalityStatus>[];
    const _: TablutCase = TablutCase.UNOCCUPIED;
    const x: TablutCase = TablutCase.INVADERS;
    const i: TablutCase = TablutCase.DEFENDERS;
    const A: TablutCase = TablutCase.PLAYER_ONE_KING;

    beforeEach(() => {
        rules = new TablutRules(TablutState);
        minimaxes = [
            new TablutMinimax(rules, 'TablutMinimax'),
        ];
    });
    it('Should be created', () => {
        expect(rules).toBeTruthy();
        expect(rules.node.gameState.turn).withContext('Game should start a turn 0').toBe(0);
    });
    describe('getSurroundings', () => {
        it('Should return neighboorings cases', () => {
            const startingBoard: Table<TablutCase> = rules.node.gameState.getCopiedBoard();
            const { backCoord } =
                TablutRules.getSurroundings(new Coord(3, 1), Orthogonal.RIGHT, Player.ZERO, startingBoard);
            expect(backCoord).toEqual(new Coord(4, 1));
        });
    });
    it('Capture should work', () => {
        const board: Table<TablutCase> = [
            [_, A, _, _, _, _, _, _, _],
            [_, x, x, _, _, _, _, _, _],
            [_, _, i, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const expectedBoard: Table<TablutCase> = [
            [_, _, A, _, _, _, _, _, _],
            [_, x, _, _, _, _, _, _, _],
            [_, _, i, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const state: TablutState = new TablutState(board, 3);
        const move: TablutMove = new TablutMove(new Coord(1, 0), new Coord(2, 0));
        const status: TablutLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: TablutState = rules.applyLegalMove(move, state, status);
        const expectedState: TablutState = new TablutState(expectedBoard, 4);
        expect(resultingState).toEqual(expectedState);
    });
    it('Moving emptyness should be illegal', () => {
        expect(rules.choose(new TablutMove(new Coord(0, 1), new Coord(1, 1)))).toBeFalse();
    });
    it('Moving opponent pawn should be illegal', () => {
        expect(rules.choose(new TablutMove(new Coord(4, 2), new Coord(4, 3)))).toBeFalse();
    });
    it('Landing on pawn should be illegal', () => {
        expect(rules.choose(new TablutMove(new Coord(0, 3), new Coord(4, 3)))).toBeFalse();
    });
    it('Passing through pawn should be illegal', () => {
        expect(rules.choose(new TablutMove(new Coord(0, 3), new Coord(5, 3)))).toBeFalse();
    });
    it('Should consider defender winner when all invaders are dead', () => {
        const board: Table<TablutCase> = [
            [_, x, _, A, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, i, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const expectedBoard: Table<TablutCase> = [
            [_, _, A, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, i, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const state: TablutState = new TablutState(board, 23);
        const move: TablutMove = new TablutMove(new Coord(3, 0), new Coord(2, 0));
        const status: TablutLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: TablutState = rules.applyLegalMove(move, state, status);
        const expectedState: TablutState = new TablutState(expectedBoard, 24);
        expect(resultingState).toEqual(expectedState);
        const node: TablutNode = new MGPNode(null, move, expectedState);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
    });
    it('Capturing against empty throne should work', () => {
        const board: Table<TablutCase> = [
            [_, x, _, A, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, x, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const expectedBoard: Table<TablutCase> = [
            [_, _, A, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, x, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const state: TablutState = new TablutState(board, 3);
        const move: TablutMove = new TablutMove(new Coord(3, 0), new Coord(2, 0));
        const status: TablutLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: TablutState = rules.applyLegalMove(move, state, status);
        const expectedState: TablutState = new TablutState(expectedBoard, 4);
        expect(resultingState).toEqual(expectedState);
    });
    it('Capturing king should require four invader and lead to victory', () => {
        const board: Table<TablutCase> = [
            [_, _, x, _, _, _, _, _, _],
            [_, _, x, A, x, _, _, _, _],
            [_, _, _, x, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const expectedBoard: Table<TablutCase> = [
            [_, _, _, x, _, _, _, _, _],
            [_, _, x, _, x, _, _, _, _],
            [_, _, _, x, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const state: TablutState = new TablutState(board, 0);
        const move: TablutMove = new TablutMove(new Coord(2, 0), new Coord(3, 0));
        const status: TablutLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: TablutState = rules.applyLegalMove(move, state, status);
        const expectedState: TablutState = new TablutState(expectedBoard, 1);
        expect(resultingState).toEqual(expectedState);
        const node: TablutNode = new MGPNode(null, move, expectedState);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
    });
    it('Capturing king should require three invader and an edge lead to victory', () => {
        const board: Table<TablutCase> = [
            [_, _, x, A, x, _, _, _, _],
            [_, _, x, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const expectedBoard: Table<TablutCase> = [
            [_, _, x, _, x, _, _, _, _],
            [_, _, _, x, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const state: TablutState = new TablutState(board, 0);
        const move: TablutMove = new TablutMove(new Coord(2, 1), new Coord(3, 1));
        const status: TablutLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: TablutState = rules.applyLegalMove(move, state, status);
        const expectedState: TablutState = new TablutState(expectedBoard, 1);
        expect(resultingState).toEqual(expectedState);
        const node: TablutNode = new MGPNode(null, move, expectedState);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
    });
    it('Capturing king with two soldier, one throne, and one edge should not work be a victory', () => {
        const board: Table<TablutCase> = [
            [_, A, x, _, _, _, _, _, _],
            [_, _, x, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const expectedBoard: Table<TablutCase> = [
            [_, A, x, _, _, _, _, _, _],
            [_, x, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const state: TablutState = new TablutState(board, 2);
        const move: TablutMove = new TablutMove(new Coord(2, 1), new Coord(1, 1));
        const status: TablutLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: TablutState = rules.applyLegalMove(move, state, status);
        const expectedState: TablutState = new TablutState(expectedBoard, 3);
        expect(resultingState).toEqual(expectedState);
        const node: TablutNode = new MGPNode(null, move, expectedState);
        RulesUtils.expectToBeOngoing(rules, node, minimaxes);
    });
    it('Capturing king against a throne should not work', () => {
        const board: Table<TablutCase> = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, x, _, _, _, _, _, _],
            [_, _, _, _, A, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const expectedBoard: Table<TablutCase> = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, x, _, _, _, _],
            [_, _, _, _, A, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const state: TablutState = new TablutState(board, 0);
        const move: TablutMove = new TablutMove(new Coord(2, 2), new Coord(4, 2));
        const status: TablutLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: TablutState = rules.applyLegalMove(move, state, status);
        const expectedState: TablutState = new TablutState(expectedBoard, 1);
        expect(resultingState).toEqual(expectedState);
        const node: TablutNode = new MGPNode(null, move, expectedState);
        RulesUtils.expectToBeOngoing(rules, node, minimaxes);
    });
    it('Capturing king against a throne with 3 soldier should not work', () => {
        const board: Table<TablutCase> = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, x, _, _, _, _, _, _],
            [_, _, _, x, A, x, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const expectedBoard: Table<TablutCase> = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, x, _, _, _, _],
            [_, _, _, x, A, x, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const state: TablutState = new TablutState(board, 12);
        const move: TablutMove = new TablutMove(new Coord(2, 2), new Coord(4, 2));
        const status: TablutLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: TablutState = rules.applyLegalMove(move, state, status);
        const expectedState: TablutState = new TablutState(expectedBoard, 13);
        expect(resultingState).toEqual(expectedState);
        const node: TablutNode = new MGPNode(null, move, expectedState);
        RulesUtils.expectToBeOngoing(rules, node, minimaxes);
    });
    it('King should be authorised to come back on the throne', () => {
        const move: TablutMove = new TablutMove(new Coord(4, 3), new Coord(4, 4));
        const board: TablutCase[][] = [
            [_, _, x, _, _, _, _, _, _],
            [_, _, x, _, x, _, _, _, _],
            [_, _, _, x, _, _, _, _, _],
            [_, _, _, _, A, _, _, _, _],
            [_, _, _, i, _, i, _, _, _],
            [_, _, _, _, i, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const moveResult: TablutLegalityStatus = TablutRules.tryMove(Player.ONE, move, board);
        expect(moveResult.legal.isSuccess()).toBeTrue();
    });
    it('Should forbid Soldier to land on the throne', () => {
        const board: Table<TablutCase> = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, x, _, _, _, _, _],
            [_, _, _, _, A, _, _, _, _],
            [i, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const state: TablutState = new TablutState(board, 1);
        const move: TablutMove = new TablutMove(new Coord(0, 4), new Coord(4, 4));
        const status: TablutLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.getReason()).toBe(TablutFailure.SOLDIERS_CANNOT_SIT_ON_THRONE());
    });
    it('Should consider invader winner when all defender are immobilized', () => {
        const board: Table<TablutCase> = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [x, _, _, _, _, _, _, _, _],
            [i, x, _, _, _, _, _, _, _],
            [A, _, _, _, _, _, _, _, x],
            [i, x, _, _, _, _, _, _, _],
            [x, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const expectedBoard: Table<TablutCase> = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [x, _, _, _, _, _, _, _, _],
            [i, x, _, _, _, _, _, _, _],
            [A, x, _, _, _, _, _, _, _],
            [i, x, _, _, _, _, _, _, _],
            [x, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const state: TablutState = new TablutState(board, 24);
        const move: TablutMove = new TablutMove(new Coord(8, 4), new Coord(1, 4));
        const status: TablutLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: TablutState = rules.applyLegalMove(move, state, status);
        const expectedState: TablutState = new TablutState(expectedBoard, 25);
        expect(resultingState).toEqual(expectedState);
        const node: TablutNode = new MGPNode(null, move, expectedState);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
    });
});
