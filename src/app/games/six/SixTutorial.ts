import { SixState } from 'src/app/games/six/SixState';
import { SixMove } from 'src/app/games/six/SixMove';
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { Localized } from 'src/app/utils/LocaleUtils';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { TutorialStep } from '../../components/wrapper-components/tutorial-game-wrapper/TutorialStep';

const _: number = Player.NONE.value;
const O: number = Player.ZERO.value;
const X: number = Player.ONE.value;

export class SixTutorialMessages {

    public static readonly MOVEMENT_NOT_DISCONNECTING: Localized = () => $localize`This move does not disconnect your opponent's pieces. Try again with another piece.`;

    public static readonly MOVEMENT_SELF_DISCONNECTING: Localized = () => $localize`You lost one of your pieces during this move. There is a way to disconnect an opponent's piece without losing any of yours, try again!`;
}

export class SixTutorial {
    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            $localize`Six`,
            $localize`Six is a game without board, where pieces are placed on the side of each other, in a contiguous block.
        Each player has 21 pieces, with one for each player already on the board.
        The goal of the game is to form one of the three winning shapes with your pieces.`,
            SixState.getInitialState(),
        ),
        TutorialStep.fromMove(
            $localize`Victory (line)`,
            $localize`On this board, by putting your piece at the right place, you can align six of your pieces and win the game<br/><br/>
        Find the victory. You're playing Dark.`,
            SixState.fromRepresentation([
                [O, X, X, X, X, O],
                [_, O, X, _, O, _],
                [X, X, O, _, _, _],
                [_, _, O, _, _, _],
                [_, O, _, _, _, _],
                [O, _, _, _, _, _],
            ], 0),
            [SixMove.fromDrop(new Coord(3, 2))],
            $localize`Congratulations!`,
            $localize`Failed!`,
        ),
        TutorialStep.fromMove(
            $localize`Victory (circle)`,
            $localize`On this board, by putting your piece at the right place, you can form a circle with six of your pieces and win the game.<br/><br/>
        Find the victory. You're playing Dark.`,
            SixState.fromRepresentation([
                [_, _, _, X, _, _],
                [_, _, X, X, O, O],
                [_, X, _, O, X, _],
                [X, O, O, O, O, X],
            ], 0),
            [SixMove.fromDrop(new Coord(5, 2))],
            $localize`Congratulations! Note that if a piece is inside the circle, it does not change anything.`,
            $localize`Failed!`,
        ),
        TutorialStep.fromMove(
            $localize`Victory (triangle)`,
            $localize`On this board, by putting your piece at the right place, you can form a triangle with six of your pieces and win the game.<br/><br/>
        Find the victory. You're playing Dark.`,
            SixState.fromRepresentation([
                [_, _, _, X, _, _],
                [_, O, X, O, O, O],
                [_, O, _, O, O, _],
                [X, X, X, _, X, _],
            ], 0),
            [SixMove.fromDrop(new Coord(3, 3))],
            $localize`Congratulations!`,
            $localize`Failed!`,
        ),
        TutorialStep.fromPredicate(
            $localize`Second phase`,
            $localize`After 40 turns, your pieces have all been placed and we move on to the second phase of the game.
        You now have to move your pieces, paying attention not to remove a piece that was preventing the opponent's victory.
        From now on, if after move, on or more pieces are disconnected from the largest group of pieces, these will be taken out of the game.<br/><br/>
        You're playing Dark. Make a move that disconnects one of your opponent's pieces.`,
            SixState.fromRepresentation([
                [_, _, _, _, _, _, _, X, _],
                [_, _, _, _, _, _, O, _, _],
                [_, _, _, _, O, O, O, _, _],
                [_, _, _, _, X, X, _, X, O],
                [_, O, X, X, O, O, X, _, _],
                [O, O, O, O, X, X, X, O, _],
                [X, X, O, _, X, X, O, _, _],
                [_, O, _, O, O, _, _, _, _],
                [X, X, X, X, _, _, _, _, _],
                [_, O, _, X, _, _, _, _, _],
            ], 40),
            SixMove.fromMovement(new Coord(6, 1), new Coord(5, 1)),
            (_move: SixMove, resultingState: SixState) => {
                const pieces: [number, number] = resultingState.countPieces();
                if (pieces[0] === 19) {
                    if (pieces[1] === 18) {
                        return MGPValidation.SUCCESS;
                    } else {
                        return MGPValidation.failure(SixTutorialMessages.MOVEMENT_NOT_DISCONNECTING());
                    }
                } else {
                    return MGPValidation.failure(SixTutorialMessages.MOVEMENT_SELF_DISCONNECTING());
                }
            },
            $localize`Congratulations, your opponent now has one piece less and you're closer to victory!`,
        ),
        TutorialStep.fromPredicate(
            $localize`Victory by disconnection`,
            $localize`During the second phase of the game, on top of normal victories (line, circle, triangle), you can win by disconnection.
        If at any time, at least one player does not have enough pieces to win (less than 6), the game ends.
        The one with the most pieces wins. In case they both have the same number of pieces, it's a draw.<br/><br/>
        Here, you're playing Dark and you can win. Do it!`,
            SixState.fromRepresentation([
                [_, _, _, _, _, X],
                [_, _, _, _, O, X],
                [_, _, _, X, O, O],
                [_, _, O, _, X, O],
                [X, X, _, _, _, O],
                [O, X, _, _, _, _],
                [O, _, _, _, _, _],
            ], 40),
            SixMove.fromMovement(new Coord(2, 3), new Coord(3, 3)),
            (move: SixMove, _resultingState: SixState) => {
                if (move.start.equalsValue(new Coord(2, 3))) {
                    return MGPValidation.SUCCESS;
                } else {
                    return MGPValidation.failure(SixTutorialMessages.MOVEMENT_NOT_DISCONNECTING());
                }
            },
            $localize`Congratulations, you won!`,
        ),
        TutorialStep.fromPredicate(
            $localize`Special disconnection`,
            $localize`During a disconnection, two or more groups could have the same size,
        in which case you will have to click on the group you wish to keep.<br/><br/>
        You're playing Dark, play such a move!`,
            SixState.fromRepresentation([
                [_, _, _, _, _, X],
                [_, _, _, _, O, X],
                [_, _, _, X, O, O],
                [O, _, O, _, _, X],
                [X, X, _, _, _, _],
                [O, O, _, _, _, _],
                [O, _, _, _, _, _],
            ], 40),
            SixMove.fromCut(new Coord(2, 3), new Coord(2, 5), new Coord(2, 5)),
            (move: SixMove, resultingState: SixState) => {
                if (move.keep.isAbsent()) {
                    return MGPValidation.failure($localize`This move has not cut the board in two equal halves.`);
                }
                if (resultingState.getPieceAt(move.landing.getNext(resultingState.offset)) === Player.NONE) {
                    return MGPValidation.failure($localize`Failed. You did cut the board in two but you kept the half where you're in minority. Therefore, you lost! Try again.`);
                } else {
                    return MGPValidation.SUCCESS;
                }
            },
            $localize`Congratulations, you won!`,
        ),
    ];
}
