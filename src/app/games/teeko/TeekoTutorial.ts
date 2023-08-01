import { Tutorial, TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { TeekoState } from './TeekoState';
import { TeekoDropMove, TeekoTranslationMove } from './TeekoMove';
import { Coord } from 'src/app/jscaip/Coord';
import { PlayerOrNone } from 'src/app/jscaip/Player';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

export class TeekoTutorial extends Tutorial {

    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            $localize`Goal of the game`,
            $localize`The goal of the game is to align your 4 pieces, or to form a square with them.`,
            TeekoState.getInitialState(),
        ),
        TutorialStep.anyMove(
            $localize`Dropping a piece`,
            $localize`During your first four turns, you must drop one piece on any empty space of the board. There is no other restriction.<br/><br/>You're playing Dark, put a piece on the board.`,
            TeekoState.getInitialState(),
            TeekoDropMove.from(new Coord(2, 2)).get(),
            $localize`Congratulations!`,
        ),
        TutorialStep.anyMove(
            $localize`Moving a piece`,
            $localize`Once all of your four pieces are placed on the board, you must now move one of your piece to another empty space. The goal remain to be the first to create a line or a square.<br/><br/>You're playing Dark, move a piece.`,
            new TeekoState([
                [O, X, _, _, _],
                [O, O, _, _, _],
                [X, X, _, _, _],
                [X, O, _, _, _],
                [_, _, _, _, _],
            ], 8),
            TeekoTranslationMove.from(new Coord(1, 3), new Coord(2, 1)).get(),
            $localize`Congratulations!`,
        ),
        TutorialStep.fromMove(
            $localize`Victory`,
            $localize`In this board, you can win either by creating a line, or a square.<br/><br/>You are playing Dark, win.`,
            new TeekoState([
                [X, _, _, _, _],
                [X, O, _, _, _],
                [_, O, O, X, _],
                [_, X, _, O, _],
                [_, _, _, _, _],
            ], 8),
            [
                TeekoTranslationMove.from(new Coord(1, 2), new Coord(4, 4)).get(), // Diagonal
                TeekoTranslationMove.from(new Coord(3, 3), new Coord(2, 1)).get(), // Square
            ],
            $localize`Congratulations, you won!`,
            $localize`Failed. Try again.`,
        ),
    ];
}
