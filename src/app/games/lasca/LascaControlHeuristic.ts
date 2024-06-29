import { Coord } from 'src/app/jscaip/Coord';
import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { PlayerNumberTable } from 'src/app/jscaip/PlayerNumberTable';
import { Player } from 'src/app/jscaip/Player';
import { CoordSet } from 'src/app/jscaip/CoordSet';
import { LascaMove } from './LascaMove';
import { LascaNode, LascaRules } from './LascaRules';
import { LascaState } from './LascaState';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

export class LascaControlHeuristic extends PlayerMetricHeuristic<LascaMove, LascaState> {

    public override getMetrics(node: LascaNode, _config: NoConfig): PlayerNumberTable {
        return this.getControlScore(node);
    }

    protected getControlScore(node: LascaNode): PlayerNumberTable {
        const state: LascaState = node.gameState;
        const controlScores: PlayerNumberTable = PlayerNumberTable.of([0], [0]);
        for (const player of Player.PLAYERS) {
            controlScores.add(player, 0, this.getNumberOfMobileCoords(state, player));
        }
        return controlScores;
    }

    public getNumberOfMobileCoords(state: LascaState, player: Player): number {
        const potentialMoves: LascaMove[] = this.getCapturesAndSteps(state, player);
        const firstCoords: Coord[] = potentialMoves.map((move: LascaMove) => move.getStartingCoord());
        const uniqueFirstCoords: CoordSet = new CoordSet(firstCoords);
        return uniqueFirstCoords.size();
    }

    public getCapturesAndSteps(state: LascaState, player: Player): LascaMove[] {
        const captures: LascaMove[] = LascaRules.get().getCapturesOf(state, player);
        const steps: LascaMove[] = LascaRules.get().getStepsOf(state, player);
        return captures.concat(steps);
    }

}
