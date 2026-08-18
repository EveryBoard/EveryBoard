import { Coord } from '@everyboard/games';
import { GobanConfig } from '@everyboard/games';
import { PlayerOrNone } from '@everyboard/games';
import { ConnectSixDrops, ConnectSixFirstMove } from '@everyboard/games';
import { ConnectSixRules } from '@everyboard/games';
import { ConnectSixState } from '@everyboard/games';

import { Tutorial, TutorialStep } from '../../components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { TutorialStepMessage } from '../../components/wrapper-components/tutorial-game-wrapper/TutorialStepMessage';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;
const defaultConfig: GobanConfig = ConnectSixRules.get().getDefaultRulesConfig();

export class ConnectSixTutorial extends Tutorial {

    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            TutorialStepMessage.INITIAL_BOARD_AND_OBJECT_OF_THE_GAME(),
            $localize`Connect Six is played on a 19x19 board, on which stones are put on the intersections. The object of the game is to align 6 of your pieces.`,
            ConnectSixRules.get().getInitialState(defaultConfig),
        ),
        TutorialStep.anyMove(
            $localize`First turn`,
            $localize`At the first turn, the first player plays only one piece.<br/><br/>You're playing Dark, place your first piece by clicking on an intersection.`,
            ConnectSixRules.get().getInitialState(defaultConfig),
            ConnectSixFirstMove.of(new Coord(9, 9)),
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.fromMove(
            $localize`Next turns`,
            $localize`On all following turns, the players play two pieces, until a victory or a draw is reached.<br/><br/>You're playing Light, do the winning move.`,
            new ConnectSixState([
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, X, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, O, _, X, O, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, O, O, _, _, X, O, _, _, _, _, _],
                [_, _, _, _, _, _, _, X, O, O, O, O, X, _, _, _, _, _, _],
                [_, _, _, _, _, _, X, O, O, O, O, X, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, X, _, X, O, X, X, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, O, X, O, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, X, _, X, _, O, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, X, X, _, X, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, X, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            ], 21),
            [ConnectSixDrops.of(new Coord(7, 12), new Coord(8, 11))],
            TutorialStepMessage.CONGRATULATIONS(),
            TutorialStepMessage.FAILED_TRY_AGAIN(),
        ),
    ];
}
