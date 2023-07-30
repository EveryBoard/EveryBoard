import { BoardValue } from 'src/app/jscaip/BoardValue';
import { Coord } from 'src/app/jscaip/Coord';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { MoveGenerator } from 'src/app/jscaip/MGPNode';
import { Heuristic, Minimax } from 'src/app/jscaip/Minimax';
import { Player } from 'src/app/jscaip/Player';
import { MGPSet } from 'src/app/utils/MGPSet';
import { LascaMove } from './LascaMove';
import { LascaNode, LascaRules } from './LascaRules';
import { LascaState } from './LascaState';

export class LascaMoveGenerator extends MoveGenerator<LascaMove, LascaState> {

    public getListMoves(node: LascaNode): LascaMove[] {
        const possiblesCaptures: LascaMove[] = LascaRules.get().getCaptures(node.gameState);
        if (possiblesCaptures.length > 0) {
            return possiblesCaptures;
        } else {
            return LascaRules.get().getSteps(node.gameState);
        }
    }
}

export class LascaControlHeuristic extends Heuristic<LascaMove, LascaState> {

    public getBoardValue(node: LascaNode): BoardValue {
        // TODO: get rid of these checks
        const gameStatus: GameStatus = LascaRules.get().getGameStatus(node);
        if (gameStatus.isEndGame) {
            return gameStatus.toBoardValue();
        }
        const state: LascaState = node.gameState;
        const pieceUnderZeroControl: number = this.getNumberOfMobileCoords(state, Player.ZERO);
        const pieceUnderOneControl: number = this.getNumberOfMobileCoords(state, Player.ONE);
        // TODO: this is a player metric heuristic
        return BoardValue.from(pieceUnderZeroControl, pieceUnderOneControl);
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

export class LascaControlMinimax extends Minimax<LascaMove, LascaState> {

    public constructor() {
        super('LascaControlMinimax', LascaRules.get(), new LascaControlHeuristic(), new LascaMoveGenerator());
    }
}
