import { BoardValue } from 'src/app/jscaip/BoardValue';
import { Heuristic } from 'src/app/jscaip/Minimax';
import { SiamMove } from './SiamMove';
import { SiamNode, SiamRules } from './SiamRules';
import { SiamState } from './SiamState';

export class SiamHeuristic extends Heuristic<SiamMove, SiamState> {

    public getBoardValue(node: SiamNode): BoardValue {
        const boardValueInfo: { shortestZero: number, shortestOne: number, boardValue: number } =
            SiamRules.get().getBoardValueInfo(node.previousMove, node.gameState);
        return new BoardValue(boardValueInfo.boardValue);
    }
}
