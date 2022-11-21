import { BoardValue } from 'src/app/jscaip/BoardValue';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Minimax } from 'src/app/jscaip/Minimax';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus } from 'src/app/jscaip/Rules';
import { MGPSet } from 'src/app/utils/MGPSet';
import { LascaMove } from './LascaMove';
import { LascaRules } from './LascaRules';
import { LascaState } from './LascaState';

class LascaNode extends MGPNode<LascaRules, LascaMove, LascaState> {}

export class LascaControlMinimax extends Minimax<LascaMove, LascaState> {

    public getListMoves(node: LascaNode): LascaMove[] {
        const possiblesCaptures: LascaMove[] = LascaRules.getCaptures(node.gameState);
        if (possiblesCaptures.length > 0) {
            return possiblesCaptures;
        } else {
            return LascaRules.getSteps(node.gameState);
        }
    }
    public getBoardValue(node: LascaNode): BoardValue {
        const gameStatus: GameStatus = this.ruler.getGameStatus(node);
        if (gameStatus.isEndGame) {
            return new BoardValue(gameStatus.toBoardValue());
        }
        const state: LascaState = node.gameState;
        const pieceUnderZeroControl: number = this.getNumberOfMobileCoords(state, Player.ZERO);
        const pieceUnderOneControl: number = this.getNumberOfMobileCoords(state, Player.ONE);
        return new BoardValue(pieceUnderOneControl - pieceUnderZeroControl);
    }
    public getNumberOfMobileCoords(state: LascaState, player: Player): number {
        const potentialMoves: LascaMove[] = this.getCapturesAndSteps(state, player);
        const firstCoords: Coord[] = potentialMoves.map((move: LascaMove) => move.getCoord(0).get());
        const uniqueFirstCoords: MGPSet<Coord> = new MGPSet(firstCoords);
        return uniqueFirstCoords.size();
    }
    public getCapturesAndSteps(state: LascaState, player: Player): LascaMove[] {
        if (state.getCurrentOpponent() === player) {
            return this.getCapturesAndSteps(state.incrementTurn(), player);
        }
        const captures: LascaMove[] = LascaRules.getCaptures(state);
        const steps: LascaMove[] = LascaRules.getSteps(state);
        return captures.concat(steps);
    }
}
