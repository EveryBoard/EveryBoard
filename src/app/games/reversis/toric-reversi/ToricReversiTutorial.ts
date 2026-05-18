import { Tutorial, TutorialStep } from '../../../components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { TutorialStepMessage } from '../../../components/wrapper-components/tutorial-game-wrapper/TutorialStepMessage';
import { PlayerOrNone } from '../../../jscaip/Player';
import { ReversiConfig } from '../common/AbstractReversiRules';
import { ReversiMove } from '../common/ReversiMove';
import { ReversiState } from '../common/ReversiState';

import { ToricReversiRules } from './ToricReversiRules';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;
const defaultConfig: ReversiConfig = ToricReversiRules.get().getDefaultRulesConfig();

export class ToricReversiTutorial extends Tutorial {
    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            $localize`Toric Reversi`,
            $localize`Toric Reversi, is a toric version of Reversi, which rules can be found <a href="/tutorial/Reversi">here</a>. This tutorial will only review the difference with the normal Reversi.`,
            ToricReversiRules.get().getInitialState(defaultConfig),
        ),
        TutorialStep.fromMove(
            $localize`Toricity`,
            $localize`Torus is the geometrical name of a donut. On a flat board like this, it means that the top is connected to the bottom, and the left connected to the right. This means that right now, you can capture by playing on the lefter column of the board`,
            new ReversiState([
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, X, O, O, O],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
            ], 1),
            [new ReversiMove(0, 3)],
            TutorialStepMessage.CONGRATULATIONS(),
            $localize`This is not the expected move.`,
        ),
    ];
}
