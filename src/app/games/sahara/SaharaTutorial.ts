import { SaharaMove } from 'src/app/games/sahara/SaharaMove';
import { SaharaState } from 'src/app/games/sahara/SaharaState';
import { Coord } from 'src/app/jscaip/Coord';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { MGPValidation } from '@everyboard/lib';
import { Tutorial, TutorialStep } from '../../components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { SaharaRules } from './SaharaRules';
import { TutorialStepMessage } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStepMessage';

const N: FourStatePiece = FourStatePiece.UNREACHABLE;
const O: FourStatePiece = FourStatePiece.ZERO;
const X: FourStatePiece = FourStatePiece.ONE;
const _: FourStatePiece = FourStatePiece.EMPTY;

export class SaharaTutorial extends Tutorial {
    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            $localize`Initial board`,
            $localize`Sâhârâ is played on a board where each space is a triangle.
        Each player has six pyramids.`,
            SaharaRules.get().getInitialState(),
        ),
        TutorialStep.informational(
            TutorialStepMessage.OBJECT_OF_THE_GAME(),
            $localize`At Sâhârâ, the object of the game is to immobilize one of the opponent's pyramids. To do so, you have to occupy all neighboring space of that pyramid. Here, Light has lost because its leftmost pyramid is immobilized.`,
            new SaharaState([
                [N, N, _, _, X, _, _, O, X, N, N],
                [N, _, _, _, _, _, _, _, _, _, N],
                [X, O, _, _, _, _, _, _, _, _, O],
                [O, _, _, _, _, _, _, _, _, _, X],
                [N, _, _, _, _, _, _, _, _, _, N],
                [N, N, X, O, _, _, _, X, O, N, N],
            ], 3),
        ),
        TutorialStep.fromPredicate(
            $localize`Simple step`,
            $localize`To immobilize your opponent, you have to move your pyramids.
        When a pyramid shares its vertices with light spaces, it can move on these spaces (we call this a simple step).
        To perform a move:
        <ol>
            <li>Click on one of your pyramids.</li>
            <li>Click on one of its two or three neighboring spaces in order to move your pyramid there.</li>
        </ol><br/>
        You're playing Dark, do any simple step.`,
            SaharaRules.get().getInitialState(),
            SaharaMove.from(new Coord(2, 0), new Coord(2, 1)).get(),
            (move: SaharaMove, _previous: SaharaState, _result: SaharaState) => {
                if (move.isSimpleStep()) {
                    return MGPValidation.SUCCESS;
                } else {
                    return MGPValidation.failure($localize`You have made a double step, which is good but it is the next exercise!`);
                }
            },
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.fromPredicate(
            $localize`Double step`,
            $localize`When a pyramid shares its vertices with dark spaces, it can move one or two steps.
        To do so:
        <ol>
            <li>Click on the pyramid to move.</li>
            <li>Click on one of the 6 destinations that you can reach in two steps:
                 the 6 neighboring light spaces of the 3 dark spaces that are neighbors of your pyramid.
        </ol><br/>
        You're playing Dark, do a double step.`,
            SaharaRules.get().getInitialState(),
            SaharaMove.from(new Coord(7, 0), new Coord(5, 0)).get(),
            (move: SaharaMove, _previous: SaharaState, _result: SaharaState) => {
                if (move.isSimpleStep()) {
                    return MGPValidation.failure($localize`Failed! You have made a single step.`);
                } else {
                    return MGPValidation.SUCCESS;
                }
            },
            TutorialStepMessage.CONGRATULATIONS(),
        ),
    ];
}
