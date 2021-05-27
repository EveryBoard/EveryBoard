import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { MinimaxTestingPartSlice } from './MinimaxTestingPartSlice';
import { MinimaxTestingMove } from './MinimaxTestingMove';
import { Coord } from 'src/app/jscaip/Coord';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Player } from 'src/app/jscaip/Player';

export abstract class MinimaxTestingNode extends MGPNode<MinimaxTestingRules,
                                                         MinimaxTestingMove,
                                                         MinimaxTestingPartSlice> {}

export class MinimaxTestingRules extends Rules<MinimaxTestingMove, MinimaxTestingPartSlice> {

    public applyLegalMove(move: MinimaxTestingMove,
                          slice: MinimaxTestingPartSlice,
                          status: LegalityStatus)
    : MinimaxTestingPartSlice
    {
        const newX: number = slice.location.x + (move.right === true ? 1 : 0);
        const newY: number = slice.location.y + (move.right === false ? 1 : 0);
        const newLocation: Coord = new Coord(newX, newY);
        return new MinimaxTestingPartSlice(slice.turn + 1, newLocation);
    }
    public isLegal(move: MinimaxTestingMove, slice: MinimaxTestingPartSlice): LegalityStatus {
        const coord: Coord = slice.location;
        const board: number[][] = slice.getCopiedBoard();
        if (coord.x + 1 === board[0].length && move.right === true) {
            return { legal: MGPValidation.failure('incorrect move') };
        }
        if (coord.y + 1 === board.length && move.right === false) {
            return { legal: MGPValidation.failure('incorrect move') };
        }
        return { legal: MGPValidation.SUCCESS };
    }
    public getGameStatus(node: MinimaxTestingNode): GameStatus {
        const state: MinimaxTestingPartSlice = node.gamePartSlice;
        const currentValue: number = state.getBoardAt(state.location);
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
}
