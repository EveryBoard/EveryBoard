import { ReversiMove } from 'src/app/games/reversi/ReversiMove';
import { ReversiPartSlice } from 'src/app/games/reversi/ReversiPartSlice';
import { Player } from 'src/app/jscaip/Player';
import { TutorialStep } from '../../components/wrapper-components/tutorial-game-wrapper/TutorialStep';

const _: number = Player.NONE.value;
const O: number = Player.ZERO.value;
const X: number = Player.ONE.value;
export const reversiTutorial: TutorialStep[] = [
    TutorialStep.informational(
        $localize`Goal of the game`,
        $localize`At Reversi, the pieces are double sided: one dark side for the first player, one light side for the second player.
        When one piece is flipped, its owner changes.
        The player owning the most pieces at the end of the game wins.
        Here, Dark has 28 points and Light has 36, hence Light wins.`,
        new ReversiPartSlice([
            [O, O, O, O, O, O, O, O],
            [O, X, X, X, X, X, X, O],
            [O, X, X, X, X, X, X, O],
            [O, X, X, X, X, X, X, O],
            [O, X, X, X, X, X, X, O],
            [O, X, X, X, X, X, X, O],
            [O, X, X, X, X, X, X, O],
            [O, O, O, O, O, O, O, O],
        ], 60),
    ),
    TutorialStep.anyMove(
        $localize`Capture (1/2)`,
        $localize`At the beginning of the game, pieces are placed as shown here.
        For a move to be legal, it must sandwich at least one piece of the opponent between the piece you're putting and another of your pieces.<br/><br/>
        Do any move by clicking to put your piece
        Dark plays first.`,
        ReversiPartSlice.getInitialSlice(),
        new ReversiMove(2, 4),
        $localize`Congratulations!`,
    ),
    TutorialStep.fromMove(
        $localize`Capture (2/2)`,
        $localize`A move can also capture a bigger line, and more than one lines at a time
        You're playing light here.<br/><br/>
        Play on the bottom left to see an example.`,
        new ReversiPartSlice([
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, X, _, _, _],
            [_, _, _, O, _, _, _, _],
            [_, _, O, _, _, _, _, _],
            [O, O, _, _, _, _, _, _],
            [_, O, X, O, X, O, _, _],
        ], 1),
        [new ReversiMove(0, 7)],
        $localize`Congratulations!`,
        $localize`Lower and more to the left, please.`,
    ),
    TutorialStep.informational(
        $localize`Passing a turn`,
        $localize`If, during its turn, a player has no move that would allow that player to flip a piece, that player must pass
        Moreover, if the next player could not play neither, the game ends before the board is full, and points are counted in the usual way.`,
        new ReversiPartSlice([
            [X, O, O, O, O, O, X, O],
            [O, X, X, X, X, X, X, O],
            [O, X, X, X, X, X, X, O],
            [O, X, X, X, X, X, X, O],
            [O, X, X, X, X, X, X, O],
            [O, X, X, X, X, X, X, O],
            [X, X, X, X, X, X, _, _],
            [O, O, O, O, O, O, _, _],
        ], 60),
    ),
];
