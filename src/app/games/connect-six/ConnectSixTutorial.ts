import { Tutorial, TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { ConnectSixState } from './ConnectSixState';
import { ConnectSixDrops, ConnectSixFirstMove } from './ConnectSixMove';
import { Coord } from 'src/app/jscaip/Coord';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { ConnectSixRules } from './ConnectSixRules';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GobanConfig } from 'src/app/jscaip/GobanConfig';
import { TutorialStepMessage } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStepMessage';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;
const defaultConfig: MGPOptional<GobanConfig> = ConnectSixRules.get().getDefaultRulesConfig();

export class ConnectSixTutorial extends Tutorial {

    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            $localize`Initial board and object of the game`,
            $localize`Connect Six is played on a 19x19 board, on which stones are put on the intersections. The aim of the game is to align 6 of your pieces.`,
            ConnectSixRules.get().getInitialState(defaultConfig),
        ),
        // First turn: you must place only one
        TutorialStep.anyMove(
            $localize`First turn`,
            $localize`On the first turn, the first player plays only one piece.<br/><br/>You're playing Dark, place your first piece by clicking on an intersection.`,
            ConnectSixRules.get().getInitialState(defaultConfig),
            ConnectSixFirstMove.of(new Coord(9, 9)),
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        // Next turn: you must place six, try to win
        TutorialStep.anyMove(
            $localize`Next turns`,
            $localize`On all following turns, the players play two pieces.<br/><br/>You're playing Light, do the winning move.`,
            new ConnectSixState([
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, X, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, O, _, X, O, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, O, O, _, _, X, _, _, _, _, _, _],
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
            ], 20),
            ConnectSixDrops.of(new Coord(4, 11), new Coord(5, 10)),
            TutorialStepMessage.CONGRATULATIONS(),
        ),
    ];
}
