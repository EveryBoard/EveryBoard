import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { BoardValue } from 'src/app/jscaip/AI/BoardValue';
import { Player } from 'src/app/jscaip/Player';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPSet } from 'src/app/utils/MGPSet';
import { TaflPawn } from './TaflPawn';
import { TaflState } from './TaflState';
import { SandwichThreat } from '../../jscaip/PieceThreat';
import { CoordSet } from 'src/app/utils/OptimizedSet';
import { TaflMove } from './TaflMove';
import { TaflPieceAndInfluenceHeuristic } from './TaflPieceAndInfluenceHeuristic';
import { TaflNode } from './TaflRules';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { TaflConfig } from './TaflConfig';

export type TaflPieceAndControlHeuristicMetrics = {
    controlScore: number,
    threatenedScore: number,
    safeScore: number,
};

export class TaflPieceAndControlHeuristic<M extends TaflMove> extends TaflPieceAndInfluenceHeuristic<M> {

    public override getBoardValue(node: TaflNode<M>, config: MGPOptional<TaflConfig>): BoardValue {
        const metrics: TaflPieceAndControlHeuristicMetrics = this.getControlScoreAndPieceScores(node, config);
        return BoardValue.multiMetric([
            metrics.safeScore,
            metrics.threatenedScore,
            metrics.controlScore,
        ]);
    }

    protected getControlScoreAndPieceScores(node: TaflNode<M>, config: MGPOptional<TaflConfig>)
    : TaflPieceAndControlHeuristicMetrics
    {
        const state: TaflState = node.gameState;
        const pieceMap: MGPMap<Player, MGPSet<Coord>> = this.getPiecesMap(state);
        const threatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = this.getThreatMap(node, pieceMap);
        const filteredThreatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = this.filterThreatMap(threatMap, state);
        const metrics: TaflPieceAndControlHeuristicMetrics = { safeScore: 0, threatenedScore: 0, controlScore: 0 };
        for (const owner of Player.PLAYERS) {
            const controlledSquares: MGPSet<Coord> = new CoordSet();
            for (const coord of pieceMap.get(owner).get()) {
                if (filteredThreatMap.get(coord).isPresent()) {
                    metrics.threatenedScore += owner.getScoreModifier();
                } else {
                    metrics.safeScore += owner.getScoreModifier();
                    for (const dir of Orthogonal.ORTHOGONALS) {
                        let testedCoord: Coord = coord.getNext(dir, 1);
                        while (state.isOnBoard(testedCoord) &&
                               state.getPieceAt(testedCoord) === TaflPawn.UNOCCUPIED)
                        {
                            controlledSquares.add(testedCoord);
                            testedCoord = testedCoord.getNext(dir, 1);
                        }
                    }
                }
            }
            for (const controlled of controlledSquares) {
                const controlledValue: number =
                    this.getControlledPieceValue(controlled.x, controlled.y, state.getWidth());
                metrics.controlScore += owner.getScoreModifier() * controlledValue;
            }
        }
        return metrics;
    }

    private getControlledPieceValue(x: number, y: number, width: number): number {
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

}
