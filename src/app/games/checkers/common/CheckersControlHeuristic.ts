import { MGPOptional } from '@everyboard/lib';

import { PlayerMetricHeuristic } from '../../../jscaip/AI/Minimax';
import { Coord } from '../../../jscaip/Coord';
import { CoordSet } from '../../../jscaip/CoordSet';
import { Player } from '../../../jscaip/Player';
import { PlayerNumberTable } from '../../../jscaip/PlayerNumberTable';
import { AbstractCheckersRules, CheckersConfig, CheckersNode } from './AbstractCheckersRules';
import { CheckersMove } from './CheckersMove';
import { CheckersState } from './CheckersState';

export class CheckersControlHeuristic extends PlayerMetricHeuristic<CheckersMove, CheckersState, CheckersConfig> {

    public constructor(private readonly rules: AbstractCheckersRules) {
        super();
    }

    public override getMetrics(node: CheckersNode, config: MGPOptional<CheckersConfig>): PlayerNumberTable {
        return this.getControlScore(node, config.get());
    }

    protected getControlScore(node: CheckersNode, config: CheckersConfig): PlayerNumberTable {
        const state: CheckersState = node.gameState;
        const controlScores: PlayerNumberTable = PlayerNumberTable.of([0], [0]);
        for (const player of Player.PLAYERS) {
            const numberOfMobileCoords: number = this.getNumberOfMobileCoords(state, player, config);
            controlScores.add(player, 0, numberOfMobileCoords);
        }
        return controlScores;
    }

    public getNumberOfMobileCoords(state: CheckersState, player: Player, config: CheckersConfig): number {
        const potentialMoves: CheckersMove[] = this.getCapturesAndSteps(state, player, config);
        const firstCoords: Coord[] = potentialMoves.map((move: CheckersMove) => move.getStartingCoord());
        const uniqueFirstCoords: CoordSet = new CoordSet(firstCoords);
        return uniqueFirstCoords.size();
    }

    public getCapturesAndSteps(state: CheckersState, player: Player, config: CheckersConfig): CheckersMove[] {
        const captures: CheckersMove[] = this.rules.getCapturesOf(state, player, config);
        const steps: CheckersMove[] = this.rules.getStepsOf(state, player, config);
        return captures.concat(steps);
    }

}
