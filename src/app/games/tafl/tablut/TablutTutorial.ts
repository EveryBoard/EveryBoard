import { TablutMove } from 'src/app/games/tafl/tablut/TablutMove';
import { TaflPawn } from 'src/app/games/tafl/TaflPawn';
import { TablutState } from 'src/app/games/tafl/tablut/TablutState';
import { Coord } from 'src/app/jscaip/Coord';
import { TutorialStep } from '../../../components/wrapper-components/tutorial-game-wrapper/TutorialStep';

const _: TaflPawn = TaflPawn.UNOCCUPIED;
const x: TaflPawn = TaflPawn.INVADERS;
const i: TaflPawn = TaflPawn.DEFENDERS;
const A: TaflPawn = TaflPawn.PLAYER_ONE_KING;

export class TablutTutorial {
    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            $localize`Goal of the game`,
            $localize`Tablut is a strategy game that was played by the Vikings.
        The goal of the game is different for each player.
        The attacker plays first. Its pieces (dark) are close to the edges.
        Its goal is to capture the king, which is in the center of the board.
        The defender plays second. Its pieces (light) are in the middle.
        Its goal is to move the king on one of the 4 thrones in the corners.
        Note that the square in which the king starts, in the center of the board, is also a throne.`,
            TablutState.getInitialState(),
        ),
        TutorialStep.anyMove(
            $localize`Moving`,
            $localize`All pieces move the same way.
        Similarly to a rook in chess, a piece can move:
        <ol>
            <li>By as many squares as you want.</li>
            <li>Without going over another piece or stopping on another piece.</li>
            <li>Horizontally or vertically.</li>
            <li>Only the king can land on a throne.</li>
        </ol>
        To move a piece, click on it and then on its landing square.<br/><br/>
        You're playing Dark, do the first move.`,
            TablutState.getInitialState(),
            TablutMove.of(new Coord(4, 1), new Coord(1, 1)),
            $localize`Congratulations!`,
        ),
        TutorialStep.fromMove(
            $localize`Capturing a soldier (1/2)`,
            $localize`All pieces, attackers and defenders, except the king, are soldiers. To capture them, they have to be sandwiched between two of your pieces. By getting too close, an attacker's soldier is in danger.<br/><br/>Capture it.`,
            new TablutState([
                [_, _, _, x, x, x, _, _, _],
                [_, _, _, _, x, _, _, _, _],
                [_, _, _, _, i, _, _, _, _],
                [_, _, _, x, i, _, _, _, x],
                [x, x, i, i, A, i, i, x, x],
                [_, _, _, _, i, _, _, _, x],
                [_, _, _, _, i, _, _, _, _],
                [_, _, _, _, x, _, _, _, _],
                [_, _, _, x, x, x, _, _, _],
            ], 1),
            [
                TablutMove.of(new Coord(2, 4), new Coord(2, 3)),
                TablutMove.of(new Coord(4, 2), new Coord(3, 2)),
            ],
            $localize`Congratulations, that will teach him a lesson!`,
            $localize`Failed, you missed an opportunity to capture a piece of the opponent.`,
        ),
        TutorialStep.fromMove(
            $localize`Capturing a soldier (2/2)`,
            $localize`A second way to capture a soldier is to sandwich it against an empty throne. The king has moved and endangered one of its soldiers.<br/><br/>Capture it.`,
            new TablutState([
                [_, _, _, x, x, x, _, _, _],
                [_, _, _, _, x, _, _, _, _],
                [_, _, _, _, i, _, _, _, _],
                [_, _, i, _, A, _, i, _, x],
                [x, x, _, i, _, i, i, x, x],
                [_, _, _, _, i, _, _, _, x],
                [_, _, _, _, i, _, _, _, _],
                [_, _, _, _, x, _, _, _, _],
                [_, _, _, x, x, x, _, _, _],
            ], 12),
            [TablutMove.of(new Coord(1, 4), new Coord(2, 4))],
            $localize`Congratulations, one less defender. But keep an eye on the king, it is the most important.`,
            $localize`Failed, you did not do the expected move.`,
        ),
        TutorialStep.fromMove(
            $localize`Capturing the king (1/2)`,
            $localize`To capture the king, two soldiers are not enough.
        For the first solution, the four squares neighbor to the king (horizontally and vertically) must be occupied by your soldiers.
        This also works if the king is on the throne.<br/><br/>
        Capture the king.`,
            new TablutState([
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, x, _, _, _, _, _, _, _],
                [x, A, _, x, _, _, _, _, _],
                [_, x, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
            ], 72),
            [TablutMove.of(new Coord(3, 4), new Coord(2, 4))],
            $localize`Congratulations, you won!`,
            $localize`Failed, you let the king run away.`,
        ),
        TutorialStep.fromMove(
            $localize`Capturing the king (2/2)`,
            $localize`Another way to capture the king is to immobilize it against an edge of the board.
        Note that the king cannot be captured next to a throne.<br/><br/>
        Capture the king.`,
            new TablutState([
                [_, _, x, A, x, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, x, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
            ], 72),
            [TablutMove.of(new Coord(3, 3), new Coord(3, 1))],
            $localize`The king is dead, long live the king. Congratulations, you won.`,
            $localize`Failed!`,
        ),
    ];
}
