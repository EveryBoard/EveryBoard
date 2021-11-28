
import { TaflRules, TaflState } from './TaflRules';
import { TaflMove } from './TaflMove';
import { Player } from 'src/app/jscaip/Player';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { display } from 'src/app/utils/utils';
import { TaflLegalityStatus } from './TaflLegalityStatus';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';
import { Coord } from 'src/app/jscaip/Coord';
import { TaflPawn } from './TaflPawn';
import { MGPNode } from 'src/app/jscaip/MGPNode';

export class TaflNode extends MGPNode<TaflRules<TaflMove, TaflState>, TaflMove, TaflState, TaflLegalityStatus> {}

export class TaflMinimax extends Minimax<TaflMove,
                                         TaflState,
                                         TaflLegalityStatus,
                                         NodeUnheritance,
                                         TaflRules<TaflMove, TaflState>>
{
    public getListMoves(node: TaflNode): TaflMove[] {
        const LOCAL_VERBOSE: boolean = false;
        display(LOCAL_VERBOSE, { TaflMinimax_getListMoves: { node } });

        const state: TaflState = node.gameState;

        const currentPlayer: Player = state.getCurrentPlayer();

        const listMoves: TaflMove[] = this.ruler.getPlayerListMoves(currentPlayer, state);
        return this.orderMoves(state, listMoves);
    }
    public orderMoves(state: TaflState, listMoves: TaflMove[]): TaflMove[] {
        const king: Coord = this.ruler.getKingCoord(state.getCopiedBoard()).get();
        if (state.getCurrentPlayer() === Player.ZERO) { // Invader
            ArrayUtils.sortByDescending(listMoves, (move: TaflMove) => {
                return - move.end.getOrthogonalDistance(king);
            });
        } else {
            ArrayUtils.sortByDescending(listMoves, (move: TaflMove) => {
                if (move.coord.equals(king)) {
                    if (this.ruler.isExternalThrone(move.end)) {
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
    public getBoardValue(node: TaflNode): NodeUnheritance {
        const state: TaflState = node.gameState;
        // 1. is the king escaped ?
        // 2. is the king captured ?
        // 3. is one player immobilized ?
        // 4. let's just for now just count the pawns
        const board: Table<TaflPawn> = state.getCopiedBoard();

        const victory: MGPOptional<Player> = this.ruler.getWinner(state);
        if (victory.isPresent()) {
            return new NodeUnheritance(victory.get().getVictoryValue());
        }
        const nbPlayerZeroPawns: number = this.ruler.getPlayerListPawns(Player.ZERO, board).length;
        const nbPlayerOnePawns: number = this.ruler.getPlayerListPawns(Player.ONE, board).length;
        const zeroMult: number = [1, 2][this.ruler.config.INVADER.value]; // invaders pawn are twice as numerous
        const oneMult: number = [2, 1][this.ruler.config.INVADER.value]; // so they're twice less valuable
        const scoreZero: number = nbPlayerZeroPawns * zeroMult;
        const scoreOne: number = nbPlayerOnePawns * oneMult;
        return new NodeUnheritance(scoreOne - scoreZero);
    }
}
