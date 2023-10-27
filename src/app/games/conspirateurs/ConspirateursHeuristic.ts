import { Coord } from 'src/app/jscaip/Coord';
import { PlayerMetricHeuristic } from 'src/app/jscaip/Minimax';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { ConspirateursMove } from './ConspirateursMove';
import { ConspirateursNode } from './ConspirateursRules';
import { ConspirateursState } from './ConspirateursState';

export class ConspirateursHeuristic extends PlayerMetricHeuristic<ConspirateursMove, ConspirateursState> {

    public getMetrics(node: ConspirateursNode): [number, number] {
        const state: ConspirateursState = node.gameState;
        const scores: [number, number] = [0, 0];
        for (let y: number = 0; y < ConspirateursState.HEIGHT; y++) {
            for (let x: number = 0; x < ConspirateursState.WIDTH; x++) {
                const coord: Coord = new Coord(x, y);
                const player: PlayerOrNone = state.getPieceAt(coord);
                if (player.isPlayer()) {
                    if (state.isShelter(coord)) {
                        scores[player.getValue()] += 20;
                    } else {
                        let minEmptyShelterDistance: number = 100;
                        for (const shelter of ConspirateursState.ALL_SHELTERS) {
                            if (state.getPieceAt(shelter) === PlayerOrNone.NONE) {
                                const distance: number = coord.getOrthogonalDistance(shelter);
                                minEmptyShelterDistance = Math.min(minEmptyShelterDistance, distance);
                            }
                        }
                        scores[player.getValue()] -= minEmptyShelterDistance;
                    }
                }
            }
        }
        return scores;
    }
}
