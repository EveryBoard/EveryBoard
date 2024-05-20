import { Coord } from 'src/app/jscaip/Coord';
import { PieceThreat } from 'src/app/jscaip/PieceThreat';
import { Player } from 'src/app/jscaip/Player';
import { MGPMap, MGPOptional, MGPSet } from '@everyboard/lib';
import { CoerceoState } from './CoerceoState';
import { CoerceoConfig, CoerceoNode } from './CoerceoRules';
import { PlayerNumberTable } from 'src/app/jscaip/PlayerNumberTable';
import { CoerceoHeuristic } from './CoerceoHeuristic';

export class CoerceoPiecesThreatsTilesHeuristic extends CoerceoHeuristic {

    public override getMetrics(node: CoerceoNode, _config: MGPOptional<CoerceoConfig>): PlayerNumberTable {
        const state: CoerceoState = node.gameState;
        const pieceMap: MGPMap<Player, MGPSet<Coord>> = this.getPiecesMap(state);
        const threatMap: MGPMap<Coord, PieceThreat> = this.getThreatMap(state, pieceMap);
        const filteredThreatMap: MGPMap<Coord, PieceThreat> = this.filterThreatMap(threatMap, state);
        const safeIndex: number = 0;
        const threatenedIndex: number = 1;
        const tilesIndex: number = 2;
        const metrics: PlayerNumberTable = PlayerNumberTable.of([0, 0, 0], [0, 0, 0]);

        for (const owner of Player.PLAYERS) {
            for (const coord of pieceMap.get(owner).get()) {
                if (filteredThreatMap.get(coord).isPresent()) {
                    metrics.add(owner, threatenedIndex, 1);
                } else {
                    metrics.add(owner, safeIndex, 1);
                }
            }
            metrics.add(owner, tilesIndex, state.tiles.get(owner));
        }
        return metrics;
    }

}
