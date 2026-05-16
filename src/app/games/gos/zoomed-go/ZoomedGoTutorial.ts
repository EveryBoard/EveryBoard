// import { MGPOptional } from '@everyboard/lib';

import { Tutorial, TutorialStep } from '../../../components/wrapper-components/tutorial-game-wrapper/TutorialStep';
// import { TutorialStepMessage } from '../../../components/wrapper-components/tutorial-game-wrapper/TutorialStepMessage';
// import { PlayerNumberMap } from '../../../jscaip/PlayerMap';
// import { GoMove } from '../GoMove';
// import { GoPhase } from '../GoPhase';
// import { GoPiece } from '../GoPiece';
// import { GoState } from '../GoState';
import { RectangularGoConfig } from '../abstract-rectangular-go/AbstractRectangularGoRules';
import { GoRules } from '../go/GoRules';

import { ZoomedGoRules } from './ZoomedGoRules';


// const X: GoPiece = GoPiece.LIGHT;
// const O: GoPiece = GoPiece.DARK;
// const k: GoPiece = GoPiece.DEAD_LIGHT;
// const w: GoPiece = GoPiece.LIGHT_TERRITORY;
// const b: GoPiece = GoPiece.DARK_TERRITORY;
// const _: GoPiece = GoPiece.EMPTY;

const defaultConfig: RectangularGoConfig = ZoomedGoRules.get().getDefaultRulesConfig();

export class ZoomedGoTutorial extends Tutorial {

    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            $localize`Preliminary information`,
            $localize`BAH CA VA C'EST PAS SI COMPLIQUÉ SI ?`,
            GoRules.get().getInitialState(defaultConfig),
        ),
    ];
}
