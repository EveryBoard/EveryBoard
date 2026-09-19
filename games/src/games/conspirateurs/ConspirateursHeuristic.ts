import { EmptyRulesConfig } from '../../config/RulesConfig';
import { PlayerMetricHeuristic } from '../../jscaip/AI/PlayerMetricHeuristic';
import { Coord } from '../../jscaip/Coord';
import { Player } from '../../jscaip/Player';
import { PlayerNumberTable } from '../../jscaip/PlayerNumberTable';

import { ConspirateursMove } from './ConspirateursMove';
import { ConspirateursNode } from './ConspirateursRules';
import { ConspirateursState } from './ConspirateursState';

export class ConspirateursHeuristic extends PlayerMetricHeuristic<ConspirateursMove, ConspirateursState> {

    public override getMetrics(node: ConspirateursNode, _config: EmptyRulesConfig): PlayerNumberTable {
        const state: ConspirateursState = node.gameState;
        const scores: PlayerNumberTable = PlayerNumberTable.of([0, 0], [0, 0]);
        const shelterCountIndex: number = 0;
        const distanceCountIndex: number = 1;
        for (const coordAndContent of state.getPlayerCoordsAndContent()) {
            const coord: Coord = coordAndContent.coord;
            const player: Player = coordAndContent.content;
            if (state.isShelter(coord)) {
                scores.add(player, shelterCountIndex, 1);
            } else {
                let minEmptyShelterDistance: number = state.getWidth() + state.getHeight();
                // start as the maximum distance possible
                for (const shelter of ConspirateursState.ALL_SHELTERS) {
                    if (state.getPieceAt(shelter).isNone()) {
                        const distance: number = coord.getOrthogonalDistance(shelter);
                        minEmptyShelterDistance = Math.min(minEmptyShelterDistance, distance);
                    }
                }
                scores.add(player, distanceCountIndex, - minEmptyShelterDistance);
            }
        }
        return scores;
    }

}
