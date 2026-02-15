import { Minimax } from '../../jscaip/AI/Minimax';
import { HexodiaAlignmentHeuristic } from './HexodiaAlignmentHeuristic';
import { HexodiaMove } from './HexodiaMove';
import { HexodiaMoveGenerator } from './HexodiaMoveGenerator';
import { HexodiaConfig, HexodiaRules } from './HexodiaRules';
import { HexodiaState } from './HexodiaState';

export class HexodiaAlignmentMinimax extends Minimax<HexodiaMove, HexodiaState, HexodiaConfig> {

    public constructor() {
        super($localize`Alignment`,
              HexodiaRules.get(),
              new HexodiaAlignmentHeuristic(),
              new HexodiaMoveGenerator(),
        );
    }

}
