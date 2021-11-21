import { TablutNode, TablutRules } from '../TablutRules';
import { TablutMinimax } from '../../TablutMinimax';
import { TablutMove } from '../TablutMove';
import { Coord } from 'src/app/jscaip/Coord';
import { TablutState } from '../TablutState';
import { TaflPawn } from '../../TaflPawn';
import { Player } from 'src/app/jscaip/Player';
import { TaflLegalityStatus } from '../../TaflLegalityStatus';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Table } from 'src/app/utils/ArrayUtils';
import { Minimax } from 'src/app/jscaip/Minimax';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { TablutPieceAndInfluenceMinimax } from '../../TablutPieceAndInfluenceMinimax';
import { TablutEscapeThenPieceAndControlMinimax } from '../../TablutEscapeThenPieceThenControl';
import { TaflFailure } from '../../TaflFailure';

describe('TablutRules', () => {

    let rules: TablutRules;
    let minimaxes: Minimax<TablutMove, TablutState, TaflLegalityStatus>[];
    const _: TaflPawn = TaflPawn.UNOCCUPIED;
    const O: TaflPawn = TaflPawn.INVADERS;
    const X: TaflPawn = TaflPawn.DEFENDERS;
    const A: TaflPawn = TaflPawn.PLAYER_ONE_KING;

    beforeEach(() => {
        rules = TablutRules.get();
        rules.node = rules.node.getInitialNode();
        minimaxes = [
            new TablutMinimax(rules, 'TablutMinimax'),
            new TablutPieceAndInfluenceMinimax(rules, 'Piece and Influence'),
            new TablutEscapeThenPieceAndControlMinimax(rules, 'Escape then Piece and Control'),
        ];
    });
    it('Should be created', () => {
        expect(rules).toBeTruthy();
        expect(rules.node.gameState.turn).withContext('Game should start a turn 0').toBe(0);
    });
    it('Capture should work', () => {
        const board: Table<TaflPawn> = [
            [_, A, _, _, _, _, _, _, _],
            [_, O, O, _, _, _, _, _, _],
            [_, _, X, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const expectedBoard: Table<TaflPawn> = [
            [_, _, A, _, _, _, _, _, _],
            [_, O, _, _, _, _, _, _, _],
            [_, _, X, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const state: TablutState = new TablutState(board, 3);
        const move: TablutMove = new TablutMove(new Coord(1, 0), new Coord(2, 0));
        const status: TaflLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: TablutState = rules.applyLegalMove(move, state, status);
        const expectedState: TablutState = new TablutState(expectedBoard, 4);
        expect(resultingState).toEqual(expectedState);
    });
    it('Capturing against empty throne should work', () => {
        const board: Table<TaflPawn> = [
            [_, O, _, A, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, O, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const expectedBoard: Table<TaflPawn> = [
            [_, _, A, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, O, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const state: TablutState = new TablutState(board, 3);
        const move: TablutMove = new TablutMove(new Coord(3, 0), new Coord(2, 0));
        const status: TaflLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: TablutState = rules.applyLegalMove(move, state, status);
        const expectedState: TablutState = new TablutState(expectedBoard, 4);
        expect(resultingState).toEqual(expectedState);
    });
    it('Capturing king should require four invader and lead to victory', () => {
        const board: Table<TaflPawn> = [
            [_, _, O, _, _, _, _, _, _],
            [_, _, O, A, O, _, _, _, _],
            [_, _, _, O, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const expectedBoard: Table<TaflPawn> = [
            [_, _, _, O, _, _, _, _, _],
            [_, _, O, _, O, _, _, _, _],
            [_, _, _, O, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const state: TablutState = new TablutState(board, 0);
        const move: TablutMove = new TablutMove(new Coord(2, 0), new Coord(3, 0));
        const status: TaflLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: TablutState = rules.applyLegalMove(move, state, status);
        const expectedState: TablutState = new TablutState(expectedBoard, 1);
        expect(resultingState).toEqual(expectedState);
        const node: TablutNode = new MGPNode(null, move, expectedState);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
    });
    it('Capturing king should require three invader and an edge lead to victory', () => {
        const board: Table<TaflPawn> = [
            [_, _, O, A, O, _, _, _, _],
            [_, _, O, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const expectedBoard: Table<TaflPawn> = [
            [_, _, O, _, O, _, _, _, _],
            [_, _, _, O, _, _, _, _, _],
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
        const status: TaflLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: TablutState = rules.applyLegalMove(move, state, status);
        const expectedState: TablutState = new TablutState(expectedBoard, 1);
        expect(resultingState).toEqual(expectedState);
        const node: TablutNode = new MGPNode(null, move, expectedState);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
    });
    it('Capturing king with one soldier, one throne, and one edge should not work', () => {
        const board: Table<TaflPawn> = [
            [_, A, O, _, _, _, _, _, _],
            [_, _, O, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const expectedBoard: Table<TaflPawn> = [
            [_, A, O, _, _, _, _, _, _],
            [_, O, _, _, _, _, _, _, _],
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
        const status: TaflLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: TablutState = rules.applyLegalMove(move, state, status);
        const expectedState: TablutState = new TablutState(expectedBoard, 3);
        expect(resultingState).toEqual(expectedState);
        const node: TablutNode = new MGPNode(null, move, expectedState);
        RulesUtils.expectToBeOngoing(rules, node, minimaxes);
    });
    it('Capturing king against a throne should not work', () => {
        const board: Table<TaflPawn> = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, O, _, _, _, _, _, _],
            [_, _, _, _, A, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const expectedBoard: Table<TaflPawn> = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, O, _, _, _, _],
            [_, _, _, _, A, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const state: TablutState = new TablutState(board, 0);
        const move: TablutMove = new TablutMove(new Coord(2, 2), new Coord(4, 2));
        const status: TaflLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: TablutState = rules.applyLegalMove(move, state, status);
        const expectedState: TablutState = new TablutState(expectedBoard, 1);
        expect(resultingState).toEqual(expectedState);
        const node: TablutNode = new MGPNode(null, move, expectedState);
        RulesUtils.expectToBeOngoing(rules, node, minimaxes);
    });
    it('Capturing king against a throne with 3 soldier should not work', () => {
        const board: Table<TaflPawn> = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, O, _, _, _, _, _, _],
            [_, _, _, O, A, O, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const expectedBoard: Table<TaflPawn> = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, O, _, _, _, _],
            [_, _, _, O, A, O, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const state: TablutState = new TablutState(board, 12);
        const move: TablutMove = new TablutMove(new Coord(2, 2), new Coord(4, 2));
        const status: TaflLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: TablutState = rules.applyLegalMove(move, state, status);
        const expectedState: TablutState = new TablutState(expectedBoard, 13);
        expect(resultingState).toEqual(expectedState);
        const node: TablutNode = new MGPNode(null, move, expectedState);
        RulesUtils.expectToBeOngoing(rules, node, minimaxes);
    });
    it('King should be authorised to come back on the throne', () => {
        // Given a board where the King is not on his throne but can go back
        const board: TaflPawn[][] = [
            [_, _, O, _, _, _, _, _, _],
            [_, _, O, _, O, _, _, _, _],
            [_, _, _, O, _, _, _, _, _],
            [_, _, _, _, A, _, _, _, _],
            [_, _, _, X, _, X, _, _, _],
            [_, _, _, _, X, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const state: TablutState = new TablutState(board, 1);

        // When moving the King back to his throne
        const move: TablutMove = new TablutMove(new Coord(4, 3), new Coord(4, 4));

        // Then the move should be juged legal
        const expectedBoard: TaflPawn[][] = [
            [_, _, O, _, _, _, _, _, _],
            [_, _, O, _, O, _, _, _, _],
            [_, _, _, O, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, X, A, X, _, _, _],
            [_, _, _, _, X, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const expectedState: TablutState = new TablutState(expectedBoard, 2);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('Should forbid Soldier to land on the central throne (4, 4)', () => {
        const board: Table<TaflPawn> = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, O, _, _, _, _, _],
            [_, _, _, _, A, _, _, _, _],
            [X, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const state: TablutState = new TablutState(board, 1);
        const move: TablutMove = new TablutMove(new Coord(0, 4), new Coord(4, 4));
        const status: TaflLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.getReason()).toBe(TaflFailure.SOLDIERS_CANNOT_SIT_ON_THRONE());
    });
});
