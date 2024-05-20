import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { MGPMap, MGPOptional, MGPSet } from '@everyboard/lib';
import { CoerceoState } from './CoerceoState';
import { CoerceoConfig, CoerceoNode } from './CoerceoRules';
import { PlayerNumberTable } from 'src/app/jscaip/PlayerNumberTable';
import { CoerceoHeuristic } from './CoerceoHeuristic';

export class CoerceoPiecesTilesFreedomHeuristic extends CoerceoHeuristic {

    public override getMetrics(node: CoerceoNode, _config: MGPOptional<CoerceoConfig>): PlayerNumberTable {
        const state: CoerceoState = node.gameState;
        const metrics: PlayerNumberTable = PlayerNumberTable.of([0, 0, 0], [0, 0, 0]);
        const pieceMap: MGPMap<Player, MGPSet<Coord>> = this.getPiecesMap(state);
        const piecesScores: [number, number] = this.getPiecesFreedomScore(state);
        const pieceIndex: number = 0;
        const tilesIndex: number = 1;
        const freedomIndex: number = 2;

        for (const owner of Player.PLAYERS) {
            const playerPieces: MGPSet<Coord> = pieceMap.get(owner).get();
            metrics.add(owner, pieceIndex, playerPieces.size());
            metrics.add(owner, tilesIndex, state.tiles.get(owner));
            metrics.add(owner, freedomIndex, piecesScores[owner.getValue()]);
        }
        return metrics;
    }

}
