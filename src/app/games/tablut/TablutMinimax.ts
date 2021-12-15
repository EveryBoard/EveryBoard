import { TablutState } from './TablutState';
import { TablutMove } from './TablutMove';
import { Player } from 'src/app/jscaip/Player';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { display } from 'src/app/utils/utils';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { TablutLegalityInformation, TablutNode, TablutRules } from './TablutRules';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';
import { Coord } from 'src/app/jscaip/Coord';
import { TablutCase } from './TablutCase';

export class TablutMinimax extends Minimax<TablutMove, TablutState, TablutLegalityInformation> {

    public getListMoves(node: TablutNode): TablutMove[] {
        const LOCAL_VERBOSE: boolean = false;
        display(TablutRules.VERBOSE || LOCAL_VERBOSE, { TablutMinimax_getListMoves: { node } });

        const state: TablutState = node.gameState;

        const currentBoard: Table<TablutCase> = state.getCopiedBoard();
        const currentPlayer: Player = state.getCurrentPlayer();

        const listMoves: TablutMove[] = TablutRules.getPlayerListMoves(currentPlayer, currentBoard);
        return this.orderMoves(state, listMoves);
    }
    public orderMoves(state: TablutState, listMoves: TablutMove[]): TablutMove[] {
        const king: Coord = TablutRules.getKingCoord(state.getCopiedBoard()).get();
        if (state.getCurrentPlayer() === Player.ZERO) { // Invader
            ArrayUtils.sortByDescending(listMoves, (move: TablutMove) => {
                return - move.end.getOrthogonalDistance(king);
            });
        } else {
            ArrayUtils.sortByDescending(listMoves, (move: TablutMove) => {
                if (move.coord.equals(king)) {
                    if (TablutRules.isExternalThrone(move.end)) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    return 0;
                }
            });
        }
        return listMoves;
    }
    public getBoardValue(node: TablutNode): NodeUnheritance {
        const state: TablutState = node.gameState;
        // 1. is the king escaped ?
        // 2. is the king captured ?
        // 3. is one player immobilized ?
        // 4. let's just for now just count the pawns
        const board: Table<TablutCase> = state.getCopiedBoard();

        const victory: MGPOptional<Player> = TablutRules.getWinner(board);
        if (victory.isPresent()) {
            return new NodeUnheritance(victory.get().getVictoryValue());
        }
        const nbPlayerZeroPawns: number = TablutRules.getPlayerListPawns(Player.ZERO, board).length;
        const nbPlayerOnePawns: number = TablutRules.getPlayerListPawns(Player.ONE, board).length;
        const zeroMult: number = [1, 2][TablutState.INVADER.value]; // invaders pawn are twice as numerous
        const oneMult: number = [2, 1][TablutState.INVADER.value]; // so they're twice less valuable
        const scoreZero: number = nbPlayerZeroPawns * zeroMult;
        const scoreOne: number = nbPlayerOnePawns * oneMult;
        return new NodeUnheritance(scoreOne - scoreZero);
    }
}
