import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { BoardValue } from 'src/app/jscaip/BoardValue';
import { Player } from 'src/app/jscaip/Player';
import { TaflPawn } from './TaflPawn';
import { TaflState } from './TaflState';
import { TaflPieceAndControlMinimax, TaflPieceAndControlMinimaxMetrics } from './TaflPieceAndControlMinimax';
import { TaflNode } from './TaflMinimax';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { Utils } from 'src/app/utils/utils';

export class TaflEscapeThenPieceThenControlMinimax extends TaflPieceAndControlMinimax {

    public override getBoardValue(node: TaflNode): BoardValue {
        const gameStatus: GameStatus = this.ruler.getGameStatus(node);
        if (gameStatus.isEndGame) {
            return gameStatus.toBoardValue();
        }
        const state: TaflState = node.gameState;
        const width: number = this.ruler.config.WIDTH;

        const metrics: TaflPieceAndControlMinimaxMetrics =
            this.getControlScoreAndPieceScores(width, state);
        const defender: Player = state.getPieceAt(this.ruler.getKingCoord(state).get()).getOwner() as Player;
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
    private getStepForEscape(state: TaflState): number {
        const king: Coord = this.ruler.getKingCoord(state).get();
        return this._getStepForEscape(state, 1, [king], []).getOrElse(-1);
    }
    private _getStepForEscape(state: TaflState,
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
        if (nextGen.some((coord: Coord) => this.ruler.isExternalThrone(coord))) {
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
                while (landing.isInRange(this.ruler.config.WIDTH, this.ruler.config.WIDTH) &&
                       state.getPieceAt(landing) === TaflPawn.UNOCCUPIED)
                {
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
