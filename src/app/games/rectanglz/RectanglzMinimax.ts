import { DummyHeuristic, Minimax } from 'src/app/jscaip/AI/Minimax';
import { RectanglzMoveGenerator } from './RectanglzMoveGenerator';
import { RectanglzMove } from './RectanglzMove';
import { RectanglzState } from './RectanglzState';
import { RectanglzRules } from './RectanglzRules';

/**
 * This is the minimax AI.
 * You can plug in the heuristic and move generator.
 */
export class RectanglzMinimax extends Minimax<RectanglzMove, RectanglzState> {

    public constructor() {
        super('Dummy',
              RectanglzRules.get(),
              new DummyHeuristic(),
              new RectanglzMoveGenerator(),
        );
    }
}
