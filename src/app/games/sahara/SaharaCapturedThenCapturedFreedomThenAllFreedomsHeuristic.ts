import { PlayerMetricHeuristic } from '../../jscaip/AI/Minimax';
import { Coord } from '../../jscaip/Coord';
import { CoordSet } from '../../jscaip/CoordSet';
import { FourStatePiece } from '../../jscaip/FourStatePiece';
import { Player } from '../../jscaip/Player';
import { PlayerNumberTable } from '../../jscaip/PlayerNumberTable';
import { NoConfig } from '../../jscaip/RulesConfigUtil';
import { TriangularGameState } from '../../jscaip/state/TriangularGameState';

import { SaharaMove } from './SaharaMove';
import { SaharaNode, SaharaRules } from './SaharaRules';
import { SaharaState } from './SaharaState';

export class SaharaCapturedThenCapturedFreedomThenAllFreedomsHeuristic
    extends PlayerMetricHeuristic<SaharaMove, SaharaState>
{

    public override getMetrics(node: SaharaNode, _config: NoConfig): PlayerNumberTable {
        const capturedAndFreedomForZero: { captured: boolean, freedoms: number } =
            this.getCapturedAndFreedom(node.gameState, Player.ZERO);
        const capturedAndFreedomForOne: { captured: boolean, freedoms: number } =
            this.getCapturedAndFreedom(node.gameState, Player.ONE);
        const zeroFreedoms: number[] = SaharaRules.getBoardValuesFor(node.gameState, Player.ZERO);
        const oneFreedoms: number[] = SaharaRules.getBoardValuesFor(node.gameState, Player.ONE);
        return PlayerNumberTable.of(
            [capturedAndFreedomForOne.captured ? 1 : 0, - capturedAndFreedomForOne.freedoms, ...zeroFreedoms],
            [capturedAndFreedomForZero.captured ? 1 : 0, - capturedAndFreedomForZero.freedoms, ...oneFreedoms],
        );
    }

    private getCapturedAndFreedom(state: SaharaState, player: Player): { captured: boolean, freedoms: number } {
        for (const coord of state.allCoords()) {
            if (state.hasPieceBelongingTo(coord, player)) {
                if (this.countMoveToClosestAlly(state, coord) === Number.MAX_SAFE_INTEGER) {
                    const freedoms: number =
                         TriangularGameState.getEmptyNeighbors(state.board, coord, FourStatePiece.EMPTY).length;
                    return { captured: true, freedoms };
                }
            }
        }
        return { captured: false, freedoms: 0 };
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
        return Number.MAX_SAFE_INTEGER;
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
