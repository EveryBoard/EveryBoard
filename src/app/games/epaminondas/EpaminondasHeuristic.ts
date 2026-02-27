import { BoardValue } from '../../jscaip/AI/BoardValue';
import { Heuristic } from '../../jscaip/AI/Minimax';

import { EpaminondasMove } from './EpaminondasMove';
import { EpaminondasConfig } from './EpaminondasRules';
import { EpaminondasState } from './EpaminondasState';

export abstract class EpaminondasHeuristic extends Heuristic<EpaminondasMove,
                                                             EpaminondasState,
                                                             BoardValue,
                                                             EpaminondasConfig>
{
}
