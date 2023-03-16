import { Tutorial, TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { TrexoMove } from './TrexoMove';
import { TrexoRules } from './TrexoRules';
import { TrexoState } from './TrexoState';

const initialState: TrexoState = TrexoState.getInitialState();
const moves: TrexoMove[] = [
    TrexoMove.from(new Coord(4, 4), new Coord(4, 3)).get(),
    TrexoMove.from(new Coord(6, 4), new Coord(5, 4)).get(),
    TrexoMove.from(new Coord(5, 5), new Coord(5, 6)).get(),
    TrexoMove.from(new Coord(4, 4), new Coord(5, 4)).get(),
    TrexoMove.from(new Coord(7, 3), new Coord(8, 3)).get(),
    TrexoMove.from(new Coord(3, 1), new Coord(3, 2)).get(),
    TrexoMove.from(new Coord(7, 5), new Coord(6, 5)).get(),
];
let previousState: TrexoState = initialState;
const movesAndStates: { move: TrexoMove, state: TrexoState }[] = [];
for (const move of moves) {
    const state: TrexoState = TrexoRules.get().applyLegalMove(move, previousState);
    movesAndStates.push({ move, state });
    previousState = state;
}
const firstMove: TrexoMove = TrexoMove.from(new Coord(5, 5), new Coord(5, 4)).get();
const stateAtTurnOne: TrexoState = TrexoRules.get().applyLegalMove(firstMove, initialState);
const secondMove: TrexoMove = TrexoMove.from(new Coord(5, 7), new Coord(5, 6)).get();
const stateAtTurnTwo: TrexoState = TrexoRules.get().applyLegalMove(secondMove, stateAtTurnOne);

export class TrexoTutorial extends Tutorial {
    public tutorial: TutorialStep[] = [
        // 1. but du jeu et plateau
        TutorialStep.informational(
            $localize`Goal of the game`,
            $localize`At Trexo, the goal of the game is to align 5 piece of your color in an horizontal, vertical or diagonal line. But player must put a tile on the board, and that tile is constituted of two pieces, one from each players!`,
            TrexoState.getInitialState()),
        TutorialStep.anyMove(
            $localize`Dropping a tile`,
            $localize`When you drop at tile, it need to be on even ground, and it cannot be right on top of another tile. In others words, it need to be either on the floor, either on two tiles at the same height. To do that, just click on the place where you want to put the opponent piece, then on the neighboring square where you want to put your piece.<br/><br/>You're playing Dark, go ahead.`,
            TrexoState.getInitialState(),
            TrexoMove.from(new Coord(4, 4), new Coord(3, 4)).get(),
            $localize`Congratulations!`),
        TutorialStep.fromMove(
            $localize`Put a piece over other pieces`,
            $localize`When two different pieces on the same level touch each other, you can put a piece on them. You must respect two rules for that:<br/><ul><li>The two pieces must be at the same level.</li><li>You cannot drop your piece on only one other piece.</li></ul><br/>You're playing Dark, do such a move!`,
            stateAtTurnTwo,
            [
                TrexoMove.from(new Coord(5, 5), new Coord(5, 6)).get(),
                TrexoMove.from(new Coord(5, 6), new Coord(5, 5)).get(),
            ],
            $localize`Congratulations!`,
            $localize`Incorrect, you put that piece on the floor level, please put it on top of two pieces.`)
            .withPreviousMoveAndState([
                { move: firstMove, state: initialState },
                { move: secondMove, state: stateAtTurnOne },
            ]),
        TutorialStep.fromPredicate(
            $localize`Victory`,
            $localize`To win at Trexo, you need to align 5 of your pieces, only the piece on top count. Since you have to put the piece of your opponents first, if you create a victory for them and for you in the same turn, they'll be considered the winners (if you create only a victory for them too, obviously).<br/><br/>You're playing Dark, win.`,
            previousState, // This state became a pre-victorious state in the loop
            TrexoMove.from(new Coord(2, 0), new Coord(2, 1)).get(),
            (move: TrexoMove, _: TrexoState) => {
                if (move.second.equals(new Coord(2, 1)) ||
                    move.second.equals(new Coord(7, 6)))
                {
                    return MGPValidation.SUCCESS;
                } else {
                    return MGPValidation.failure($localize`Failed. try again.`);
                }
            },
            $localize`Congratulations, you won!`)
            .withPreviousMoveAndState(movesAndStates),
    ];
}
