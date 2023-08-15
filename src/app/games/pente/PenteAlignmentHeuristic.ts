import { BoardValue } from 'src/app/jscaip/BoardValue';
import { Heuristic } from 'src/app/jscaip/Minimax';
import { PenteMove } from './PenteMove';
import { PenteNode, PenteRules } from './PenteRules';
import { PenteState } from './PenteState';

export class PenteAlignmentHeuristic extends Heuristic<PenteMove, PenteState> {

    public getBoardValue(node: PenteNode): BoardValue {
        return PenteRules.PENTE_HELPER.getBoardValue(node.gameState);
    }
}