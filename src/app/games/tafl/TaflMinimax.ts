
import { TaflRules } from './TaflRules';
import { TaflState } from './TaflState';
import { TaflMove } from './TaflMove';
import { Player } from 'src/app/jscaip/Player';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { display } from 'src/app/utils/utils';
import { Minimax } from 'src/app/jscaip/Minimax';
import { BoardValue } from 'src/app/jscaip/BoardValue';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPNode } from 'src/app/jscaip/MGPNode';

export class TaflNode extends MGPNode<TaflRules<TaflMove, TaflState>, TaflMove, TaflState> {}

export class TaflMinimax extends Minimax<TaflMove,
                                         TaflState,
                                         void,
                                         BoardValue,
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
        const king: Coord = this.ruler.getKingCoord(state).get();
        if (state.getCurrentPlayer() === this.ruler.config.INVADER) { // Invader
            ArrayUtils.sortByDescending(listMoves, (move: TaflMove) => {
                return - move.getEnd().getOrthogonalDistance(king);
            });
        } else {
            ArrayUtils.sortByDescending(listMoves, (move: TaflMove) => {
                if (move.getStart().equals(king)) {
                    if (this.ruler.isExternalThrone(move.getEnd())) {
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
    public getBoardValue(node: TaflNode): BoardValue {
        const state: TaflState = node.gameState;
        // 1. has the king escaped ?
        // 2. is the king captured ?
        // 3. is one player immobilized ?
        // 4. let's just for now just count the pawns

        const victory: MGPOptional<Player> = this.ruler.getWinner(state);
        if (victory.isPresent()) {
            return new BoardValue(victory.get().getVictoryValue());
        }
        const nbPlayerZeroPawns: number = this.ruler.getPlayerListPawns(Player.ZERO, state).length;
        const nbPlayerOnePawns: number = this.ruler.getPlayerListPawns(Player.ONE, state).length;
        const zeroMult: number = [1, 2][this.ruler.config.INVADER.value]; // invaders pawn are twice as numerous
        const oneMult: number = [2, 1][this.ruler.config.INVADER.value]; // so they're twice less valuable
        const scoreZero: number = nbPlayerZeroPawns * zeroMult;
        const scoreOne: number = nbPlayerOnePawns * oneMult;
        return BoardValue.from(scoreZero, scoreOne);
    }
}
