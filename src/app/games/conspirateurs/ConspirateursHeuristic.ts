import { Coord } from 'src/app/jscaip/Coord';
import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { PlayerNumberTable } from 'src/app/jscaip/PlayerNumberTable';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { ConspirateursMove } from './ConspirateursMove';
import { ConspirateursNode } from './ConspirateursRules';
import { ConspirateursState } from './ConspirateursState';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

export class ConspirateursHeuristic extends PlayerMetricHeuristic<ConspirateursMove, ConspirateursState> {

    public override getMetrics(node: ConspirateursNode, _config: NoConfig): PlayerNumberTable {
        const state: ConspirateursState = node.gameState;
        const scores: PlayerNumberTable = PlayerNumberTable.of([0, 0], [0, 0]);
        const shelterCountIndex: number = 0;
        const distanceCountIndex: number = 1;
        for (const coordAndContent of state.getPlayerCoordsAndContent()) {
            const coord: Coord = coordAndContent.coord;
            const player: PlayerOrNone = coordAndContent.content;
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
