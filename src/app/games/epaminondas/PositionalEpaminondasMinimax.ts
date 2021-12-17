import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus } from 'src/app/jscaip/Rules';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { EpaminondasMinimax } from './EpaminondasMinimax';
import { EpaminondasMove } from './EpaminondasMove';
import { EpaminondasState } from './EpaminondasState';
import { EpaminondasLegalityInformation, EpaminondasNode } from './EpaminondasRules';

export class PositionalEpaminondasMinimax extends Minimax<EpaminondasMove,
                                                          EpaminondasState,
                                                          EpaminondasLegalityInformation>
{

    public getListMoves(node: EpaminondasNode): EpaminondasMove[] {
        const moves: EpaminondasMove[] = EpaminondasMinimax.getListMoves(node);
        return this.orderMovesByPhalanxSizeAndFilter(moves, node.gameState);
    }
    private orderMovesByPhalanxSizeAndFilter(moves: EpaminondasMove[], state: EpaminondasState): EpaminondasMove[] {
        ArrayUtils.sortByDescending(moves, (move: EpaminondasMove): number => {
            return move.movedPieces;
        });
        if (moves.length > 40) {
            const evenMoves: EpaminondasMove[] = moves.filter((move: EpaminondasMove) => {
                if (this.moveIsCapture(move, state)) {
                    return true;
                } else {
                    return ((move.movedPieces) * Math.random()) > 1;
                }
            });
            return evenMoves;
        }
        return moves;
    }
    private moveIsCapture(move: EpaminondasMove, state: EpaminondasState): boolean {
        const landing: Coord = move.coord.getNext(move.direction, move.movedPieces + move.stepSize - 1);
        return state.board[landing.y][landing.x] === state.getCurrentOpponent();
    }
    public getBoardValue(node: EpaminondasNode): NodeUnheritance {
        const gameStatus: GameStatus = this.ruler.getGameStatus(node);
        if (gameStatus.isEndGame) {
            return new NodeUnheritance(gameStatus.toBoardValue());
        }
        return new NodeUnheritance(this.getPieceCountThenSupportThenAdvancement(node.gameState));
    }
    private getPieceCountThenSupportThenAdvancement(state: EpaminondasState): number {
        const MAX_ADVANCEMENT_SCORE_TOTAL: number = 28 * 12;
        const SCORE_BY_ALIGNEMENT: number = MAX_ADVANCEMENT_SCORE_TOTAL + 1; // OLDLY 13
        const MAX_NUMBER_OF_ALIGNEMENT: number = (24*16) + (4*15);
        const SCORE_BY_PIECE: number = (MAX_NUMBER_OF_ALIGNEMENT * SCORE_BY_ALIGNEMENT) + 1; // OLDLY 25*13
        let total: number = 0;
        for (let y: number = 0; y < 12; y++) {
            for (let x: number = 0; x < 14; x++) {
                const coord: Coord = new Coord(x, y);
                const player: Player = state.getPieceAt(coord);
                if (player !== Player.NONE) {
                    let avancement: number; // entre 0 et 11
                    let dirs: Direction[];
                    if (player === Player.ZERO) {
                        avancement = 12 - y;
                        dirs = [Direction.UP_LEFT, Direction.UP, Direction.UP_RIGHT];
                    } else {
                        avancement = y + 1;
                        dirs = [Direction.DOWN_LEFT, Direction.DOWN, Direction.DOWN_RIGHT];
                    }
                    const mod: number = player.getScoreModifier();
                    total += avancement * mod;
                    total += SCORE_BY_PIECE * mod;
                    for (const dir of dirs) {
                        let neighboor: Coord = coord.getNext(dir, 1);
                        while (neighboor.isInRange(14, 12) &&
                               state.getPieceAt(neighboor) === player)
                        {
                            total += mod * SCORE_BY_ALIGNEMENT;
                            neighboor = neighboor.getNext(dir, 1);
                        }
                    }
                }
            }
        }
        return total;
    }
}
