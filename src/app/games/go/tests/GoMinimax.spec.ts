import { Table } from 'src/app/utils/ArrayUtils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GoMinimax } from '../GoMinimax';
import { GoMove } from '../GoMove';
import { GoState, GoPiece, Phase } from '../GoState';
import { GoNode, GoRules } from '../GoRules';

describe('GoMinimax', () => {

    let minimax: GoMinimax;

    const X: GoPiece = GoPiece.WHITE;
    const O: GoPiece = GoPiece.BLACK;
    const u: GoPiece = GoPiece.DEAD_BLACK;
    const w: GoPiece = GoPiece.WHITE_TERRITORY;
    const _: GoPiece = GoPiece.EMPTY;

    beforeEach(() => {
        const rules: GoRules = new GoRules(GoState);
        minimax = new GoMinimax(rules, 'Dummy');
    });

    describe('getListMove', () => {
        it('should count as many move as empty case in Phase.PLAYING turn, + PASS', () => {
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
            const initialBoard: GoPiece[][] = GoState.getInitialState().getCopiedBoard();
            const state: GoState = new GoState(initialBoard, [0, 0], 0, MGPOptional.empty(), Phase.ACCEPT);
            const initialNode: GoNode = new GoNode(state);
            const moves: GoMove[] = minimax.getListMoves(initialNode);
            expect(moves).toEqual([GoMove.ACCEPT]);
        });
        it('should only have GoMove.ACCEPT in COUNTNG Phase when agreeing on the result', () => {
            const initialBoard: GoPiece[][] = GoState.getInitialState().getCopiedBoard();
            const state: GoState = new GoState(initialBoard, [0, 0], 0, MGPOptional.empty(), Phase.COUNTING);
            const initialNode: GoNode = new GoNode(state);
            spyOn(minimax, 'getCountingMovesList').and.returnValue([]);
            const moves: GoMove[] = minimax.getListMoves(initialNode);
            expect(moves).toEqual([GoMove.ACCEPT]);
        });
        it('should only have counting moves in COUNTING Phase when not agreeing on the result', () => {
            const initialBoard: GoPiece[][] = GoState.getInitialState().getCopiedBoard();
            const state: GoState = new GoState(initialBoard, [0, 0], 0, MGPOptional.empty(), Phase.ACCEPT);
            const initialNode: GoNode = new GoNode(state);
            spyOn(minimax, 'getCountingMovesList').and.returnValue([new GoMove(1, 1)]);
            const moves: GoMove[] = minimax.getListMoves(initialNode);
            expect(moves).toEqual([new GoMove(1, 1)]);
        });
        it('should want to switch dead piece when it consider those pieces alive', () => {
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
