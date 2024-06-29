import { QuixoConfig, QuixoState } from 'src/app/games/quixo/QuixoState';
import { QuixoMove } from 'src/app/games/quixo/QuixoMove';
import { Orthogonal } from 'src/app/jscaip/Orthogonal';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { Tutorial, TutorialStep } from '../../components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { QuixoRules } from './QuixoRules';
import { MGPOptional } from '@everyboard/lib';
import { TutorialStepMessage } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStepMessage';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

const defaultConfig: MGPOptional<QuixoConfig> = QuixoRules.get().getDefaultRulesConfig();

export class QuixoTutorial extends Tutorial {

    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            TutorialStepMessage.OBJECT_OF_THE_GAME(),
            $localize`At Quixo, the goal is to align 5 of your pieces.
        The first player plays with dark pieces, the second with light pieces.
        The board is made of 25 spaces spread over a 5x5 square.
        Every piece has a neutral side, a light side, and a dark side.`,
            QuixoRules.get().getInitialState(defaultConfig),
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
            new QuixoState([
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
                [O, O, O, O, _],
            ], 1),
            [new QuixoMove(4, 4, Orthogonal.LEFT)],
            $localize`See how the four dark pieces have been moved one space to the right.
        The neutral piece has been move 4 pieces to the left and has become light.`,
            TutorialStepMessage.FAILED_TRY_AGAIN(),
        ),
        TutorialStep.fromMove(
            $localize`Victory`,
            $localize`You already know everything you need in order to play, but there is one last particularity.
        If you create a line of 5 of your pieces, you win.
        If you create a line of 5 of your opponent's pieces, you lose.
        If you create both, you lose too!<br/><br/>
        You can win with this board, try it.
        You're playing Light.`,
            new QuixoState([
                [_, X, _, X, X],
                [_, O, O, _, O],
                [X, X, X, O, X],
                [O, _, O, X, X],
                [X, O, _, X, O],
            ], 31),
            [new QuixoMove(3, 0, Orthogonal.DOWN)],
            TutorialStepMessage.CONGRATULATIONS_YOU_WON(),
            TutorialStepMessage.FAILED_TRY_AGAIN(),
        ),
    ];
}
