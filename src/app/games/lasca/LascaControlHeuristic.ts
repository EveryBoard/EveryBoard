import { Coord } from 'src/app/jscaip/Coord';
import { PlayerMetricHeuristic } from 'src/app/jscaip/Minimax';
import { Player } from 'src/app/jscaip/Player';
import { MGPSet } from 'src/app/utils/MGPSet';
import { LascaMove } from './LascaMove';
import { LascaNode, LascaRules } from './LascaRules';
import { LascaState } from './LascaState';

export class LascaControlHeuristic extends PlayerMetricHeuristic<LascaMove, LascaState> {

    public getMetrics(node: LascaNode): [number, number] {
        const state: LascaState = node.gameState;
        const pieceUnderZeroControl: number = this.getNumberOfMobileCoords(state, Player.ZERO);
        const pieceUnderOneControl: number = this.getNumberOfMobileCoords(state, Player.ONE);
        return [pieceUnderZeroControl, pieceUnderOneControl];
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