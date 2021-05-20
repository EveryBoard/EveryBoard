import { DvonnMove } from '../DvonnMove';
import { DvonnPartSlice } from '../DvonnPartSlice';
import { DvonnPieceStack } from '../DvonnPieceStack';
import { DvonnRules } from '../DvonnRules';
import { MaxStacksDvonnMinimax } from '../MaxStacksDvonnMinimax';

describe('MaxStacksDvonnMinimax', () => {
    let rules: DvonnRules;
    let minimax: MaxStacksDvonnMinimax;

    const W: DvonnPieceStack = DvonnPieceStack.PLAYER_ONE;

    beforeEach(() => {
        rules = new DvonnRules(DvonnPartSlice);
        minimax = new MaxStacksDvonnMinimax('MaxStacksDvonnMinimax');
    });
    it('should propose 41 moves at first turn', () => {
        expect(minimax.getListMoves(rules.node).length).toBe(41);
    });
    it('should consider owning a new stack the best move', () => {
        const slice: DvonnPartSlice = rules.node.gamePartSlice;
        const bestMove: DvonnMove = rules.node.findBestMove(1, minimax);
        expect(slice.board[bestMove.end.y][bestMove.end.x]).toBe(DvonnPieceStack.encoder.encodeNumber(W));

    });
});
