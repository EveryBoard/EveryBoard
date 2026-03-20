import { ArrayUtils } from '@everyboard/lib';

import { PlayerMetricHeuristic } from '../../jscaip/AI/Minimax';
import { Coord } from '../../jscaip/Coord';
import { CoordSet } from '../../jscaip/CoordSet';
import { FourStatePiece } from '../../jscaip/FourStatePiece';
import { Player } from '../../jscaip/Player';
import { PlayerNumberTable } from '../../jscaip/PlayerNumberTable';
import { NoConfig } from '../../jscaip/RulesConfigUtil';

import { SaharaMove } from './SaharaMove';
import { SaharaNode, SaharaRules } from './SaharaRules';
import { SaharaState } from './SaharaState';

export class SaharaMobilityHeuristic extends PlayerMetricHeuristic<SaharaMove, SaharaState> {

    public override getMetrics(node: SaharaNode, _config: NoConfig): PlayerNumberTable {
        const zeroMobilities: number[] = this.getMobilities(node.gameState, Player.ZERO);
        const oneMobilities: number[] = this.getMobilities(node.gameState, Player.ONE);
        return PlayerNumberTable.of(
            zeroMobilities,
            oneMobilities,
        );
    }

    private getMobilities(state: SaharaState, player: Player): number[] {
        const mobilities: number[] = [];
        for (const coord of state.allCoords()) {
            if (state.hasPieceBelongingTo(coord, player)) {
                mobilities.push(this.countMoveToClosestAlly(state, coord));
            }
        }
        ArrayUtils.sortByDescending(mobilities, (mobility: number) => mobility);
        return mobilities;
    }

    public countMoveToClosestAlly(state: SaharaState, coord: Coord): number {
        let exploredCoords: CoordSet = new CoordSet([coord]);
        let newWaveOfNeighbors: CoordSet = this.getLandingCoords(state, new CoordSet([coord]));
        let depth: number = 1;
        while (newWaveOfNeighbors.size() > 0) {
            const numberOfAllies: CoordSet = newWaveOfNeighbors.filter(
                (c: Coord) => state.getPieceAt(c).equals(state.getPieceAt(coord)),
            );
            const emptyNeighbor: CoordSet = newWaveOfNeighbors.filter(
                (c: Coord) => state.getPieceAt(c).equals(FourStatePiece.EMPTY),
            );
            if (numberOfAllies.size() > 0) {
                return depth;
            } else if (emptyNeighbor.size() === 0) {
                newWaveOfNeighbors = new CoordSet();
            } else {
                exploredCoords = exploredCoords.union(emptyNeighbor);
                newWaveOfNeighbors = this.getLandingCoords(state, emptyNeighbor);
                newWaveOfNeighbors = newWaveOfNeighbors.filter((c: Coord) => exploredCoords.contains(c) === false);
                depth++;
            }
        }
        return Number.MIN_SAFE_INTEGER;
    }

    private getLandingCoords(state: SaharaState, coords: CoordSet): CoordSet {
        let neighboringCoords: CoordSet = new CoordSet();
        for (const currentCoord of coords) {
            const neighbors: Coord[] = SaharaRules.getValidLandingCoords(state, currentCoord);
            for (const neighbor of neighbors) {
                if (coords.contains(neighbor) === false) {
                    neighboringCoords = neighboringCoords.addElement(neighbor);
                }
            }
        }
        return neighboringCoords;
    }

}
