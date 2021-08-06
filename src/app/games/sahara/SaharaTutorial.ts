import { SaharaMove } from 'src/app/games/sahara/SaharaMove';
import { SaharaPartSlice } from 'src/app/games/sahara/SaharaPartSlice';
import { Coord } from 'src/app/jscaip/Coord';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { TutorialStep } from '../../components/wrapper-components/tutorial-game-wrapper/TutorialStep';

const N: number = FourStatePiece.NONE.value;
const O: number = FourStatePiece.ZERO.value;
const X: number = FourStatePiece.ONE.value;
const _: number = FourStatePiece.EMPTY.value;
export const saharaTutorial: TutorialStep[] = [

    TutorialStep.informational(
        $localize`Initial board`,
        $localize`Sâhârâ is played on a board where each space is a triangle.
        Each player has six pyramids.`,
        SaharaPartSlice.getInitialSlice(),
    ),
    TutorialStep.informational(
        $localize`Goal of the game`,
        $localize`At Sâhârâ, the goal of the game is to immobilize one of the opponent's pyramid.
        To do so, you have to occupy all neighboring space of that pyramid.
        Here, Light has lost because its leftmost pyramid is immobilized.`,
        new SaharaPartSlice([
            [N, N, _, _, X, _, _, O, X, N, N],
            [N, _, _, _, _, _, _, _, _, _, N],
            [X, O, _, _, _, _, _, _, _, _, O],
            [O, _, _, _, _, _, _, _, _, _, X],
            [N, _, _, _, _, _, _, _, _, _, N],
            [N, N, X, O, _, _, _, X, O, N, N],
        ], 3),
    ),
    TutorialStep.fromPredicate(
        $localize`Simple move`,
        $localize`To immobilize your opponent, you have to move your pyramids.
        When a pyramid shares its vertices with light spaces, it can move on these spaces (we call this a simple step)
        You're the first player, playing with the dark pyramids
        <ol>
            <li> Click on one of your pyramids.</li>
            <li> Click then on one of the two or three neighboring spaces in order to move your pyramid there.</li>
        </ol><br/>
        Do any move.`,
        SaharaPartSlice.getInitialSlice(),
        new SaharaMove(new Coord(2, 0), new Coord(2, 1)),
        (move: SaharaMove, state: SaharaPartSlice) => {
            if (move.isSimpleStep()) {
                return MGPValidation.SUCCESS;
            } else {
                return MGPValidation.failure($localize`You have made a double step, which is good but it is the next exercise!`);
            }
        },
        $localize`Congratulations!`,
    ),
    TutorialStep.fromPredicate(
        $localize`Double move`,
        $localize`When a pyramid shares its vertices with dark spaces, it can move one or two steps.
        To do so:
        <ol>
            <li> Click on the pyramid to move.</li>
            <li> Click on one of the 6 destinations that you can reach in two steps:
                the 6 neighboring light spaces of the 3 dark spaces that are neighbors of your pyramid.
        </ol>`,
        SaharaPartSlice.getInitialSlice(),
        new SaharaMove(new Coord(7, 0), new Coord(5, 0)),
        (move: SaharaMove, _: SaharaPartSlice) => {
            if (move.isSimpleStep()) {
                return MGPValidation.failure($localize`Failed! You have made a single step.`);
            } else {
                return MGPValidation.SUCCESS;
            }
        },
        $localize`Congratulations!`,
    ),
];
