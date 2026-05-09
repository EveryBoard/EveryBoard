import { ArrayUtils } from '@everyboard/lib';

import { PlayerMetricHeuristic } from '../../jscaip/AI/Minimax';
import { Coord } from '../../jscaip/Coord';
import { CoordSet } from '../../jscaip/CoordSet';
import { FourStatePiece } from '../../jscaip/FourStatePiece';
import { Player } from '../../jscaip/Player';
import { PlayerNumberTable } from '../../jscaip/PlayerNumberTable';
import { EmptyRulesConfig } from '../../jscaip/RulesConfigUtil';

import { SaharaMove } from './SaharaMove';
import { SaharaNode, SaharaRules } from './SaharaRules';
import { SaharaState } from './SaharaState';

export class SaharaMobilityHeuristic extends PlayerMetricHeuristic<SaharaMove, SaharaState> {

    public constructor(protected readonly rules: SaharaRules) {
        super();
    }

    public override getMetrics(node: SaharaNode, _config: EmptyRulesConfig): PlayerNumberTable {
        const zeroMobilities: number[] = this.getMobilities(node.gameState, Player.ZERO);
        const oneMobilities: number[] = this.getMobilities(node.gameState, Player.ONE);
        // Inversing cause high number are bad for you, so good for the opponent
        return PlayerNumberTable.of(
            oneMobilities,
            zeroMobilities,
        );
    }

    /**
     * @returns a list of number sorted from biggest to smallest
     *          each of those number represents the number of moves that one piece must take to reach the closest ally
     *          hence, the higher is considered the worst, as POSITIVE_INFINITY means surrounded
     */
    private getMobilities(state: SaharaState, player: Player): number[] {
        const mobilities: number[] = [];
        for (const coord of state.allCoords()) {
            if (state.hasPieceBelongingTo(coord, player)) {
                mobilities.push(this.countMovesToClosestAlly(state, coord));
            }
        }
        ArrayUtils.sortByDescending(mobilities, (mobility: number) => mobility);
        return mobilities;
    }

    public countMovesToClosestAlly(state: SaharaState, coord: Coord): number {
        let exploredCoords: CoordSet = new CoordSet([coord]);
        let newWaveOfNeighbors: CoordSet = this.getLandingCoords(state, new CoordSet([coord]));
        let depth: number = 1;
        while (newWaveOfNeighbors.size() > 0) {
            const numberOfAllies: CoordSet = newWaveOfNeighbors.filter(
                (c: Coord) => state.getPieceAt(c).equals(state.getPieceAt(coord)),
            );
            const emptyNeighbors: CoordSet = newWaveOfNeighbors.filter(
                (c: Coord) => state.getPieceAt(c).equals(FourStatePiece.EMPTY),
            );
            if (numberOfAllies.size() > 0) {
                return depth;
            } else if (emptyNeighbors.size() === 0) {
                newWaveOfNeighbors = new CoordSet();
            } else {
                exploredCoords = exploredCoords.union(emptyNeighbors);
                newWaveOfNeighbors = this.getLandingCoords(state, emptyNeighbors);
                newWaveOfNeighbors = newWaveOfNeighbors.filter((c: Coord) => exploredCoords.contains(c) === false);
                depth++;
            }
        }
        return Number.POSITIVE_INFINITY;
    }

    private getLandingCoords(state: SaharaState, coords: CoordSet): CoordSet {
        let neighboringCoords: CoordSet = new CoordSet();
        for (const currentCoord of coords) {
            const neighbors: Coord[] = this.rules.getValidLandingCoords(state, currentCoord);
            for (const neighbor of neighbors) {
                if (coords.contains(neighbor) === false) {
                    neighboringCoords = neighboringCoords.addElement(neighbor);
                }
            }
        }
        return neighboringCoords;
    }

}
