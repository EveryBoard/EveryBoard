import { Coord } from 'src/app/jscaip/Coord';
import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { ConspirateursMove } from './ConspirateursMove';
import { ConspirateursNode } from './ConspirateursRules';
import { ConspirateursState } from './ConspirateursState';
import { MGPMap } from 'src/app/utils/MGPMap';

export class ConspirateursHeuristic extends PlayerMetricHeuristic<ConspirateursMove, ConspirateursState> {

    public getMetrics(node: ConspirateursNode): MGPMap<Player, ReadonlyArray<number>> {
        const state: ConspirateursState = node.gameState;
        const scores: MGPMap<Player, ReadonlyArray<number>> = new MGPMap<Player, ReadonlyArray<number>>([
            { key: Player.ZERO, value: [0] },
            { key: Player.ONE, value: [0] },
        ]);
        for (let y: number = 0; y < ConspirateursState.HEIGHT; y++) {
            for (let x: number = 0; x < ConspirateursState.WIDTH; x++) {
                const coord: Coord = new Coord(x, y);
                const player: PlayerOrNone = state.getPieceAt(coord);
                if (player.isPlayer()) {
                    const oldValue: number = scores.get(player).get()[0];
                    if (state.isShelter(coord)) {
                        scores.replace(player, [oldValue + 20]);
                    } else {
                        let minEmptyShelterDistance: number = 100;
                        for (const shelter of ConspirateursState.ALL_SHELTERS) {
                            if (state.getPieceAt(shelter) === PlayerOrNone.NONE) {
                                const distance: number = coord.getOrthogonalDistance(shelter);
                                minEmptyShelterDistance = Math.min(minEmptyShelterDistance, distance);
                            }
                        }
                        scores.replace(player, [oldValue - minEmptyShelterDistance]);
                    }
                }
            }
        }
        return scores;
    }

}
