import { BoardValue } from '@everyboard/games';
import { Heuristic } from '@everyboard/games';

import { EpaminondasMove } from './EpaminondasMove';
import { EpaminondasConfig } from './EpaminondasRules';
import { EpaminondasState } from './EpaminondasState';

export abstract class EpaminondasHeuristic extends Heuristic<EpaminondasMove,
                                                             EpaminondasState,
                                                             BoardValue,
                                                             EpaminondasConfig>
{
}
