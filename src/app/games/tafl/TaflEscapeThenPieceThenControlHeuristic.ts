import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { BoardValue } from 'src/app/jscaip/BoardValue';
import { Player } from 'src/app/jscaip/Player';
import { TaflPawn } from './TaflPawn';
import { TaflState } from './TaflState';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { TaflMove } from './TaflMove';
import { Utils } from 'src/app/utils/utils';
import { TaflPieceAndControlHeuristic, TaflPieceAndControlHeuristicMetrics } from './TaflPieceAndControlHeuristic';
import { TaflNode } from './TaflRules';

export class TaflEscapeThenPieceThenControlHeuristic<M extends TaflMove, S extends TaflState>
    extends TaflPieceAndControlHeuristic<M, S>
{

    public override getBoardValue(node: TaflNode<M, S>): BoardValue {
        const state: S = node.gameState;
        const metrics: TaflPieceAndControlHeuristicMetrics = this.getControlScoreAndPieceScores(node);
        const defender: Player = state.getPieceAt(this.rules.getKingCoord(state).get()).getOwner() as Player;
        const stepForEscape: number = this.getStepForEscape(state) * defender.getScoreModifier();
        if (stepForEscape === -1) {
            return new BoardValue(defender.getOpponent().getPreVictory());
        }
        const maxControl: number = this.getScoreByThreatenedPiece(state);
        Utils.assert(metrics.controlScore <= maxControl, 'Control Score should be below ' + maxControl + ', got ' + metrics.controlScore);
        Utils.assert(metrics.threatenedScore <= 16, 'Threatened Score should be below 16, got ' + metrics.threatenedScore);
        Utils.assert(metrics.safeScore <= 16, 'Safe Score should be below 16, got ' + metrics.threatenedScore);
        return new BoardValue((-1 * stepForEscape * (maxControl + 1) * 17 * 17) +
                              (metrics.safeScore * (maxControl + 1) * 17) +
                              (metrics.threatenedScore * (maxControl + 1)) +
                              metrics.controlScore);
    }
    private getStepForEscape(state: S): number {
        const king: Coord = this.rules.getKingCoord(state).get();
        return this._getStepForEscape(state, 1, [king], []).getOrElse(-1);
    }
    private _getStepForEscape(state: S,
                              step: number,
                              previousGen: Coord[],
                              handledCoords: Coord[])
    : MGPOptional<number>
    {
        const nextGen: Coord[] = this.getNextGen(state, previousGen, handledCoords);

        if (nextGen.length === 0) {
            // not found:
            return MGPOptional.empty();
        }
        if (nextGen.some((coord: Coord) => this.rules.isExternalThrone(state, coord))) {
            return MGPOptional.of(step);
        } else {
            step++;
            handledCoords.push(...nextGen);
            return this._getStepForEscape(state, step, nextGen, handledCoords);
        }
    }
    private getNextGen(state: TaflState, previousGen: Coord[], handledCoords: Coord[]): Coord[] {
        const newGen: Coord[] = [];
        for (const piece of previousGen) {
            for (const dir of Orthogonal.ORTHOGONALS) {
                let landing: Coord = piece.getNext(dir, 1);
                while (state.isOnBoard(landing) && state.getPieceAt(landing) === TaflPawn.UNOCCUPIED) {
                    if (handledCoords.every((coord: Coord) => coord.equals(landing) === false)) {
                        // coord is new
                        newGen.push(landing);
                    }
                    landing = landing.getNext(dir, 1);
                }
            }
        }
        return newGen;
    }
}
