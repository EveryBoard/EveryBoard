/* eslint-disable max-lines-per-function */
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GoMinimax } from '../GoMinimax';
import { GoMove } from '../GoMove';
import { GoState, GoPiece, Phase } from '../GoState';
import { GoNode, GoRules } from '../GoRules';
import { GameConfig } from 'src/app/jscaip/ConfigUtil';

describe('GoMinimax', () => {

    let minimax: GoMinimax;

    const X: GoPiece = GoPiece.LIGHT;
    const O: GoPiece = GoPiece.DARK;
    const u: GoPiece = GoPiece.DEAD_DARK;
    const k: GoPiece = GoPiece.DEAD_LIGHT;
    const w: GoPiece = GoPiece.LIGHT_TERRITORY;
    const b: GoPiece = GoPiece.DARK_TERRITORY;
    const _: GoPiece = GoPiece.EMPTY;

    const config: GameConfig = { width: 5, height: 5 };

    beforeEach(() => {
        const rules: GoRules = GoRules.get();
        minimax = new GoMinimax(rules, 'Dummy');
    });
    describe('getListMove', () => {
        it('should count as many move as empty space in Phase.PLAYING turn, + PASS', () => {
            const board: Table<GoPiece> = [
                [_, X, _, _, _],
                [X, _, _, _, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
            ];
            const state: GoState = new GoState(board, [0, 0], 0, MGPOptional.empty(), Phase.PLAYING);
            const initialNode: GoNode = new GoNode(state);
            const moves: GoMove[] = minimax.getListMoves(initialNode);
            expect(moves.length).toBe(23);
            expect(moves.some((m: GoMove) => m.equals(GoMove.PASS))).toBeTrue();
        });
        it('should only have GoMove.ACCEPT in ACCEPT Phase when agreeing on the result', () => {
            const initialBoard: GoPiece[][] = GoState.getInitialState(config).getCopiedBoard();
            const state: GoState = new GoState(initialBoard, [0, 0], 0, MGPOptional.empty(), Phase.ACCEPT);
            const initialNode: GoNode = new GoNode(state);
            const moves: GoMove[] = minimax.getListMoves(initialNode);
            expect(moves).toEqual([GoMove.ACCEPT]);
        });
        it('should only have GoMove.ACCEPT in COUNTNG Phase when agreeing on the result', () => {
            const initialBoard: GoPiece[][] = GoState.getInitialState(config).getCopiedBoard();
            const state: GoState = new GoState(initialBoard, [0, 0], 0, MGPOptional.empty(), Phase.COUNTING);
            const initialNode: GoNode = new GoNode(state);
            spyOn(minimax, 'getCountingMovesList').and.returnValue([]);
            const moves: GoMove[] = minimax.getListMoves(initialNode);
            expect(moves).toEqual([GoMove.ACCEPT]);
        });
        it('should only have counting moves in COUNTING Phase when not agreeing on the result', () => {
            const initialBoard: GoPiece[][] = GoState.getInitialState(config).getCopiedBoard();
            const state: GoState = new GoState(initialBoard, [0, 0], 0, MGPOptional.empty(), Phase.ACCEPT);
            const initialNode: GoNode = new GoNode(state);
            spyOn(minimax, 'getCountingMovesList').and.returnValue([new GoMove(1, 1)]);
            const moves: GoMove[] = minimax.getListMoves(initialNode);
            expect(moves).toEqual([new GoMove(1, 1)]);
        });
        it('should switch dead piece when it consider those pieces alive (Player.ZERO)', () => {
            const board: Table<GoPiece> = [
                [u, w, w, X, w],
                [X, X, X, X, X],
                [_, _, _, _, _],
                [_, _, _, O, _],
                [_, _, _, _, _],
            ];
            const state: GoState = new GoState(board, [0, 0], 0, MGPOptional.empty(), Phase.COUNTING);
            const initialNode: GoNode = new GoNode(state);
            const moves: GoMove[] = minimax.getListMoves(initialNode);
            expect(moves.length).toBe(1);
            expect(moves.some((m: GoMove) => m.equals(new GoMove(3, 3)))).toBeTrue();
        });
        it('should switch dead piece when it consider those pieces alive (Player.ONE)', () => {
            const board: Table<GoPiece> = [
                [k, b, b, O, b],
                [O, O, O, O, O],
                [_, _, _, _, _],
                [_, _, _, X, _],
                [_, _, _, _, _],
            ];
            const state: GoState = new GoState(board, [0, 0], 1, MGPOptional.empty(), Phase.COUNTING);
            const initialNode: GoNode = new GoNode(state);
            const moves: GoMove[] = minimax.getListMoves(initialNode);
            expect(moves.length).toBe(1);
            expect(moves.some((m: GoMove) => m.equals(new GoMove(3, 3)))).toBeTrue();
        });
    });
    xit('should getBoardValue according considering alive group who control alone one territory and not considering alive the others', () => {
        const board: Table<GoPiece> = [
            [_, X, _, _, _],
            [X, X, _, _, _],
            [_, X, _, O, O],
            [O, X, _, O, _],
            [_, X, _, O, _],
        ];
        const state: GoState = new GoState(board, [0, 0], 0, MGPOptional.empty(), Phase.PLAYING);
        const initialNode: GoNode = new GoNode(state);
        const boardValue: number = minimax.getBoardValue(initialNode).value;
        expect(boardValue).toBe(3);
    });
});
