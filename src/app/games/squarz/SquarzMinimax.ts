import { Minimax } from '../../jscaip/AI/Minimax';
import { SquarzHeuristic } from './SquarzHeuristic';
import { SquarzMove } from './SquarzMove';
import { SquarzMoveGenerator } from './SquarzMoveGenerator';
import { SquarzConfig, SquarzRules } from './SquarzRules';
import { SquarzState } from './SquarzState';

export class SquarzMinimax extends Minimax<SquarzMove, SquarzState, SquarzConfig> {

    public constructor() {
        const rules: SquarzRules = SquarzRules.get();
        super('Score', rules, new SquarzHeuristic(), new SquarzMoveGenerator(rules));
    }
}
