import { Tutorial, TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { TrexoMove } from './TrexoMove';
import { TrexoRules } from './TrexoRules';
import { TrexoPiece, TrexoPieceStack, TrexoState } from './TrexoState';
import { Player } from 'src/app/jscaip/Player';

const ______: TrexoPieceStack = TrexoPieceStack.EMPTY;
const ONE__0: TrexoPieceStack = TrexoPieceStack.from([new TrexoPiece(Player.ONE, 1, 0)]);
const ZERO_0: TrexoPieceStack = TrexoPieceStack.from([new TrexoPiece(Player.ZERO, 1, 0)]);
const ONE__1: TrexoPieceStack = TrexoPieceStack.from([new TrexoPiece(Player.ONE, 1, 1)]);
const ZERO_1: TrexoPieceStack = TrexoPieceStack.from([new TrexoPiece(Player.ZERO, 1, 1)]);
const ZERO_2: TrexoPieceStack = TrexoPieceStack.from([new TrexoPiece(Player.ZERO, 1, 2)]);
const ONE__2: TrexoPieceStack = TrexoPieceStack.from([new TrexoPiece(Player.ONE, 1, 2)]);
const ZERO_3: TrexoPieceStack = TrexoPieceStack.from([
    new TrexoPiece(Player.ZERO, 1, 0),
    new TrexoPiece(Player.ZERO, 2, 3),
]);
const ONE__3: TrexoPieceStack = TrexoPieceStack.from([
    new TrexoPiece(Player.ONE, 1, 1),
    new TrexoPiece(Player.ONE, 2, 3),
]);
const ZERO_4: TrexoPieceStack = TrexoPieceStack.from([new TrexoPiece(Player.ZERO, 1, 4)]);
const ONE__4: TrexoPieceStack = TrexoPieceStack.from([new TrexoPiece(Player.ONE, 1, 4)]);
const ZERO_5: TrexoPieceStack = TrexoPieceStack.from([new TrexoPiece(Player.ZERO, 1, 5)]);
const ONE__5: TrexoPieceStack = TrexoPieceStack.from([new TrexoPiece(Player.ONE, 1, 5)]);
const ONE__6: TrexoPieceStack = TrexoPieceStack.from([new TrexoPiece(Player.ONE, 1, 6)]);
const ZERO_6: TrexoPieceStack = TrexoPieceStack.from([new TrexoPiece(Player.ZERO, 1, 6)]);

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
            new TrexoState([
                [______, ______, ______, ONE__0, ZERO_0, ZERO_1, ONE__1, ______, ______, ______],
                [______, ______, ______, ______, ______, ______, ______, ______, ______, ______],
                [______, ______, ______, ______, ______, ______, ______, ______, ______, ______],
                [______, ______, ______, ______, ______, ______, ______, ______, ______, ______],
                [______, ______, ______, ______, ______, ______, ______, ______, ______, ______],
                [______, ______, ______, ______, ______, ______, ______, ______, ______, ______],
                [______, ______, ______, ______, ______, ______, ______, ______, ______, ______],
                [______, ______, ______, ______, ______, ______, ______, ______, ______, ______],
                [______, ______, ______, ______, ______, ______, ______, ______, ______, ______],
                [______, ______, ______, ______, ______, ______, ______, ______, ______, ______]
            ], 7),
            [
                TrexoMove.from(new Coord(4, 0), new Coord(5, 0)).get(),
                TrexoMove.from(new Coord(5, 0), new Coord(4, 0)).get(),
            ],
            $localize`Congratulations!`,
            $localize`Incorrect, you put that piece on the floor level, please put it on top of two pieces.`,
        ),
        TutorialStep.fromPredicate(
            $localize`Victory`,
            $localize`To win at Trexo, you need to align 5 of your pieces. Important, only the piece on top counts, the hidden piece are no longer threats, and a victory can include pieces on differents heights. Since you have to put the piece of your opponent first, if you create a victory for them and for you at the same turn, they'll be considered the winners. If you create only a victory for them too, obviously.<br/><br/>You're playing Light, win.`,
            new TrexoState([
                [______, ______, ______, ______, ______, ______, ______, ______, ______, ______],
                [______, ______, ______, ZERO_5, ______, ______, ______, ______, ______, ______],
                [______, ______, ______, ONE__5, ______, ______, ______, ______, ______, ______],
                [______, ______, ______, ______, ONE__0, ______, ______, ZERO_4, ONE__4, ______],
                [______, ______, ______, ______, ZERO_3, ONE__3, ZERO_1, ______, ______, ______],
                [______, ______, ______, ______, ______, ZERO_2, ONE__6, ZERO_6, ______, ______],
                [______, ______, ______, ______, ______, ONE__2, ______, ______, ______, ______],
                [______, ______, ______, ______, ______, ______, ______, ______, ______, ______],
                [______, ______, ______, ______, ______, ______, ______, ______, ______, ______],
                [______, ______, ______, ______, ______, ______, ______, ______, ______, ______]
            ], 7),
            TrexoMove.from(new Coord(2, 0), new Coord(2, 1)).get(),
            (lastMove: TrexoMove, _: TrexoState, resultingState: TrexoState) => {
                const moveScore: number = TrexoRules.TREXO_HELPER.getSquareScore(resultingState, lastMove.getOne());
                if (moveScore === Number.MAX_SAFE_INTEGER) {
                    return MGPValidation.SUCCESS;
                } else {
                    return MGPValidation.failure($localize`Failed. Try again.`);
                }
            },
            $localize`Congratulations, you won!`,
        ),
    ];
}
