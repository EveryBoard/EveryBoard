import { Heuristic } from '../../jscaip/AI/Minimax';
import { EpaminondasMove } from './EpaminondasMove';
import { EpaminondasState } from './EpaminondasState';
import { BoardValue } from '../../jscaip/AI/BoardValue';
import { EpaminondasConfig } from './EpaminondasRules';

export abstract class EpaminondasHeuristic extends Heuristic<EpaminondasMove,
                                                             EpaminondasState,
                                                             BoardValue,
                                                             EpaminondasConfig>
{
}
