import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { RectanglzMoveGenerator } from './RectanglzMoveGenerator';
import { RectanglzMove } from './RectanglzMove';
import { RectanglzState } from './RectanglzState';
import { RectanglzConfig, RectanglzRules } from './RectanglzRules';
import { RectanglzHeuristic } from './RectanglzHeuristic';

export class RectanglzMinimax extends Minimax<RectanglzMove, RectanglzState, RectanglzConfig> {

    public constructor() {
        super('Dummy',
              RectanglzRules.get(),
              new RectanglzHeuristic(),
              new RectanglzMoveGenerator(),
        );
    }
}
