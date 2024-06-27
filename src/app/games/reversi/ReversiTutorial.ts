import { ReversiMove } from 'src/app/games/reversi/ReversiMove';
import { ReversiState } from 'src/app/games/reversi/ReversiState';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { Tutorial, TutorialStep } from '../../components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { ReversiConfig, ReversiRules } from './ReversiRules';
import { MGPOptional } from '@everyboard/lib';
import { TutorialStepMessage } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStepMessage';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;
const defaultConfig: MGPOptional<ReversiConfig> = ReversiRules.get().getDefaultRulesConfig();

export class ReversiTutorial extends Tutorial {
    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            TutorialStepMessage.OBJECT_OF_THE_GAME(),
            $localize`At Reversi, the pieces are double sided: one dark side for the first player, one light side for the second player.
        When one piece is flipped, its owner changes.
        The player owning the most pieces at the end of the game wins.
        Here, Dark has 28 points and Light has 36, hence Light wins.`,
            new ReversiState([
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
            $localize`Captures (1/2)`,
            $localize`At the beginning of the game, pieces are placed as shown here.
        For a move to be legal, it must sandwich at least one piece of the opponent between the piece you're putting and another of your pieces.<br/><br/>
        Do any move by clicking to put your piece
        Dark plays first.`,
            ReversiRules.get().getInitialState(defaultConfig),
            new ReversiMove(2, 4),
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.fromMove(
            $localize`Captures (2/2)`,
            $localize`A move can also capture a bigger line, and more than one line at a time<br/><br/>You're playing Light here. Play on the bottom left to see a capture.`,
            new ReversiState([
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
            TutorialStepMessage.CONGRATULATIONS(),
            $localize`Lower and more to the left, please.`,
        ),
        TutorialStep.informational(
            $localize`Passing a turn`,
            $localize`If, during its turn, a player has no move that would allow that player to flip a piece, that player must pass
        Moreover, if the next player could not play neither, the game ends before the board is full, and points are counted in the usual way.`,
            new ReversiState([
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
}
