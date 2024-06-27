import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { HexodiaMove } from './HexodiaMove';
import { HexodiaState } from './HexodiaState';
import { HexodiaConfig, HexodiaRules } from './HexodiaRules';
import { HexodiaAlignmentHeuristic } from './HexodiaAlignmentHeuristic';
import { HexodiaMoveGenerator } from './HexodiaMoveGenerator';

export class HexodiaAlignmentMinimax extends Minimax<HexodiaMove, HexodiaState, HexodiaConfig> {

    public constructor() {
        super($localize`Alignment`,
              HexodiaRules.get(),
              new HexodiaAlignmentHeuristic(),
              new HexodiaMoveGenerator(),
        );
    }

}
