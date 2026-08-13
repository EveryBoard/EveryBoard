import { Player } from '@everyboard/games';
import { MGPMap } from '@everyboard/lib';

import { CoordSet } from '../../jscaip/CoordSet';
import { PlayerNumberTable } from '../../jscaip/PlayerNumberTable';

import { CoerceoHeuristic } from './CoerceoHeuristic';
import { CoerceoConfig, CoerceoNode } from './CoerceoRules';
import { CoerceoState } from './CoerceoState';

export class CoerceoPiecesTilesFreedomHeuristic extends CoerceoHeuristic {

    public override getMetrics(node: CoerceoNode, _config: CoerceoConfig): PlayerNumberTable {
        const state: CoerceoState = node.gameState;
        const metrics: PlayerNumberTable = PlayerNumberTable.of([0, 0, 0], [0, 0, 0]);
        const pieceMap: MGPMap<Player, CoordSet> = this.getPiecesMap(state);
        const piecesScores: [number, number] = this.getPiecesFreedomScore(state);
        const pieceIndex: number = 0;
        const tilesIndex: number = 1;
        const freedomIndex: number = 2;

        for (const owner of Player.PLAYERS) {
            const playerPieces: CoordSet = pieceMap.get(owner).get();
            metrics.add(owner, pieceIndex, playerPieces.size());
            metrics.add(owner, tilesIndex, state.tiles.get(owner));
            metrics.add(owner, freedomIndex, piecesScores[owner.getValue()]);
        }
        return metrics;
    }

}
