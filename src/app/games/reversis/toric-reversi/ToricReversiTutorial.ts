import { PlayerOrNone } from '@everyboard/games';
import { ReversiConfig } from '@everyboard/games';
import { ReversiMove } from '@everyboard/games';
import { ReversiState } from '@everyboard/games';
import { ToricReversiRules } from '@everyboard/games';

import { Tutorial, TutorialStep } from '../../../components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { TutorialStepMessage } from '../../../components/wrapper-components/tutorial-game-wrapper/TutorialStepMessage';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;
const defaultConfig: ReversiConfig = ToricReversiRules.get().getDefaultRulesConfig();

export class ToricReversiTutorial extends Tutorial {
    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            $localize`Toric Reversi`,
            $localize`Toric Reversi is a variant of Reversi played on a toric board. If you are not familiar with the base rules of Reversi, check them out <a href="/tutorial/Reversi">here</a> before continuing. This tutorial only covers what changes with the toric board.`,
            ToricReversiRules.get().getInitialState(defaultConfig),
        ),
        TutorialStep.fromMove(
            $localize`Left-right connectivity`,
            $localize`On a toric board, the left edge is connected to the right edge. This means a line of pieces can wrap around horizontally. Here, you can capture the three light pieces by playing on the leftmost column, as the board wraps around to continue the line.<br/><br/>You are playing Dark. Do a capture.`,
            new ReversiState([
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, O, X, X, X],
                [_, _, _, X, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
            ], 2),
            [new ReversiMove(0, 3)],
            TutorialStepMessage.CONGRATULATIONS(),
            $localize`Look at the fourth row: there is a line of dark pieces that wraps around the left edge.`,
        ),
        TutorialStep.fromMove(
            $localize`Top-bottom connectivity`,
            $localize`The same applies vertically: the top edge is connected to the bottom edge. Find the move that captures by playing on the top row.`,
            new ReversiState([
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, X, X, _, _, _],
                [_, _, _, X, O, _, _, _],
                [_, _, _, O, _, _, _, _],
                [_, _, _, O, _, _, _, _],
                [_, _, _, O, _, _, _, _],
            ], 1),
            [new ReversiMove(3, 0)],
            TutorialStepMessage.CONGRATULATIONS(),
            $localize`Look at the fourth column: the dark piece at the bottom wraps around to the top.`,
        ),
        TutorialStep.fromMove(
            $localize`Diagonal wrapping`,
            $localize`Wrapping also works diagonally. A diagonal can cross both the horizontal and vertical edges at the same time. Here, a diagonal of light pieces wraps around a corner of the board. Can you find the capturing move?`,
            new ReversiState([
                [_, _, _, _, _, _, _, X],
                [_, _, _, _, _, _, X, _],
                [_, _, _, X, _, X, _, _],
                [_, _, _, X, X, _, _, _],
                [_, _, _, O, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
            ], 2),
            [new ReversiMove(0, 7)],
            TutorialStepMessage.CONGRATULATIONS(),
            $localize`Follow the diagonal starting from the dark piece: it wraps around the right edge and continues on the left.`,
        ),
        TutorialStep.informational(
            $localize`Strategic implications`,
            $localize`On a standard Reversi board, corners and edges are powerful because pieces placed there cannot be flanked. On a toric board, there are no corners and no edges, every piece can potentially be captured from any direction. This completely changes the strategy: stability must be built differently, and no position is ever truly safe.`,
            ToricReversiRules.get().getInitialState(defaultConfig),
        ),
    ];
}
