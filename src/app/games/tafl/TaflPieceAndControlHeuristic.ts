import { Player } from '@everyboard/games';
import { BoardValue } from '@everyboard/games';
import { Coord } from '@everyboard/games';
import { CoordSet } from '@everyboard/games';
import { Orthogonal } from '@everyboard/games';
import { SandwichThreat } from '@everyboard/games';
import { MGPMap, Set } from '@everyboard/lib';

import { TaflConfig } from './TaflConfig';
import { TaflMove } from './TaflMove';
import { TaflPawn } from './TaflPawn';
import { TaflPieceAndInfluenceHeuristic } from './TaflPieceAndInfluenceHeuristic';
import { TaflNode } from './TaflRules';
import { TaflState } from './TaflState';

export type TaflPieceAndControlHeuristicMetrics = {
    controlScore: number;
    threatenedScore: number;
    safeScore: number;
};

export class TaflPieceAndControlHeuristic<M extends TaflMove> extends TaflPieceAndInfluenceHeuristic<M> {

    public override getBoardValue(node: TaflNode<M>, config: TaflConfig): BoardValue {
        const metrics: TaflPieceAndControlHeuristicMetrics = this.getControlScoreAndPieceScores(node, config);
        return BoardValue.multiMetric([
            metrics.safeScore,
            metrics.threatenedScore,
            metrics.controlScore,
        ]);
    }

    protected getControlScoreAndPieceScores(node: TaflNode<M>, config: TaflConfig)
    : TaflPieceAndControlHeuristicMetrics
    {
        const state: TaflState = node.gameState;
        const pieceMap: MGPMap<Player, CoordSet> = this.getPiecesMap(state);
        const threatMap: MGPMap<Coord, Set<SandwichThreat>> = this.getThreatMap(node, pieceMap);
        const filteredThreatMap: MGPMap<Coord, Set<SandwichThreat>> = this.filterThreatMap(threatMap, state);
        const metrics: TaflPieceAndControlHeuristicMetrics = { safeScore: 0, threatenedScore: 0, controlScore: 0 };
        for (const owner of Player.PLAYERS) {
            let controlledSquares: CoordSet = new CoordSet();
            for (const coord of pieceMap.get(owner).get()) {
                if (filteredThreatMap.get(coord).isPresent()) {
                    metrics.threatenedScore += owner.getScoreModifier();
                } else {
                    metrics.safeScore += owner.getScoreModifier();
                    for (const dir of Orthogonal.ORTHOGONALS) {
                        let testedCoord: Coord = coord.getNext(dir, 1);
                        while (state.hasPieceAt(testedCoord, TaflPawn.UNOCCUPIED)) {
                            controlledSquares = controlledSquares.addElement(testedCoord);
                            testedCoord = testedCoord.getNext(dir, 1);
                        }
                    }
                }
            }
            for (const controlled of controlledSquares) {
                const controlledValue: number = this.getControlledPieceValue(controlled, state);
                metrics.controlScore += owner.getScoreModifier() * controlledValue;
            }
        }
        return metrics;
    }

    private getControlledPieceValue(coord: Coord, state: TaflState): number {
        let value: number = 1;
        if (state.isHorizontalEdge(coord)) {
            value *= state.getWidth();
        }
        if (state.isVerticalEdge(coord)) {
            value *= state.getWidth();
        }
        /** 1 for center
          * width for border
          * width * width for corners
          */
        return value;
    }

}
