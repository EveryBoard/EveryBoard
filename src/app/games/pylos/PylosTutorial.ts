import { PylosCoord } from 'src/app/games/pylos/PylosCoord';
import { PylosMove } from 'src/app/games/pylos/PylosMove';
import { PylosState } from 'src/app/games/pylos/PylosState';
import { Player } from 'src/app/jscaip/Player';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { TutorialStep } from '../../components/wrapper-components/tutorial-game-wrapper/TutorialStep';

const _: number = Player.NONE.value;
const O: number = Player.ZERO.value;
const X: number = Player.ONE.value;

export const pylosTutorial: TutorialStep[] = [

    TutorialStep.informational(
        $localize`Goal of the game`,
        $localize`At Pylos, the goal is to be the last to play.
        To do this, you have to save up your pieces.
        As soon as a player puts its last piece, that player loses the game immediately.
        Here is what the initial board looks like, it is a board of 4 x 4 squares.
        This board will become a pyramid, little by little.
        It will be filled by the pieces of your stock. Each player has 15 pieces.`,
        PylosState.getInitialState(),
    ),
    TutorialStep.anyMove(
        $localize`Dropping a piece`,
        $localize`When it is your turn, you can always drop one of your piece on an empty square.
        The gray squares are where you can drop your pieces.<br/><br/>
        Click on one of the squares to drop a piece there.`,
        PylosState.getInitialState(),
        PylosMove.fromDrop(new PylosCoord(1, 1, 0), []),
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
        Go ahead, climb!`,
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
        [PylosMove.fromClimb(new PylosCoord(3, 3, 0), new PylosCoord(0, 0, 1), [])],
        $localize`Congratulations!<br/>
        Some important notes:
        <ol>
            <li>You cannot move a piece that is directly below another one.</li>
            <li>Of course, you cannot move the opponent's pieces.</li>
            <li>You can only climb when the landing square is higher than the starting square.</li>
        </ol>`,
        $localize`Failed!`,
    ),
    TutorialStep.fromMove(
        $localize`Square (1/2)`,
        $localize`When the piece you just moved or dropped is the fourth one of a square of your color,
        you can choose anywhere on the board one or two of your pieces.
        These pieces will be removed from the board, allowing you to save up one or two pieces.
        A chosen piece must not be directly below another piece.
        A chosen piece can be the piece you just placed.
        You're playing Dark.<br/><br/>
        Form a square, then click twice on one of the four pieces to remove only that one.`,
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
            PylosMove.fromDrop(new PylosCoord(0, 1, 0), [new PylosCoord(0, 0, 0)]),
            PylosMove.fromDrop(new PylosCoord(0, 1, 0), [new PylosCoord(0, 1, 0)]),
            PylosMove.fromDrop(new PylosCoord(0, 1, 0), [new PylosCoord(1, 0, 0)]),
            PylosMove.fromDrop(new PylosCoord(0, 1, 0), [new PylosCoord(1, 1, 0)]),
        ],
        $localize`Congratulations, you have saved up one piece.`,
        $localize`Failed!`,
    ),
    TutorialStep.fromPredicate(
        $localize`Square (2/2)`,
        $localize`You're playing Dark.<br/><br/>
        Do like in the previous step, but this time click on two different pieces.`,
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
        PylosMove.fromDrop(new PylosCoord(0, 1, 0), [new PylosCoord(0, 0, 0), new PylosCoord(1, 0, 0)]),
        (move: PylosMove, state: PylosState) => {
            if (move.secondCapture.isPresent()) {
                return MGPValidation.SUCCESS;
            }
            if (move.firstCapture.isPresent()) {
                return MGPValidation.failure($localize`Failed, you only captured one piece.`);
            }
            return MGPValidation.failure($localize`Failed, you did not capture any piece.`);
        },
        $localize`Congratulations, you have saved up two pieces.`,
    ),
];
