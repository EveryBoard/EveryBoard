import { QuartoNode, QuartoRules } from '../QuartoRules';
import { QuartoMinimax } from '../QuartoMinimax';
import { QuartoMove } from '../QuartoMove';
import { QuartoPiece } from '../QuartoPiece';
import { QuartoState } from '../QuartoState';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Table } from 'src/app/utils/ArrayUtils';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Player } from 'src/app/jscaip/Player';
import { Minimax } from 'src/app/jscaip/Minimax';

describe('QuartoRules', () => {

    let rules: QuartoRules;
    let minimaxes: Minimax<QuartoMove, QuartoState>[];

    beforeEach(() => {
        rules = new QuartoRules(QuartoState);
        minimaxes = [
            new QuartoMinimax(rules, 'QuartoMinimax'),
        ];
    });
    it('Should create', () => {
        expect(rules).toBeTruthy();
    });
    it('Should forbid not to give a piece when not last turn', () => {
        const state: QuartoState = QuartoState.getInitialState();
        const move: QuartoMove = new QuartoMove(0, 0, QuartoPiece.NONE);
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.getReason()).toBe('You must give a piece.');
    });
    it('Should allow not to give a piece when last turn, and consider the game a draw if no one win', () => {
        const board: Table<QuartoPiece> = [
            [QuartoPiece.AABB, QuartoPiece.AAAB, QuartoPiece.ABBA, QuartoPiece.BBAA],
            [QuartoPiece.BBAB, QuartoPiece.BAAA, QuartoPiece.BBBA, QuartoPiece.ABBB],
            [QuartoPiece.BABA, QuartoPiece.BBBB, QuartoPiece.ABAA, QuartoPiece.AABA],
            [QuartoPiece.AAAA, QuartoPiece.ABAB, QuartoPiece.BABB, QuartoPiece.NONE],
        ];
        const expectedBoard: Table<QuartoPiece> = [
            [QuartoPiece.AABB, QuartoPiece.AAAB, QuartoPiece.ABBA, QuartoPiece.BBAA],
            [QuartoPiece.BBAB, QuartoPiece.BAAA, QuartoPiece.BBBA, QuartoPiece.ABBB],
            [QuartoPiece.BABA, QuartoPiece.BBBB, QuartoPiece.ABAA, QuartoPiece.AABA],
            [QuartoPiece.AAAA, QuartoPiece.ABAB, QuartoPiece.BABB, QuartoPiece.BAAB],
        ];
        const state: QuartoState = new QuartoState(board, 15, QuartoPiece.BAAB);
        rules.node = new MGPNode(null, null, state);
        const move: QuartoMove = new QuartoMove(3, 3, QuartoPiece.NONE);
        expect(rules.choose(move)).toBeTrue();
        const resultingState: QuartoState = rules.node.gameState;
        const expectedState: QuartoState = new QuartoState(expectedBoard, 16, QuartoPiece.NONE);
        expect(resultingState).toEqual(expectedState);
        RulesUtils.expectToBeDraw(rules, rules.node, minimaxes);
    });
    it('Should forbid to give a piece already on the board', () => {
        const board: Table<QuartoPiece> = [
            [QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE],
            [QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE],
            [QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE],
            [QuartoPiece.AAAA, QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE],
        ];
        const state: QuartoState = new QuartoState(board, 1, QuartoPiece.AABA);
        const move: QuartoMove = new QuartoMove(0, 0, QuartoPiece.AAAA);
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.getReason()).toBe('That piece is already on the board.');
    });
    it('Should forbid to give the piece that you had in your hand', () => {
        const state: QuartoState = QuartoState.getInitialState();
        const move: QuartoMove = new QuartoMove(0, 0, QuartoPiece.AAAA);
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.getReason()).toBe('You cannot give the piece that was in your hands.');
    });
    it('Should forbid to play on occupied case', () => {
        const board: Table<QuartoPiece> = [
            [QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE],
            [QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE],
            [QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE],
            [QuartoPiece.AAAA, QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE],
        ];
        const state: QuartoState = new QuartoState(board, 1, QuartoPiece.AABA);
        const move: QuartoMove = new QuartoMove(0, 3, QuartoPiece.BBAA);
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.reason).toEqual(RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
    });
    it('Should allow simple move', () => {
        const move: QuartoMove = new QuartoMove(2, 2, QuartoPiece.AAAB);
        const isLegal: boolean = rules.choose(move);
        expect(isLegal).toBeTrue();
    });
    it('Should considered player 0 winner when doing a full line', () => {
        const board: Table<QuartoPiece> = [
            [QuartoPiece.BBBB, QuartoPiece.BBBA, QuartoPiece.BBAB, QuartoPiece.NONE],
            [QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE],
            [QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE],
            [QuartoPiece.AAAA, QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE],
        ];
        const expectedBoard: Table<QuartoPiece> = [
            [QuartoPiece.BBBB, QuartoPiece.BBBA, QuartoPiece.BBAB, QuartoPiece.BBAA],
            [QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE],
            [QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE],
            [QuartoPiece.AAAA, QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE],
        ];
        const state: QuartoState = new QuartoState(board, 4, QuartoPiece.BBAA);
        const move: QuartoMove = new QuartoMove(3, 0, QuartoPiece.AAAB);
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: QuartoState = rules.applyLegalMove(move, state);
        const expectedState: QuartoState = new QuartoState(expectedBoard, 5, QuartoPiece.AAAB);
        expect(resultingState).toEqual(expectedState);
        const node: QuartoNode = new MGPNode(null, move, expectedState);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
    });
    it('Should considered player 1 winner when doing a full line', () => {
        const board: Table<QuartoPiece> = [
            [QuartoPiece.ABAB, QuartoPiece.NONE, QuartoPiece.AABB, QuartoPiece.NONE],
            [QuartoPiece.NONE, QuartoPiece.AAAB, QuartoPiece.BABB, QuartoPiece.NONE],
            [QuartoPiece.NONE, QuartoPiece.AAAA, QuartoPiece.BBAA, QuartoPiece.BBBA],
            [QuartoPiece.ABBB, QuartoPiece.NONE, QuartoPiece.BAAB, QuartoPiece.NONE],
        ];
        const expectedBoard: Table<QuartoPiece> = [
            [QuartoPiece.ABAB, QuartoPiece.NONE, QuartoPiece.AABB, QuartoPiece.NONE],
            [QuartoPiece.NONE, QuartoPiece.AAAB, QuartoPiece.BABB, QuartoPiece.NONE],
            [QuartoPiece.NONE, QuartoPiece.AAAA, QuartoPiece.BBAA, QuartoPiece.BBBA],
            [QuartoPiece.ABBB, QuartoPiece.NONE, QuartoPiece.BAAB, QuartoPiece.BBAB],
        ];
        const state: QuartoState = new QuartoState(board, 9, QuartoPiece.BBAB);
        const move: QuartoMove = new QuartoMove(3, 3, QuartoPiece.AABA);
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: QuartoState = rules.applyLegalMove(move, state);
        const expectedState: QuartoState = new QuartoState(expectedBoard, 10, QuartoPiece.AABA);
        expect(resultingState).toEqual(expectedState);
        const node: QuartoNode = new MGPNode(null, move, expectedState);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
    });
});
