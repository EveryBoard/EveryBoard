import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { Heuristic, Minimax } from 'src/app/jscaip/Minimax';
import { BoardValue } from 'src/app/jscaip/BoardValue';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { EpaminondasMoveGenerator } from './EpaminondasMinimax';
import { EpaminondasMove } from './EpaminondasMove';
import { EpaminondasState } from './EpaminondasState';
import { EpaminondasLegalityInformation, EpaminondasNode, EpaminondasRules } from './EpaminondasRules';
import { GameStatus } from 'src/app/jscaip/GameStatus';

export class PhalanxSizeAndFilterEpaminondasMoveGenerator extends EpaminondasMoveGenerator {

    public override getListMoves(node: EpaminondasNode): EpaminondasMove[] {
        const moves: EpaminondasMove[] = super.getListMoves(node);
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
}

export class PositionalEpaminondasHeuristic extends Heuristic<EpaminondasMove, EpaminondasState> {

    public getBoardValue(node: EpaminondasNode): BoardValue {
        return new BoardValue(this.getPieceCountThenSupportThenAdvancement(node.gameState));
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
                const player: PlayerOrNone = state.getPieceAt(coord);
                if (player.isPlayer()) {
                    let progress: number; // between 0 et 11
                    let dirs: Direction[];
                    if (player === Player.ZERO) {
                        progress = 12 - y;
                        dirs = [Direction.UP_LEFT, Direction.UP, Direction.UP_RIGHT];
                    } else {
                        progress = y + 1;
                        dirs = [Direction.DOWN_LEFT, Direction.DOWN, Direction.DOWN_RIGHT];
                    }
                    const mod: number = player.getScoreModifier();
                    total += progress * mod;
                    total += SCORE_BY_PIECE * mod;
                    for (const dir of dirs) {
                        let neighbor: Coord = coord.getNext(dir, 1);
                        while (neighbor.isInRange(14, 12) &&
                               state.getPieceAt(neighbor) === player)
                        {
                            total += mod * SCORE_BY_ALIGNEMENT;
                            neighbor = neighbor.getNext(dir, 1);
                        }
                    }
                }
            }
        }
        return total;
    }
}

export class PositionalEpaminondasMinimax
    extends Minimax<EpaminondasMove, EpaminondasState, EpaminondasLegalityInformation> {

    public constructor() {
        super('Positional Minimax',
              EpaminondasRules.get(),
              new PositionalEpaminondasHeuristic(),
              new PhalanxSizeAndFilterEpaminondasMoveGenerator());
    }
}
