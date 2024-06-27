import { Tutorial, TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { Coord } from 'src/app/jscaip/Coord';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { PenteMove } from './PenteMove';
import { PenteState } from './PenteState';
import { PenteRules } from './PenteRules';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { MGPOptional } from '@everyboard/lib';
import { TutorialStepMessage } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStepMessage';
import { PenteConfig } from './PenteConfig';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;
const defaultConfig: MGPOptional<PenteConfig> = PenteRules.get().getDefaultRulesConfig();

export class PenteTutorial extends Tutorial {
    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            TutorialStepMessage.INITIAL_BOARD_AND_OBJECT_OF_THE_GAME(),
            $localize`Pente is played on a 19x19 board, on which the pieces are put on the intersections of the squares. The object of the game is to align 5 of your pieces, or to capture 10 pieces of your opponent. Initially, a piece of the second player is in the center location of the board.`,
            PenteRules.get().getInitialState(defaultConfig),
        ),
        TutorialStep.anyMove(
            $localize`Dropping a piece`,
            $localize`At your turn, you must drop one piece on any empty space of the board. There is no other restriction.<br/><br/>You're playing Dark, put a piece on the board.`,
            PenteRules.get().getInitialState(defaultConfig),
            PenteMove.of(new Coord(9, 8)),
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.fromMove(
            $localize`Captures`,
            $localize`You can capture exactly two pieces of your opponent by sandwiching them between two of your pieces.<br/><br/>You're playing Light and you can capture, do it!`,
            new PenteState([
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, X, O, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, X, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            ], PlayerNumberMap.of(0, 0), 3),
            [PenteMove.of(new Coord(9, 6))],
            TutorialStepMessage.CONGRATULATIONS(),
            TutorialStepMessage.FAILED_TRY_AGAIN(),
        ),
        TutorialStep.fromMove(
            $localize`Placing in a sandwich position`,
            $localize`You can safely place a piece next to another of your piece in what would look like a sandwich from the opponent's pieces. This is a safe move.<br/><br/>You're playing Light and have the opportunity to do such a move here, do it!`,
            new PenteState([
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, X, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, X, O, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, X, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            ], PlayerNumberMap.of(0, 0), 4),
            [PenteMove.of(new Coord(9, 7))],
            TutorialStepMessage.CONGRATULATIONS(),
            TutorialStepMessage.FAILED_TRY_AGAIN(),
        ),
        TutorialStep.fromMove(
            $localize`Victory`,
            $localize`Remember, to win you can either align 5 or your pieces, or capture 10 pieces of your opponent. Here, as Light, you have already captured 8 pieces and you only need two more to win.<br/><br/>You're playing Light, you can win in two ways. Win!`,
            new PenteState([
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, X, _, _, O, O, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, O, _, O, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, X, O, O, O, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, X, X, X, X, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            ], PlayerNumberMap.of(8, 8), 7),
            [
                PenteMove.of(new Coord(9, 6)),
                PenteMove.of(new Coord(8, 9)),
                PenteMove.of(new Coord(13, 9)),
            ],
            TutorialStepMessage.CONGRATULATIONS(),
            TutorialStepMessage.FAILED_TRY_AGAIN(),
        ),
    ];
}
