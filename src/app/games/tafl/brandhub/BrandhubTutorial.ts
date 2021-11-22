import { BrandhubMove } from 'src/app/games/tafl/brandhub/BrandhubMove';
import { TaflPawn } from 'src/app/games/tafl/TaflPawn';
import { BrandhubState } from 'src/app/games/tafl/brandhub/BrandhubState';
import { Coord } from 'src/app/jscaip/Coord';
import { TutorialStep } from '../../../components/wrapper-components/tutorial-game-wrapper/TutorialStep';

const _: TaflPawn = TaflPawn.UNOCCUPIED;
const O: TaflPawn = TaflPawn.INVADERS;
const X: TaflPawn = TaflPawn.DEFENDERS;
const A: TaflPawn = TaflPawn.PLAYER_ONE_KING;

export class BrandhubTutorial {
    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            $localize`Goal of the game`,
            $localize`Brandhub is Irish version of the family of viking strategy game called Tafl. The goal of the game is different for each player. The attacker plays first. Their pieces (dark) are close to the edges. Their goal is to capture the King, which is in the center of the board. The defender plays second. Their pieces (light) are in the middle. Their goal is to put the King on one of the 4 thrones in the corners. Note that the square in which the King starts, in the center of the board, is also a throne.`,
            BrandhubState.getInitialState(),
        ),
        TutorialStep.anyMove(
            $localize`Moving`,
            $localize`All pieces move the same way. Similarly to a rook in chess, a piece can move: <ol><li>By as many squares as you want.</li><li>Without going over another piece or stopping on another piece.</li><li>Horizontally or vertically.</li><li>Only the king can land on a corner throne.</li><li>Once the King left his central throne, he can't go back on it.</li></ol>To move a piece, click on it and then on its landing square.<br/><br/>This is the initial board, do the first move.`,
            BrandhubState.getInitialState(),
            new BrandhubMove(new Coord(3, 1), new Coord(1, 1)),
            $localize`Congratulations!`,
        ),
        TutorialStep.fromMove(
            $localize`Capturing a soldier (1/2)`,
            $localize`All pieces except the king, attackers and defenders, are soldiers.
        To capture them, they have to be sandwiched between two of your pieces.
        By getting too close, an attacker's soldier is in danger.<br/><br/>
        Capture it.`,
            new BrandhubState([
                [_, _, _, O, _, _, _],
                [_, _, _, O, _, _, _],
                [O, _, _, X, _, _, _],
                [_, _, X, A, X, O, O],
                [_, _, O, _, _, _, _],
                [_, _, _, X, _, O, _],
                [_, _, _, O, _, _, _],
            ], 1),
            [
                new BrandhubMove(new Coord(3, 5), new Coord(2, 5)),
            ],
            $localize`Congratulations, that will teach him a lesson!`,
            $localize`Failed, you missed an opportunity to capture a piece of the opponent.`,
        ).withPreviousMove(new BrandhubMove(new Coord(1, 4), new Coord(2, 4))),
        TutorialStep.fromMove(
            $localize`Capturing a soldier (2/2)`,
            $localize`A second way to capture a soldier is against an empty throne.
        The King has moved and endangered one of its soldiers.<br/><br/>
        Capture it.`,
            new BrandhubState([
                [_, _, _, O, _, _, _],
                [_, _, O, _, _, _, _],
                [_, _, _, X, _, _, _],
                [O, X, _, _, X, O, O],
                [_, X, _, _, _, _, _],
                [_, O, _, A, _, O, _],
                [_, _, _, O, _, _, _],
            ], 12),
            [new BrandhubMove(new Coord(1, 4), new Coord(2, 4))],
            $localize`Congratulations, one less defender. But keep an eye on the king, it is the most important.`,
            $localize`Failed, you did not do the expected move.`,
        ),
        TutorialStep.fromMove(
            $localize`Capturing the King on his throne`,
            $localize`To capture the King when he sits on his throne, the four squares neighbor to the king (horizontally and vertically) must be occupied by your soldiers.<br/><br/>Capture the king.`,
            new BrandhubState([
                [_, _, _, _, _, _, _],
                [_, _, _, X, _, _, _],
                [_, _, _, O, _, _, _],
                [_, O, _, A, O, _, _],
                [_, _, _, O, _, _, _],
                [_, X, _, _, _, _, _],
                [_, _, _, _, _, _, _],
            ], 72),
            [new BrandhubMove(new Coord(1, 3), new Coord(2, 3))],
            $localize`Congratulations, you won!`,
            $localize`Failed, you let the king run away.`,
        ),
        TutorialStep.fromMove( // TODOTODO
            $localize`Capturing the king (2/2)`,
            $localize`Another way to capture the king is to immobilize it against an edge of the board.
        Note that the king cannot be captured next to a throne.<br/><br/>
        Capture the king.`,
            new BrandhubState([
                [_, _, O, A, O, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, O, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
            ], 72),
            [new BrandhubMove(new Coord(3, 3), new Coord(3, 1))],
            $localize`The King is dead, long live the King. Congratulations, you won.`,
            $localize`Failed!`,
        ),
    ];
}
