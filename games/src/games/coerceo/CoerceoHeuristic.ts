import { PlayerMetricHeuristic } from '../../jscaip/AI/PlayerMetricHeuristic';
import { Coord } from '../../jscaip/Coord';
import { CoordSet } from '../../jscaip/CoordSet';
import { FourStatePiece } from '../../jscaip/FourStatePiece';
import { Player } from '../../jscaip/Player';
import { PlayerMap } from '../../jscaip/PlayerMap';
import { PlayerNumberTable } from '../../jscaip/PlayerNumberTable';

import { CoerceoMove } from './CoerceoMove';
import { CoerceoConfig } from './CoerceoRules';
import { CoerceoState } from './CoerceoState';

export abstract class CoerceoHeuristic extends PlayerMetricHeuristic<CoerceoMove, CoerceoState, CoerceoConfig> {

    public getPiecesMap(state: CoerceoState): PlayerMap<CoordSet> {
        const zeroPieces: Coord[] = [];
        const onePieces: Coord[] = [];
        for (const coordAndContent of state.getCoordsAndContents()) {
            const coord: Coord = coordAndContent.coord;
            const piece: FourStatePiece = state.getPieceAt(coord);
            if (piece === FourStatePiece.ZERO) {
                zeroPieces.push(coord);
            } else if (piece === FourStatePiece.ONE) {
                onePieces.push(coord);
            }
        }
        return PlayerMap.ofValues(new CoordSet(zeroPieces), new CoordSet(onePieces));
    }

    protected getPiecesFreedomScore(state: CoerceoState): [number, number] {
        const piecesByFreedom: PlayerNumberTable = state.getPiecesByFreedom();
        return [
            this.getPlayerPiecesScore(piecesByFreedom.get(Player.ZERO)),
            this.getPlayerPiecesScore(piecesByFreedom.get(Player.ONE)),
        ];
    }

    private getPlayerPiecesScore(piecesScores: readonly number[]): number {
        // Since having exactly one freedom left is less advantageous, as more dangerous
        const capturableScore: number = 1;
        const safeScore: number = 3;
        return (safeScore * piecesScores[0]) +
            (capturableScore * piecesScores[1]) +
            (safeScore * piecesScores[2]) +
            (safeScore * piecesScores[3]);
    }

}
