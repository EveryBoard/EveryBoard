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
for (const move of moves) {
    const state: TrexoState = TrexoRules.get().applyLegalMove(move, previousState);
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
            $localize`At Trexo, the goal of the game is to align 5 pieces of your color in a vertical, horizontal or diagonal line. However, the players play with tiles that are constituted of two pieces, one from each player!`,
            TrexoState.getInitialState(),
        ),
        TutorialStep.anyMove(
            $localize`Dropping a tile`,
            $localize`When you drop at tile, it needs to be on even ground, and it cannot be right on top of another tile. In others words, it needs to be either on the floor, or on two tiles at the same height. To do that, just click on the square where you want to put the opponent side of the tile, then on the neighboring square where you want to put your piece.<br/><br/>You're playing Dark, put a tile on the board.`,
            TrexoState.getInitialState(),
            TrexoMove.from(new Coord(4, 4), new Coord(3, 4)).get(),
            $localize`Congratulations!`,
        ),
        TutorialStep.fromMove(
            $localize`Dropping a piece over other pieces`,
            $localize`You can put a tile on other tiles. For that you must respect two rules:<br/><ul><li>The two pieces must be at the same level.</li><li>You cannot drop your piece on only one other piece.</li></ul><br/>You're playing Dark, do such a move!`,
            stateAtTurnTwo,
            [
                TrexoMove.from(new Coord(5, 5), new Coord(5, 6)).get(),
                TrexoMove.from(new Coord(5, 6), new Coord(5, 5)).get(),
            ],
            $localize`Congratulations!`,
            $localize`Incorrect, you put that piece on the floor level, please put it on top of two pieces.`,
        )
            .withPreviousMove(secondMove)
            .withPreviousState(stateAtTurnOne),
        TutorialStep.fromPredicate(
            $localize`Victory`,
            $localize`To win at Trexo, you need to align 5 of your pieces, only the piece on top counts. Since you have to put the piece of your opponent first, if you create a victory for them and for you in the same turn, they'll be considered the winners (if you create only a victory for them too, obviously).<br/><br/>You're playing Dark, win.`,
            previousState, // This state became a pre-victorious state in the loop
            TrexoMove.from(new Coord(2, 0), new Coord(2, 1)).get(),
            (lastMove: TrexoMove, _: TrexoState, resultingState: TrexoState) => {
                if (TrexoRules.TREXO_HELPER.getSquareScore(resultingState, lastMove.getOne()) > 5) {
                    return MGPValidation.SUCCESS;
                } else {
                    return MGPValidation.failure($localize`Failed. Try again.`);
                }
            },
            $localize`Congratulations, you won!`,
        ),
    ];
}
