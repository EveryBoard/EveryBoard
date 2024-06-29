import { TutorialStepMessage } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStepMessage';
import { PylosCoord } from 'src/app/games/pylos/PylosCoord';
import { PylosMove } from 'src/app/games/pylos/PylosMove';
import { PylosState } from 'src/app/games/pylos/PylosState';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { MGPValidation } from '@everyboard/lib';
import { Tutorial, TutorialStep } from '../../components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { PylosRules } from './PylosRules';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

export class PylosTutorial extends Tutorial {

    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            TutorialStepMessage.OBJECT_OF_THE_GAME(),
            $localize`At Pylos, the goal is to be the last to play.
        To do this, you have to save up your pieces.
        As soon as a player puts its last piece, that player loses the game immediately.
        Here is what the initial board looks like, it is a board of 4 x 4 squares.
        This board will become a pyramid, little by little.
        It will be filled by the pieces of your stock. Each player has 15 pieces.`,
            PylosRules.get().getInitialState(),
        ),
        TutorialStep.anyMove(
            $localize`Dropping a piece`,
            $localize`When it is your turn, you can always drop one of your piece on an empty square.
        The gray squares are where you can drop your pieces.<br/><br/>
        Click on one of the squares to drop a piece there.`,
            PylosRules.get().getInitialState(),
            PylosMove.ofDrop(new PylosCoord(1, 1, 0), []),
            $localize`There you go, as simple as that.`,
        ),
        TutorialStep.fromMove(
            $localize`Climbing`,
            $localize`When 4 pieces form a square, it is possible to put a fifth piece on top.
        However, when that happens, you can save a piece by climbing instead of dropping a piece.
        To climb:
        <ol>
            <li>Click on one of your free pieces, which should be lower than the landing square.</li>
            <li>Click on an empty landing square, higher than your selected piece.</li>
        </ol><br/>
        You're playing Dark, go ahead and climb!`,
            new PylosState([
                [
                    [O, X, _, _],
                    [X, O, _, _],
                    [_, _, _, _],
                    [_, _, _, O],
                ], [
                    [_, _, _],
                    [_, _, _],
                    [_, _, _],
                ], [
                    [_, _],
                    [_, _],
                ], [
                    [_],
                ],
            ], 0),
            [PylosMove.ofClimb(new PylosCoord(3, 3, 0), new PylosCoord(0, 0, 1), [])],
            $localize`Congratulations!<br/>
        Some important notes:
        <ol>
            <li>You cannot move a piece that is directly below another one.</li>
            <li>Of course, you cannot move the opponent's pieces.</li>
            <li>You can only climb when the landing square is higher than the starting square.</li>
        </ol>`,
            TutorialStepMessage.FAILED_TRY_AGAIN(),
        ),
        TutorialStep.fromMove(
            $localize`Square (1/2)`,
            $localize`When the piece you just moved or dropped is the fourth one of a square of your color,
        you can choose anywhere on the board one or two of your pieces.
        These pieces will be removed from the board, allowing you to save up one or two pieces.
        A chosen piece must not be directly below another piece.
        A chosen piece can be the piece you just placed.<br/><br/>
        You're playing Dark. Form a square, click on one of the four pieces, then click on the V symbol on the bottom right to finalize your move.`,
            new PylosState([
                [
                    [O, O, _, _],
                    [_, O, _, _],
                    [_, _, _, _],
                    [_, _, _, _],
                ], [
                    [_, _, _],
                    [_, _, _],
                    [_, _, _],
                ], [
                    [_, _],
                    [_, _],
                ], [
                    [_],
                ],
            ], 0),
            [
                PylosMove.ofDrop(new PylosCoord(0, 1, 0), [new PylosCoord(0, 0, 0)]),
                PylosMove.ofDrop(new PylosCoord(0, 1, 0), [new PylosCoord(0, 1, 0)]),
                PylosMove.ofDrop(new PylosCoord(0, 1, 0), [new PylosCoord(1, 0, 0)]),
                PylosMove.ofDrop(new PylosCoord(0, 1, 0), [new PylosCoord(1, 1, 0)]),
            ],
            $localize`Congratulations, you have saved up one piece. Note, you can cancel your selection by clicking again on the piece.`,
            TutorialStepMessage.FAILED_TRY_AGAIN(),
        ),
        TutorialStep.fromPredicate(
            $localize`Square (2/2)`,
            $localize`You're playing Dark.<br/><br/>Do like in the previous step, but this time click on two different pieces before validating.`,
            new PylosState([
                [
                    [O, O, _, _],
                    [_, O, _, _],
                    [_, _, _, _],
                    [_, _, _, _],
                ], [
                    [_, _, _],
                    [_, _, _],
                    [_, _, _],
                ], [
                    [_, _],
                    [_, _],
                ], [
                    [_],
                ],
            ], 0),
            PylosMove.ofDrop(new PylosCoord(0, 1, 0), [new PylosCoord(0, 0, 0), new PylosCoord(1, 0, 0)]),
            (move: PylosMove, _previous: PylosState, _result: PylosState) => {
                if (move.secondCapture.isPresent()) {
                    return MGPValidation.SUCCESS;
                }
                if (move.firstCapture.isPresent()) {
                    return MGPValidation.failure($localize`Failed, you only captured one piece.`);
                }
                return MGPValidation.failure(TutorialStepMessage.YOU_DID_NOT_CAPTURE_ANY_PIECE());
            },
            $localize`Congratulations, you have saved up two pieces.`,
        ),
    ];
}
