import { BoardValue } from 'src/app/jscaip/AI/BoardValue';
import { Heuristic } from 'src/app/jscaip/AI/Minimax';
import { PenteMove } from './PenteMove';
import { PenteNode, PenteRules } from './PenteRules';
import { PenteState } from './PenteState';
import { GobanConfig } from 'src/app/jscaip/GobanConfig';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export class PenteAlignmentHeuristic extends Heuristic<PenteMove, PenteState, BoardValue, GobanConfig> {

    public getBoardValue(node: PenteNode, _config: MGPOptional<GobanConfig>): BoardValue {
        return PenteRules.PENTE_HELPER.getBoardValue(node.gameState);
    }

}
