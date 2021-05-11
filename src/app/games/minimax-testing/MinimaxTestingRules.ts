import { Rules } from 'src/app/jscaip/Rules';
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
    public isLegal(move: MinimaxTestingMove): LegalityStatus {
        const slice: MinimaxTestingPartSlice = this.node.gamePartSlice;
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
    public isGameOver(state: MinimaxTestingPartSlice): boolean {
        const currentValue: number = state.getBoardAt(state.location);
        const isGameOver: boolean = currentValue === Player.ZERO.getVictoryValue() ||
                                    currentValue === Player.ONE.getVictoryValue() ||
                                    state.location.equals(new Coord(3, 3));
        return isGameOver;
    }
}
