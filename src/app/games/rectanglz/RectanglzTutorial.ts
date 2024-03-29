import { Tutorial, TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { RectanglzConfig, RectanglzRules } from './RectanglzRules';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { RectanglzState } from './RectanglzState';
import { RectanglzMove } from './RectanglzMove';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { TutorialStepMessage } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStepMessage';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';

const defaultConfig: MGPOptional<RectanglzConfig> = RectanglzRules.get().getDefaultRulesConfig();
const initialState: RectanglzState = RectanglzRules.get().getInitialState(defaultConfig);

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

export class RectanglzTutorial extends Tutorial {

    public tutorial: TutorialStep[] = [

        TutorialStep.informational(
            $localize`Rectanglz`,
            $localize`Rectanglz is board control game. Here is the initial state. The goal is to have the more piece at the end of the game.`,
            initialState,
        ),

        TutorialStep.fromPredicate(
            $localize`Simple step`,
            $localize`One of the two kind of move you can do is the simple step. When you do one, you create a new piece. To do this, select one of your pieces, and click on its neighbors space.<br/>You're playing Dark, make a simple step.`,
            initialState,
            RectanglzMove.from(new Coord(0, 0), new Coord(1, 1)).get(),
            (move: RectanglzMove, _: RectanglzState) => {
                if (move.isDuplication()) {
                    return MGPValidation.SUCCESS;
                } else {
                    return MGPValidation.failure($localize`This was a single step, try a jump now.`);
                }
            },
            TutorialStepMessage.CONGRATULATIONS(),
        ),

        TutorialStep.fromPredicate(
            $localize`Jumps`,
            $localize`The second type of move you can do is the jump. When you do one, your piece leaves it's original space and jump two space further. To do this, select one of your pieces, and click on its landing space two space further.<br/>You're playing Light, make a jump.`,
            new RectanglzState([
                [O, _, _, _, _, _, _, X],
                [_, O, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [X, _, _, _, _, _, _, O],
            ], 1),
            RectanglzMove.from(new Coord(7, 0), new Coord(5, 2)).get(),
            (move: RectanglzMove, _: RectanglzState) => {
                if (move.isDuplication()) {
                    return MGPValidation.failure($localize`This was a single step, try a jump now.`);
                } else {
                    return MGPValidation.SUCCESS;
                }
            },
            TutorialStepMessage.CONGRATULATIONS(),
        ).withPreviousMove(RectanglzMove.from(new Coord(0, 0), new Coord(1, 1)).get()), // TODO: check that we SEE the highlight
        TutorialStep.fromPredicate(
            $localize`Captures`,
            $localize`When one of your pieces arrives on a square neighbor to opponent's pieces, those pieces switch color.<br/>You're playing Dark, do such a move!`,
            new RectanglzState([
                [O, _, _, _, _, _, _, X],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, O, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, X, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, O],
            ], 3),
            RectanglzMove.from(new Coord(2, 5), new Coord(3, 4)).get(),
            (_move: RectanglzMove, _state: RectanglzState, resultingState: RectanglzState) => {
                if (resultingState.getPieceAtXY(3, 3) === Player.ONE) {
                    return MGPValidation.SUCCESS;
                } else {
                    return MGPValidation.failure(TutorialStepMessage.YOU_DID_NOT_CAPTURE_ANY_PIECE());
                }
            },
            TutorialStepMessage.CONGRATULATIONS(),
        ).withPreviousMove(RectanglzMove.from(new Coord(1, 1), new Coord(3, 3)).get()),
        TutorialStep.fromPredicate(
            $localize`Captures`,
            $localize`When one of your pieces arrives on a square neighbor to opponent's pieces, those pieces switch color.<br/>You're playing Dark, do such a move!`,
            new RectanglzState([
                [X, X, X, X, X, X, X, X],
                [O, O, O, O, O, O, O, O],
                [O, O, O, O, O, O, O, O],
                [O, O, O, O, O, O, O, O],
                [X, X, X, _, X, X, X, X],
                [X, X, X, X, X, X, X, X],
                [X, X, X, X, X, X, X, X],
                [O, O, O, O, O, O, O, O],
            ], 3),
            RectanglzMove.from(new Coord(2, 5), new Coord(3, 4)).get(),
            (move: RectanglzMove, _state: RectanglzState, _resultingState: RectanglzState) => {
                if (move.isDuplication()) {
                    return MGPValidation.SUCCESS;
                } else {
                    return MGPValidation.failure($localize`Bad choice, by making this move you allowed the opponent to steal you 5 pieces, win 5 pieces, and duplicate one piece, hence taking 11 points of advance on you and winning.<br/>Try again!`);
                }
            },
            TutorialStepMessage.CONGRATULATIONS_YOU_WON(),
        ).withPreviousMove(RectanglzMove.from(new Coord(1, 1), new Coord(3, 3)).get()),
    ];

}
