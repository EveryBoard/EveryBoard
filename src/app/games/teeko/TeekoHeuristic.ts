import { Heuristic } from 'src/app/jscaip/AI/Minimax';
import { TeekoMove } from './TeekoMove';
import { TeekoState } from './TeekoState';
import { BoardValue } from 'src/app/jscaip/AI/BoardValue';
import { TeekoConfig } from './TeekoRules';

export abstract class TeekoHeuristic extends Heuristic<TeekoMove,
                                                       TeekoState,
                                                       BoardValue,
                                                       TeekoConfig>
{
}
