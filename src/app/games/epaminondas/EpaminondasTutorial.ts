import { EpaminondasMove } from 'src/app/games/epaminondas/EpaminondasMove';
import { EpaminondasState } from 'src/app/games/epaminondas/EpaminondasState';
import { Direction } from 'src/app/jscaip/Direction';
import { Player } from 'src/app/jscaip/Player';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { TutorialStep } from '../../components/wrapper-components/tutorial-game-wrapper/TutorialStep';

const _: number = Player.NONE.value;
const O: number = Player.ZERO.value;
const X: number = Player.ONE.value;
export const epaminondasTutorial: TutorialStep[] = [
    TutorialStep.informational(
        $localize`Initial board`,
        $localize`This is the initial board of Epaminondas.
        The top line is the starting line of Light.
        The bottom line is the starting line of Dark.`,
        EpaminondasState.getInitialState(),
    ),
    TutorialStep.informational(
        $localize`Goal of the game (1/2)`,
        $localize`After multiple moves, if at the beginning of its turn, a player has more pieces on the opponent's starting line
        than the number of pieces the opponent has on the player's starting line, the player wins.
        Here, it's Dark's turn to play: Dark has therefore won.`,
        new EpaminondasState([
            [_, _, _, _, _, O, _, _, X, X, X, X, X, X],
            [_, _, _, _, _, O, _, _, _, _, _, _, X, X],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, X, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, O, O, O, O, _, _, _],
        ], 0),
    ),
    TutorialStep.informational(
        $localize`Goal of the game (2/2)`,
        $localize`Here, it is Light's turn.
        Light wins because they have two pieces on Dark's starting line, and Dark only has one on Light's starting line.`,
        new EpaminondasState([
            [_, _, _, _, _, O, _, _, _, _, X, X, X, X],
            [_, _, _, _, _, O, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, X, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, X, X, _, _, _, O, O, _, O, O, O, O],
        ], 1),
    ),
    TutorialStep.fromPredicate(
        $localize`Moving a piece`,
        $localize`Here is the starting board. Dark plays first.
        Let's start with moving a single piece:
        <ol>
            <li>Click on a piece.</li>
            <li>Click on a empty neighboring square.</li>
        </ol>`,
        EpaminondasState.getInitialState(),
        new EpaminondasMove(0, 10, 1, 1, Direction.UP),
        (move: EpaminondasMove, state: EpaminondasState) => {
            if (move.movedPieces === 1) {
                return MGPValidation.SUCCESS;
            } else {
                return MGPValidation.failure($localize`Congratulations, you are in advance. But this is not the exercise here, try again.`);
            }
        },
        $localize`This is how you move a single piece.`,
    ),
    TutorialStep.fromPredicate(
        $localize`Moving a phalanx`,
        $localize`Let us now see how to move multiple pieces along a line, which is called a phalanx:
        <ol>
            <li>Click on the first piece of the phalanx.</li>
            <li>Click on the last piece of the phalanx.</li>
            <li>Click on one of the squares highlighted in yellow; you can move your phalanx up to a distance equal to its length.</li>
        </ol><br/>
        Move a phalanx!`,
        EpaminondasState.getInitialState(),
        new EpaminondasMove(0, 11, 2, 1, Direction.UP),
        (move: EpaminondasMove, _: EpaminondasState) => {
            if (move.movedPieces > 1) {
                return MGPValidation.SUCCESS;
            } else {
                return MGPValidation.failure($localize`Failed! You moved only one piece.`);
            }
        },
        $localize`Congratulations!
        The moved pieces can be horizontally, vertically, or diagonally aligned.
        The move should be made along this axis, forward or backwards.
        There can be no opponent nor holes in the phalanx.`,
    ),
    TutorialStep.fromMove(
        $localize`Capture`,
        $localize`In order to capture pieces of the opponent:
        <ol>
            <li>It must be aligned with the phalanx you are moving.</li>
            <li>It must be strictly shorter than your phalanx.</li>
            <li>The first piece of your phalanx should land on the first piece of the opponent's phalanx that you want to capture.</li>
        </ol><br/>
        Capture a phalanx.`,
        new EpaminondasState([
            [_, _, _, _, _, _, _, _, X, X, X, X, X, X],
            [_, _, _, _, _, _, X, _, _, _, _, _, _, _],
            [_, _, _, _, _, X, _, _, _, _, _, _, _, _],
            [_, _, X, _, X, _, _, _, _, _, _, _, _, _],
            [_, _, X, X, _, _, _, _, _, _, _, _, _, _],
            [_, _, X, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, O, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, O, _, _, _, _, X, _, _, _, _, _, _],
            [_, _, O, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, O, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, O, O, O, O, O, O, O],
        ], 0),
        [new EpaminondasMove(2, 10, 4, 2, Direction.UP)],
        $localize`Congratulations, you made it!
        Note that the diagonal phalanx was not aligned with your phalanx, hence even if it is longer, this does not prevent you from capturing some of its pieces on another alignment.`,
        $localize`Failed, you have not captured the phalanx.`,
    ),
];
