import { Tutorial, TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { SquarzConfig, SquarzRules } from './SquarzRules';
import { SquarzState } from './SquarzState';
import { SquarzMove } from './SquarzMove';
import { Coord } from 'src/app/jscaip/Coord';
import { TutorialStepMessage } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStepMessage';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { MGPOptional, MGPValidation } from '@everyboard/lib';

const defaultConfig: MGPOptional<SquarzConfig> = SquarzRules.get().getDefaultRulesConfig();
const initialState: SquarzState = SquarzRules.get().getInitialState(defaultConfig);

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

export class SquarzTutorial extends Tutorial {

    public tutorial: TutorialStep[] = [

        TutorialStep.informational(
            $localize`Squarz`,
            $localize`Squarz is board control game. Here is the initial state. The goal is to have the most pieces at the end of the game.`,
            initialState,
        ),

        TutorialStep.fromPredicate(
            $localize`Duplication`,
            $localize`One of the two kinds of move you can do is the duplication. When you do one, you create a new piece. To do this, select one of your pieces, and click on one of its neighboring space.<br/><br/>You're playing Dark, make a duplication.`,
            initialState,
            SquarzMove.from(new Coord(0, 0), new Coord(1, 1)).get(),
            (move: SquarzMove, _state: SquarzState) => {
                if (move.isDuplication()) {
                    return MGPValidation.SUCCESS;
                } else {
                    return MGPValidation.failure($localize`This was a jump, try to do a duplication.`);
                }
            },
            TutorialStepMessage.CONGRATULATIONS(),
        ),

        TutorialStep.fromPredicate(
            $localize`Jumps`,
            $localize`The second type of move you can do is the jump. When you do one, your piece leaves its original space and jumps two spaces further. To do this, select one of your pieces, and click on its landing space two spaces further.<br/><br/>You're playing Light, make a jump.`,
            new SquarzState([
                [O, _, _, _, _, _, _, X],
                [_, O, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [X, _, _, _, _, _, _, O],
            ], 1),
            SquarzMove.from(new Coord(7, 0), new Coord(5, 2)).get(),
            (move: SquarzMove, _state: SquarzState) => {
                if (move.isDuplication()) {
                    return MGPValidation.failure($localize`This was a duplication, try a jump now.`);
                } else {
                    return MGPValidation.SUCCESS;
                }
            },
            TutorialStepMessage.CONGRATULATIONS(),
        ).withPreviousMove(SquarzMove.from(new Coord(0, 0), new Coord(1, 1)).get()),

        TutorialStep.fromPredicate(
            $localize`Captures`,
            $localize`When one of your pieces lands on a square that neighbors an opponent's pieces, those pieces become yours.<br/><br/>You're playing Dark, do such a move!`,
            new SquarzState([
                [O, _, _, _, _, _, _, X],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, O, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, X, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, O],
            ], 3),
            SquarzMove.from(new Coord(2, 5), new Coord(3, 4)).get(),
            (_move: SquarzMove, _state: SquarzState, resultingState: SquarzState) => {
                if (resultingState.getPieceAtXY(3, 3) === Player.ONE) {
                    return MGPValidation.SUCCESS;
                } else {
                    return MGPValidation.failure(TutorialStepMessage.YOU_DID_NOT_CAPTURE_ANY_PIECE());
                }
            },
            TutorialStepMessage.CONGRATULATIONS(),
        ).withPreviousMove(SquarzMove.from(new Coord(1, 1), new Coord(3, 3)).get()),

        TutorialStep.fromPredicate(
            $localize`End of the game`,
            $localize`When one player can no longer play, the game ends, and the player with the most pieces wins. Here, you can do a final move and win.<br/><br/>You're playing Light, do it.`,
            new SquarzState([
                [X, X, X, X, X, X, X, X],
                [O, O, O, O, O, O, O, O],
                [O, O, O, O, O, O, O, O],
                [O, O, O, O, O, O, O, O],
                [X, X, X, _, X, X, X, X],
                [X, X, X, X, X, X, X, X],
                [X, X, X, X, X, X, X, X],
                [O, O, O, O, O, O, O, O],
            ], 3),
            SquarzMove.from(new Coord(2, 5), new Coord(3, 4)).get(),
            (move: SquarzMove, _state: SquarzState, _resultingState: SquarzState) => {
                if (move.isDuplication()) {
                    return MGPValidation.SUCCESS;
                } else {
                    return MGPValidation.failure($localize`Bad choice, by making this move you allowed the opponent to win.<br/><br/>Try again!`);
                }
            },
            TutorialStepMessage.CONGRATULATIONS_YOU_WON(),
        ).withPreviousMove(SquarzMove.from(new Coord(1, 1), new Coord(3, 3)).get()),

    ];

}
