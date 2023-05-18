import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { BoardValue } from 'src/app/jscaip/BoardValue';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus } from 'src/app/jscaip/Rules';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPSet } from 'src/app/utils/MGPSet';
import { TaflPawn } from './TaflPawn';
import { TaflState } from './TaflState';
import { TaflPieceAndInfluenceMinimax } from './TaflPieceAndInfluenceMinimax';
import { SandwichThreat } from '../../jscaip/PieceThreat';
import { TaflNode } from './TaflMinimax';
import { CoordSet } from 'src/app/utils/OptimizedSet';
import { assert } from 'src/app/utils/assert';

export type TaflPieceAndControlMinimaxMetrics = {
    controlScore: number,
    threatenedScore: number,
    safeScore: number,
};

export class TaflPieceAndControlMinimax extends TaflPieceAndInfluenceMinimax {

    public override getBoardValue(node: TaflNode): BoardValue {
        const gameStatus: GameStatus = this.ruler.getGameStatus(node);
        if (gameStatus.isEndGame) {
            return gameStatus.toBoardValue();
        }
        const state: TaflState = node.gameState;
        const width: number = this.ruler.config.WIDTH;

        const metrics: TaflPieceAndControlMinimaxMetrics =
            this.getControlScoreAndPieceScores(width, state);
        let scoreValue: number = metrics.controlScore;
        scoreValue += metrics.safeScore * this.getScoreBySafePiece(state);
        const maxControl: number = this.getScoreByThreatenedPiece(state);
        scoreValue += metrics.threatenedScore * maxControl;
        assert(metrics.controlScore <= maxControl, 'Control Score should be below ' + maxControl + ', got ' + metrics.controlScore);
        assert(metrics.threatenedScore <= 16, 'Threatened Score should be below 16, got ' + metrics.threatenedScore);
        assert(metrics.safeScore <= 16, 'Safe Score should be below 16, got ' + metrics.threatenedScore);
        return new BoardValue(scoreValue);
    }
    protected getControlScoreAndPieceScores(width: number,
                                            state: TaflState)
    : TaflPieceAndControlMinimaxMetrics
    {
        const pieceMap: MGPMap<Player, MGPSet<Coord>> = this.getPiecesMap(state);
        const threatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = this.getThreatMap(state, pieceMap);
        const filteredThreatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = this.filterThreatMap(threatMap, state);
        const metrics: TaflPieceAndControlMinimaxMetrics = { safeScore: 0, threatenedScore: 0, controlScore: 0 };
        for (const owner of Player.PLAYERS) {
            const controlledSquares: MGPSet<Coord> = new CoordSet();
            for (const coord of pieceMap.get(owner).get()) {
                if (filteredThreatMap.get(coord).isPresent()) {
                    metrics.threatenedScore += owner.getScoreModifier();
                } else {
                    metrics.safeScore += owner.getScoreModifier();
                    for (const dir of Orthogonal.ORTHOGONALS) {
                        let testedCoord: Coord = coord.getNext(dir, 1);
                        while (testedCoord.isInRange(width, width) &&
                            state.getPieceAt(testedCoord) === TaflPawn.UNOCCUPIED) {
                            controlledSquares.add(testedCoord);
                            testedCoord = testedCoord.getNext(dir, 1);
                        }
                    }
                }
            }
            for (const controlled of controlledSquares) {
                const controlledValue: number = this.getControlledPieceValue(controlled.x, controlled.y, width);
                metrics.controlScore += owner.getScoreModifier() * controlledValue;
            }
        }
        return metrics;
    }
    public getControlledPieceValue(x: number, y: number, width: number): number {
        let value: number = 1;
        if (x === 0 || x === width - 1) {
            value *= width;
        }
        if (y === 0 || y === width - 1) {
            value *= width;
        }
        /** 1 for center
          * width for border
          * width*width for corners
          */
        return value;
    }
    public getScoreByThreatenedPiece(state: TaflState): number {
        const width: number = state.board.length;
        // The value of the four corners (each being "width" * "width")
        // + the value of what remains of the four edges (each border square being worth "width")
        // + the value of what remains of the board (each square being worth one point)
        const reducedWidth: number = width - 2;
        return (4 * width * width) + (4 * reducedWidth * width) + (reducedWidth * reducedWidth);
    }
    public getScoreBySafePiece(state: TaflState): number {
        const scoreByThreatenedPiece: number = this.getScoreByThreatenedPiece(state);
        return (16 * scoreByThreatenedPiece) + 1;
    }
}
