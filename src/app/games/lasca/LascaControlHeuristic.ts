import { Coord } from 'src/app/jscaip/Coord';
import { Heuristic } from 'src/app/jscaip/AI/Minimax';
import { Player } from 'src/app/jscaip/Player';
import { MGPSet } from 'src/app/utils/MGPSet';
import { LascaMove } from './LascaMove';
import { LascaNode, LascaRules } from './LascaRules';
import { LascaState } from './LascaState';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { EmptyRulesConfig } from 'src/app/jscaip/RulesConfigUtil';
import { BoardValue } from 'src/app/jscaip/AI/BoardValue';

export class LascaControlHeuristic extends Heuristic<LascaMove, LascaState> {

    public override getBoardValue(node: LascaNode, config: MGPOptional<EmptyRulesConfig>): BoardValue {
        const controlScore: number = this.getControlScore(node, config);
        return BoardValue.of(controlScore);
    }

    protected getControlScore(node: LascaNode, _config: MGPOptional<EmptyRulesConfig>): number {
        const state: LascaState = node.gameState;
        let controlScore: number = 0;
        for (const player of Player.PLAYERS) {
            controlScore += player.getScoreModifier() * this.getNumberOfMobileCoords(state, player);
        }
        return controlScore;
    }

    public getNumberOfMobileCoords(state: LascaState, player: Player): number {
        const potentialMoves: LascaMove[] = this.getCapturesAndSteps(state, player);
        const firstCoords: Coord[] = potentialMoves.map((move: LascaMove) => move.getStartingCoord());
        const uniqueFirstCoords: MGPSet<Coord> = new MGPSet(firstCoords);
        return uniqueFirstCoords.size();
    }

    public getCapturesAndSteps(state: LascaState, player: Player): LascaMove[] {
        const captures: LascaMove[] = LascaRules.get().getCapturesOf(state, player);
        const steps: LascaMove[] = LascaRules.get().getStepsOf(state, player);
        return captures.concat(steps);
    }
}
