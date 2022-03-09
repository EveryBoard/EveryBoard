import { TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { Coord } from 'src/app/jscaip/Coord';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { ConspirateursMove, ConspirateursMoveDrop, ConspirateursMoveJump, ConspirateursMoveSimple } from './ConspirateursMove';
import { ConspirateursState } from './ConspirateursState';

const _: PlayerOrNone = PlayerOrNone.NONE;
const A: Player = Player.ZERO;
const B: Player = Player.ONE;

export class ConspirateursTutorial {

    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            $localize`Board and aim of the game`,
            $localize`Conspirateurs is played on a 17x17 board. The goal of the game is to place all of your pieces in shelters, which are the special squares on the edge of the board. Note the central zone in the middle of the board, where each player will put their pieces initially.`,
            ConspirateursState.getInitialState(),
        ),
        TutorialStep.anyMove(
            $localize`Initial phase`,
            $localize`In the initial phase of the game, each player drop their 20 pieces, one per turn consecutively, in the central zone of the board. This phase does not allow any other kind of move.<br/><br/>Drop one of your piece in the central zone.`,
            ConspirateursState.getInitialState(),
            ConspirateursMoveDrop.of(new Coord(7, 7)).get(),
            $localize`Congratulations!`,
        ),
        TutorialStep.fromPredicate(
            $localize`Simple move`,
            $localize`Once all pieces have been placed, there are two kind of moves that can be performed. The first is a simple move in any direction, orthogonally or diagonally, of a single step.<br/><br/>You're playing Dark. Click on one of your piece and perform such a move.`,
            new ConspirateursState([
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, A, A, B, B, A, A, B, A, B, _, _, _, _],
                [_, _, _, _, A, B, A, B, A, A, A, A, B, _, _, _, _],
                [_, _, _, _, A, B, _, _, _, _, _, B, A, _, _, _, _],
                [_, _, _, _, B, A, A, B, B, B, A, A, A, _, _, _, _],
                [_, _, _, _, B, A, B, B, B, B, B, B, A, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            ], 40),
            ConspirateursMoveSimple.of(new Coord(4, 6), new Coord(3, 5)).get(),
            (move: ConspirateursMove, _: ConspirateursState) => {
                if (move.isSimple()) {
                    return MGPValidation.SUCCESS;
                } else {
                    return MGPValidation.failure($localize`You have made a jump, not a simple move. Try again!`);
                }

            },
            $localize`Congratulations!`,
        ),
        TutorialStep.fromPredicate(
            $localize`Jumps`,
            $localize`The other type of move is a jump. A piece can jump over a neighboring piece in any direction, as long as it lands directly on the square after that piece, along the same direction.<br/><br/>You're playing Dark. Perform a jump by clicking on one of your piece that can perform a jump, and then on the target square. You may need to click a second time on the target square to confirm your jump, in case your piece is still highlighted (we will see shortly why this is useful).`,
            new ConspirateursState([
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, A, A, B, B, A, A, B, A, B, _, _, _, _],
                [_, _, _, _, A, B, A, B, A, A, A, A, B, _, _, _, _],
                [_, _, _, _, A, B, _, _, _, _, _, B, A, _, _, _, _],
                [_, _, _, _, B, A, A, B, B, B, A, A, A, _, _, _, _],
                [_, _, _, _, B, A, B, B, B, B, B, B, A, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            ], 40),
            ConspirateursMoveJump.of([new Coord(6, 7), new Coord(6, 5)]).get(),
            (move: ConspirateursMove, _: ConspirateursState) => {
                if (move.isJump()) {
                    return MGPValidation.SUCCESS;
                } else {
                    return MGPValidation.failure($localize`You have not performed a jump. Try again!`);
                }
            },
            $localize`Congratulations!`,
        ),
        TutorialStep.fromMove(
            $localize`Chaining jumps in a single move`,
            $localize`Jumps can be chained when possible. You can decide whether to continue a jump or to stop it at any time. To finish your jump, click a second time on your current location. Otherwise, simply keep clicking on your next location. Once no more destination is possible, your move will end without you needing to click the piece a second time.<br/><br/>You're playing Dark and you can perform a triple jump! Do it.`,
            new ConspirateursState([
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, B, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, B, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, B, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, A, A, _, B, A, A, B, A, B, _, _, _, _],
                [_, _, _, _, A, _, A, B, A, A, A, A, B, _, _, _, _],
                [_, _, _, _, A, B, _, _, _, _, _, B, A, _, _, _, _],
                [_, _, _, _, B, A, A, B, B, B, A, A, A, _, _, _, _],
                [_, _, _, _, B, A, B, B, B, B, B, B, A, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            ], 40),
            [ConspirateursMoveJump.of([new Coord(8, 6), new Coord(6, 4), new Coord(6, 2), new Coord(6, 0)]).get()],
            $localize`Congratulations! You now know everything to play the game. Remember: to win, you have to place all of your pieces in shelters before your opponent does.`,
            $localize`You have not performed a triple jump. Try again!`,
        ),
    ];
}
