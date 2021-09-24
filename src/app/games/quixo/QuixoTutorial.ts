import { QuixoPartSlice } from 'src/app/games/quixo/QuixoPartSlice';
import { QuixoMove } from 'src/app/games/quixo/QuixoMove';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { Player } from 'src/app/jscaip/Player';
import { TutorialStep } from '../../components/wrapper-components/tutorial-game-wrapper/TutorialStep';

const _: number = Player.NONE.value;
const O: number = Player.ZERO.value;
const X: number = Player.ONE.value;

export const quixoTutorial: TutorialStep[] = [
    TutorialStep.informational(
        $localize`Goal of the game.`,
        $localize`At Quixo, the goal is to align 5 of your pieces.
        The first player plays with dark pieces, the second with light pieces.
        The board is made of 25 spaces spread over a 5x5 square.
        Every piece has a neutral side, a light side, and a dark side.`,
        QuixoPartSlice.getInitialSlice(),
    ),
    TutorialStep.fromMove(
        $localize`What a move looks like (without animation)`,
        $localize`When it is your turn:
        <ol>
            <li>Click on one of your pieces or on a neutral one. You cannot choose a piece of the opponent.
                You can only choose a piece from the edge of the board.</li>
            <li>Pick a direction in which you want to send the piece (by clicking on the arrow).</li>
        </ol>
        You have to imagine that the piece you picked has been moved to the other side of the board, in the chosen direction.
        Once on the other side, all pieces will move by one space in the opposing direction.
        Afterwards, if the piece was neutral, it will become yours and takes your color.<br/><br/>
        For example, take the bottom right neutral piece, and move it to the left (you're playing Light).`,
        new QuixoPartSlice([
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
            [O, O, O, O, _],
        ], 1),
        [new QuixoMove(4, 4, Orthogonal.LEFT)],
        $localize`See how the four dark pieces have been moved one space to the right.
        The neutral piece has been move 4 pieces to the left and has become light.`,
        $localize`Failed!`,
    ),
    TutorialStep.fromMove(
        $localize`Victory`,
        $localize`You already know everything you need in order to play, but there is one last particularity.
        If you create a line of 5 of your pieces, you win.
        If you create a line of 5 of your opponent's pieces, you lose.
        If you create both, you lose too!<br/><br/>
        You can win with this board, try it.
        You're playing Light.`,
        new QuixoPartSlice([
            [_, X, _, X, X],
            [_, O, O, _, O],
            [X, X, X, O, X],
            [O, _, O, X, X],
            [X, O, _, X, O],
        ], 31),
        [new QuixoMove(3, 0, Orthogonal.DOWN)],
        $localize`Congratulations, you won!`,
        $localize`Failed!`,
    ),
];
