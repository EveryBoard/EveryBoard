import { TablutState } from './tablut/TablutState';
import { TaflMove } from './TaflMove';
import { Player } from 'src/app/jscaip/Player';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { display } from 'src/app/utils/utils';
import { TaflLegalityStatus } from './TaflLegalityStatus';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { TablutNode, TablutRules } from './tablut/TablutRules';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';
import { Coord } from 'src/app/jscaip/Coord';
import { TaflPawn } from './TaflPawn';

export class TablutMinimax extends Minimax<TaflMove, TablutState, TaflLegalityStatus> {

    public getListMoves(node: TablutNode): TaflMove[] {
        const LOCAL_VERBOSE: boolean = false;
        display(TablutRules.VERBOSE || LOCAL_VERBOSE, { TablutMinimax_getListMoves: { node } });

        const state: TablutState = node.gameState;

        const currentPlayer: Player = state.getCurrentPlayer();

        const listMoves: TaflMove[] = TablutRules.get().getPlayerListMoves(currentPlayer, state);
        return this.orderMoves(state, listMoves);
    }
    public orderMoves(state: TablutState, listMoves: TaflMove[]): TaflMove[] {
        const king: Coord = TablutRules.get().getKingCoord(state.getCopiedBoard()).get();
        if (state.getCurrentPlayer() === Player.ZERO) { // Invader
            ArrayUtils.sortByDescending(listMoves, (move: TaflMove) => {
                return - move.end.getOrthogonalDistance(king);
            });
        } else {
            ArrayUtils.sortByDescending(listMoves, (move: TaflMove) => {
                if (move.coord.equals(king)) {
                    if (TablutRules.get().isExternalThrone(move.end)) {
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
        const board: Table<TaflPawn> = state.getCopiedBoard();

        const victory: MGPOptional<Player> = TablutRules.get().getWinner(state);
        if (victory.isPresent()) {
            return new NodeUnheritance(victory.get().getVictoryValue());
        }
        const nbPlayerZeroPawns: number = TablutRules.get().getPlayerListPawns(Player.ZERO, board).length;
        const nbPlayerOnePawns: number = TablutRules.get().getPlayerListPawns(Player.ONE, board).length;
        const zeroMult: number = [1, 2][TablutRules.get().config.INVADER.value]; // invaders pawn are twice as numerous
        const oneMult: number = [2, 1][TablutRules.get().config.INVADER.value]; // so they're twice less valuable
        const scoreZero: number = nbPlayerZeroPawns * zeroMult;
        const scoreOne: number = nbPlayerOnePawns * oneMult;
        return new NodeUnheritance(scoreOne - scoreZero);
    }
}
