import { EmptyRulesConfig } from '../../config/RulesConfig';
import { FourStatePiece } from '../../jscaip/FourStatePiece';
import { Player } from '../../jscaip/Player';
import { PlayerNumberTable } from '../../jscaip/PlayerNumberTable';
import { TriangularGameState } from '../../jscaip/state/TriangularGameState';

import { SaharaMobilityHeuristic } from './SaharaMobilityHeuristic';
import { SaharaNode } from './SaharaRules';
import { SaharaState } from './SaharaState';

export class SaharaCapturedThenCapturedFreedomThenAllFreedomsHeuristic
    extends SaharaMobilityHeuristic
{

    public override getMetrics(node: SaharaNode, _config: EmptyRulesConfig): PlayerNumberTable {
        const capturedAndFreedomForZero: { captured: boolean; freedoms: number } =
            this.getCapturedAndFreedom(node.gameState, Player.ZERO);
        const capturedAndFreedomForOne: { captured: boolean; freedoms: number } =
            this.getCapturedAndFreedom(node.gameState, Player.ONE);
        const zeroFreedoms: number[] = this.rules.getBoardValuesFor(node.gameState, Player.ZERO);
        const oneFreedoms: number[] = this.rules.getBoardValuesFor(node.gameState, Player.ONE);
        // 1st criterion: having a prisonner is good
        // 2nd criterion: having that prisonner piece have less freedoms as possible
        // 3rd criterion: having yourself, the more freedoms
        return PlayerNumberTable.of(
            [capturedAndFreedomForOne.captured ? 1 : 0, - capturedAndFreedomForOne.freedoms, ...zeroFreedoms],
            [capturedAndFreedomForZero.captured ? 1 : 0, - capturedAndFreedomForZero.freedoms, ...oneFreedoms],
        );
    }

    private getCapturedAndFreedom(state: SaharaState, player: Player): { captured: boolean; freedoms: number } {
        for (const coord of state.allCoords()) {
            if (state.hasPieceBelongingTo(coord, player)) {
                if (this.countMovesToClosestAlly(state, coord) === Number.POSITIVE_INFINITY) {
                    const freedoms: number =
                         TriangularGameState.getEmptyNeighbors(state.board, coord, FourStatePiece.EMPTY).length;
                    return { captured: true, freedoms };
                }
            }
        }
        return { captured: false, freedoms: 0 };
    }

}
