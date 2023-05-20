import { Tutorial, TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { Coord } from 'src/app/jscaip/Coord';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { PenteMove } from './PenteMove';
import { PenteState } from './PenteState';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

export class PenteTutorial extends Tutorial {
    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            $localize`Initial board and object of the game`,
            $localize`Pente is played on a 19x19 board, on which the stones are put on the intersections of the squares. The object of the game is to align 5 of your pieces, or to capture 10 pieces of your opponent. Initially, a stone of the second player is in the center location of the board.`,
            PenteState.getInitialState(),
        ),
        TutorialStep.anyMove(
            $localize`Dropping a stone`,
            $localize`At your turn, you must drop one stone on the board. There is no restriction: you can put it anywhere.<br/><br/>You're playing Dark, put a stone on the board.`,
            PenteState.getInitialState(),
            PenteMove.of(new Coord(9, 8)),
            $localize`Congratulations!`,
        ),
        TutorialStep.fromMove(
            $localize`Capturing`,
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
            ], [0, 0], 3),
            [PenteMove.of(new Coord(9, 6))],
            $localize`Congratulations!`,
            $localize`Failed, try again!`,
        ),
        TutorialStep.fromMove(
            $localize`Winning`,
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
            ], [8, 8], 7),
            [PenteMove.of(new Coord(9, 6)), PenteMove.of(new Coord(8, 9)), PenteMove.of(new Coord(13, 9))],
            $localize`Congratulations!`,
            $localize`Failed, try again!`,
        ),
    ];
}
