import { TablutPartSlice } from './TablutPartSlice';
import { TablutMove } from './TablutMove';
import { Player } from 'src/app/jscaip/Player';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { display } from 'src/app/utils/utils';
import { TablutLegalityStatus } from './TablutLegalityStatus';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { TablutNode, TablutRules } from './TablutRules';

export class TablutMinimax extends Minimax<TablutMove, TablutPartSlice, TablutLegalityStatus> {

    public getListMoves(node: TablutNode): TablutMove[] {
        const LOCAL_VERBOSE: boolean = false;
        display(TablutRules.VERBOSE || LOCAL_VERBOSE, { TablutRules_getListMoves: { node } });

        const slice: TablutPartSlice = node.gamePartSlice;

        const currentBoard: number[][] = slice.getCopiedBoard();
        const currentPlayer: Player = slice.getCurrentPlayer();

        return TablutRules.getPlayerListMoves(currentPlayer, currentBoard);
    }
    public getBoardValue(node: TablutNode): NodeUnheritance {
        const slice: TablutPartSlice = node.gamePartSlice;
        // 1. is the king escaped ?
        // 2. is the king captured ?
        // 3. is one player immobilised ?
        // 4. let's just for now just count the pawns
        const board: number[][] = slice.getCopiedBoard();

        const victory: MGPOptional<Player> = TablutRules.getWinner(board);
        if (victory.isPresent()) {
            return new NodeUnheritance(victory.get().getVictoryValue());
        }
        const nbPlayerZeroPawns: number = TablutRules.getPlayerListPawns(Player.ZERO, board).length;
        const nbPlayerOnePawns: number = TablutRules.getPlayerListPawns(Player.ONE, board).length;
        const zeroMult: number = TablutPartSlice.INVADER_START ? 1 : 2; // invaders pawn are twice as numerous
        const oneMult: number = TablutPartSlice.INVADER_START ? 2 : 1; // so they're twice less valuable
        const scoreZero: number = nbPlayerZeroPawns * zeroMult;
        const scoreOne: number = nbPlayerOnePawns * oneMult;
        return new NodeUnheritance(scoreOne - scoreZero); // TODO : countInvader vs Defenders
    }
}
