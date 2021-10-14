import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { MinimaxTestingState } from './MinimaxTestingState';
import { MinimaxTestingMove } from './MinimaxTestingMove';
import { Coord } from 'src/app/jscaip/Coord';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { Player } from 'src/app/jscaip/Player';

export abstract class MinimaxTestingNode extends MGPNode<MinimaxTestingRules,
                                                         MinimaxTestingMove,
                                                         MinimaxTestingState> {}

export class MinimaxTestingRules extends Rules<MinimaxTestingMove, MinimaxTestingState> {

    public static getGameStatus(node: MinimaxTestingNode): GameStatus {
        const state: MinimaxTestingState = node.gameState;
        const currentValue: number = state.getPieceAt(state.location);
        if (currentValue === Player.ZERO.getVictoryValue()) {
            return GameStatus.ZERO_WON;
        }
        if (currentValue === Player.ONE.getVictoryValue()) {
            return GameStatus.ONE_WON;
        }
        if (state.location.equals(new Coord(3, 3))) {
            if (currentValue === 0) {
                return GameStatus.DRAW;
            } else if (currentValue > 0) {
                return GameStatus.ONE_WON;
            } else {
                return GameStatus.ZERO_WON;
            }
        }
        return GameStatus.ONGOING;
    }
    public applyLegalMove(move: MinimaxTestingMove,
                          state: MinimaxTestingState,
                          _status: LegalityStatus)
    : MinimaxTestingState
    {
        const newX: number = state.location.x + (move.right === true ? 1 : 0);
        const newY: number = state.location.y + (move.right === false ? 1 : 0);
        const newLocation: Coord = new Coord(newX, newY);
        return new MinimaxTestingState(state.turn + 1, newLocation);
    }
    public isLegal(move: MinimaxTestingMove, state: MinimaxTestingState): LegalityStatus {
        const coord: Coord = state.location;
        const board: number[][] = state.getCopiedBoard();
        if (coord.x + 1 === board[0].length && move.right === true) {
            return LegalityStatus.failure('incorrect move');
        }
        if (coord.y + 1 === board.length && move.right === false) {
            return LegalityStatus.failure('incorrect move');
        }
        return LegalityStatus.SUCCESS;
    }
    public getGameStatus(node: MinimaxTestingNode): GameStatus {
        return MinimaxTestingRules.getGameStatus(node);
    }
}
