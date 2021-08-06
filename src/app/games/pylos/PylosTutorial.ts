import { PylosCoord } from 'src/app/games/pylos/PylosCoord';
import { PylosMove } from 'src/app/games/pylos/PylosMove';
import { PylosPartSlice } from 'src/app/games/pylos/PylosPartSlice';
import { Player } from 'src/app/jscaip/Player';
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
        It will be filled by the pieces of your stock, of which each player has 15.`,
        PylosPartSlice.getInitialSlice(),
    ),
    TutorialStep.anyMove(
        $localize`Dropping a piece`,
        $localize`When it is your turn, you can always drop one of your piece on an empty square.
        The grey squares are where you can drop your pieces.<br/><br/>
        Click on one of the squares to drop a piece there.`,
        PylosPartSlice.getInitialSlice(),
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
        new PylosPartSlice([
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
            <li> You cannot move a piece that is directly below another one.</li>
            <li> Of course, you cannot move the opponent's pieces.</li>
            <li> You can only climb when the landing square is higher than the starting square.</li>
        </ol>`,
        $localize`Failed!`,
    ),
    TutorialStep.fromMove(
        $localize`Square (1/3)`,
        $localize`When the piece you're moving is the fourth one of a square of your color,
        you can choose anywhere on the board one or two of your pieces.
        These pieces will be removed from the board, allowing you to save up one or two pieces.
        A chosen piece must not be directly below another piece.
        A chosen piece can be the piece you just placed.
        You're playing Dark.<br/><br/>
        Form a square, then click twice on one of the four pieces to remove only that one.`,
        new PylosPartSlice([
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
        $localize`Congratulations, you have saved one piece.`,
        $localize`Failed!`,
    ),
    TutorialStep.fromMove(
        $localize`Square (2/3)`,
        $localize`You're playing Dark.<br/<br/>
        Do like in the previous step, but this time click on both pieces on the top row.`,
        new PylosPartSlice([
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
        [PylosMove.fromDrop(new PylosCoord(0, 1, 0), [new PylosCoord(0, 0, 0), new PylosCoord(1, 0, 0)])],
        $localize`Congratulations, you have saved two pieces.`,
        $localize`Failed!`,
    ),
    TutorialStep.fromMove(
        $localize`Square (3/3)`,
        $localize`You're playing Dark.
        Do as in the last step, but this time
        you will have to take, as expected, the highest piece,
        and then take the piece below it, which can now be taken.<br/><br/>
        Go ahead.`,
        new PylosPartSlice([
            [
                [O, X, X, O],
                [X, O, O, X],
                [X, X, O, X],
                [O, X, O, _],
            ], [
                [_, O, X],
                [O, O, X],
                [O, X, _],
            ], [
                [_, X],
                [X, _],
            ], [
                [_],
            ],
        ], 0),
        [PylosMove.fromDrop(new PylosCoord(0, 0, 1), [new PylosCoord(0, 0, 1), new PylosCoord(0, 0, 0)])],
        $localize`Congratulations, you have saved two pieces. You are now ready to play.`,
        $localize`Failed!`,
    ),
];
