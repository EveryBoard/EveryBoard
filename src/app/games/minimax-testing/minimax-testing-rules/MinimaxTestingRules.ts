import { Rules } from 'src/app/jscaip/Rules';
import { MGPNode } from 'src/app/jscaip/mgp-node/MGPNode';
import { MGPMap } from 'src/app/utils/mgp-map/MGPMap';
import { MinimaxTestingPartSlice } from '../MinimaxTestingPartSlice';
import { MinimaxTestingMove } from '../minimax-testing-move/MinimaxTestingMove';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';

abstract class MinimaxTestingNode extends MGPNode<MinimaxTestingRules, MinimaxTestingMove, MinimaxTestingPartSlice, LegalityStatus> {}

export class MinimaxTestingRules extends Rules<MinimaxTestingMove, MinimaxTestingPartSlice, LegalityStatus> {
    public static GET_BOARD_VALUE_CALL_COUNT = 0;

    public static GET_LIST_MOVES_CALL_COUNT = 0;

    public applyLegalMove(move: MinimaxTestingMove, slice: MinimaxTestingPartSlice, status: LegalityStatus): { resultingMove: MinimaxTestingMove; resultingSlice: MinimaxTestingPartSlice; } {
        const newX: number = slice.location.x + (move.right === true ? 1 : 0);
        const newY: number = slice.location.y + (move.right === false ? 1 : 0);
        const newLocation: Coord = new Coord(newX, newY);
        return {
            resultingSlice: new MinimaxTestingPartSlice(slice.turn + 1, newLocation),
            resultingMove: move,
        };
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
    public getBoardValue(move: MinimaxTestingMove, slice: MinimaxTestingPartSlice): number {
        MinimaxTestingRules.GET_BOARD_VALUE_CALL_COUNT++;
        return slice.getBoardAt(slice.location);
    }
    public getListMoves(n: MinimaxTestingNode): MGPMap<MinimaxTestingMove, MinimaxTestingPartSlice> {
        MinimaxTestingRules.GET_LIST_MOVES_CALL_COUNT++;
        const result: MGPMap<MinimaxTestingMove, MinimaxTestingPartSlice> =
            new MGPMap<MinimaxTestingMove, MinimaxTestingPartSlice>();
        const slice: MinimaxTestingPartSlice = n.gamePartSlice;
        const LEGAL: LegalityStatus = { legal: MGPValidation.SUCCESS };
        if (slice.location.x < 3) {
            const rightMove: MinimaxTestingMove = MinimaxTestingMove.RIGHT;
            const rightSlice: MinimaxTestingPartSlice = this.applyLegalMove(rightMove, slice, LEGAL).resultingSlice;
            result.set(rightMove, rightSlice);
        }
        if (slice.location.y < 3) {
            const downMove: MinimaxTestingMove = MinimaxTestingMove.DOWN;
            const downSlice: MinimaxTestingPartSlice = this.applyLegalMove(downMove, slice, LEGAL).resultingSlice;
            result.set(downMove, downSlice);
        }
        return result;
    }
}
