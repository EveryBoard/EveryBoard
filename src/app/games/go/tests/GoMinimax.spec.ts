import { MGPNode } from 'src/app/jscaip/MGPNode';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GoMinimax } from '../GoMinimax';
import { GoMove } from '../GoMove';
import { GoPartSlice, GoPiece, Phase } from '../GoPartSlice';
import { GoNode, GoRules } from '../GoRules';

describe('GoMinimax', () => {

    let minimax: GoMinimax;

    beforeEach(() => {
        const rules: GoRules = new GoRules(GoPartSlice);
        minimax = new GoMinimax(rules, 'Dummy');
    });

    describe('getListMove', () => {
        it('should count as many move as empty case at first turn, + PASS', () => {
            const initialNode: GoNode = new MGPNode(null, null, GoPartSlice.getInitialSlice());
            const moves: GoMove[] = minimax.getListMoves(initialNode);
            expect(moves.length).toBe(GoPartSlice.WIDTH * GoPartSlice.HEIGHT + 1);
            expect(moves.some((m: GoMove) => m.equals(GoMove.PASS))).toBeTrue();
        });
        it('should only have GoMove.ACCEPT in COUNTING Phase when agreeing on the result', () => {
            const initialBoard: GoPiece[][] =
                GoPartSlice.mapNumberBoard(GoPartSlice.getInitialSlice().getCopiedBoard());
            const state: GoPartSlice = new GoPartSlice(initialBoard, [0, 0], 0, MGPOptional.empty(), Phase.ACCEPT);
            const initialNode: GoNode = new MGPNode(null, null, state);
            spyOn(GoRules, 'getCountingMovesList').and.returnValue([]);
            const moves: GoMove[] = minimax.getListMoves(initialNode);
            expect(moves).toEqual([GoMove.ACCEPT]);
        });
        it('should only have counting moves in COUNTING Phase when not agreeing on the result', () => {
            const initialBoard: GoPiece[][] =
                GoPartSlice.mapNumberBoard(GoPartSlice.getInitialSlice().getCopiedBoard());
            const state: GoPartSlice = new GoPartSlice(initialBoard, [0, 0], 0, MGPOptional.empty(), Phase.ACCEPT);
            const initialNode: GoNode = new MGPNode(null, null, state);
            spyOn(GoRules, 'getCountingMovesList').and.returnValue([new GoMove(1, 1)]);
            const moves: GoMove[] = minimax.getListMoves(initialNode);
            expect(moves).toEqual([new GoMove(1, 1)]);
        });
    });
});
