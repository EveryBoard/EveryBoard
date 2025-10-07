import { MGPOptional } from '@everyboard/lib';

import { Tutorial, TutorialStep } from '../../../app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { TutorialStepMessage } from '../../../app/components/wrapper-components/tutorial-game-wrapper/TutorialStepMessage';
import { QuebecCastlesConfig, QuebecCastlesRules } from './QuebecCastlesRules';
import { QuebecCastlesMove } from './QuebecCastlesMove';
import { Coord } from '../../../app/jscaip/Coord';

const defaultConfig: MGPOptional<QuebecCastlesConfig> = QuebecCastlesRules.get().getDefaultRulesConfig();
const rectangularWidthHeightConfig: MGPOptional<QuebecCastlesConfig> = MGPOptional.of<QuebecCastlesConfig>({
    ...defaultConfig.get(),
    height: 12,
    width: 14,
    isRhombic: false,
});
const playersPlaceCastleConfig: MGPOptional<QuebecCastlesConfig> = MGPOptional.of<QuebecCastlesConfig>({
    ...defaultConfig.get(),
    playersPlaceCastle: true,
});
const dropByBatchConfig: MGPOptional<QuebecCastlesConfig> = MGPOptional.of<QuebecCastlesConfig>({
    ...defaultConfig.get(),
    dropMode: 'BY_BATCH',
});
const dropPieceByPieceConfig: MGPOptional<QuebecCastlesConfig> = MGPOptional.of<QuebecCastlesConfig>({
    ...defaultConfig.get(),
    dropMode: 'PIECE_BY_PIECE',
});
const numberOfPieceAndTerritorySizeConfig: MGPOptional<QuebecCastlesConfig> = MGPOptional.of<QuebecCastlesConfig>({
    ...defaultConfig.get(),
    linesForTerritory: 3,
    dropMode: 'PIECE_BY_PIECE',
    defenders: 2,
    invaders: 5,
});

export class QuebecCastlesTutorial extends Tutorial {
    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            TutorialStepMessage.INITIAL_BOARD_AND_OBJECT_OF_THE_GAME(),
            $localize`Quebec Castles is the first board game invented by the EveryBoard Team.<br/>The goal of the game is to capture all the pieces of the opponent, or to step on the opponent's castle. The castles are on the corners by default.`,
            QuebecCastlesRules.get().getInitialState(defaultConfig),
        ),
        TutorialStep.anyMove(
            $localize`Defender's move`,
            $localize`The defenders have the dark pieces, they play first by selecting one of their pieces and moving it on a neighboring square.<br/><br/>You're playing Dark, move a defender piece.`,
            QuebecCastlesRules.get().getInitialState(defaultConfig),
            QuebecCastlesMove.translation(new Coord(7, 7), new Coord(6, 6)),
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.anyMove(
            $localize`Invader's move`,
            $localize`The invaders have the light pieces, they play second by selecting one of their piece and moving them two step in a straight line. A piece cannot jump over another piece.<br/><br/>Move an invader piece.`,
            QuebecCastlesRules.get().getInitialState(defaultConfig).incrementTurn(),
            QuebecCastlesMove.translation(new Coord(2, 2), new Coord(4, 4)),
            TutorialStepMessage.CONGRATULATIONS_YOU_KNOW_EVERYTHING(),
        ),
        // 5.a configurations alternatives: rectangulaire & width & height
        TutorialStep.informational(
            $localize`Custom config: rhombic, width, height`,
            $localize`You have the option to change the shape of the board, if it's not rhombic, it's rectangular. You also can change the size`,
            QuebecCastlesRules.get().getInitialState(rectangularWidthHeightConfig),
            rectangularWidthHeightConfig,
        ),
        TutorialStep.anyMove(
            $localize`Custom config: place castle yourself`,
            $localize`You have the option to decide yourself where you place the castle. If you don't change anything else the piece placement will be automatically done right after.<br/><br/>You're playing Dark/Defender, place your castle.`,
            QuebecCastlesRules.get().getInitialState(playersPlaceCastleConfig),
            QuebecCastlesMove.drop([new Coord(7, 7)]),
            TutorialStepMessage.CONGRATULATIONS(),
            playersPlaceCastleConfig,
        ),
        TutorialStep.anyMove(
            $localize`Custom config: drop mode: by batch`,
            $localize`You have the option to decide yourself where you place your pieces.<br/><br/>You're playing Dark/Defender, place all your pieces.`,
            QuebecCastlesRules.get().getInitialState(dropByBatchConfig),
            QuebecCastlesMove.drop([
                new Coord(4, 8),
                new Coord(5, 7),
                new Coord(6, 6),
                new Coord(7, 5),
                new Coord(8, 4),
                new Coord(5, 8),
                new Coord(6, 7),
                new Coord(7, 6),
                new Coord(8, 5),
            ]),
            TutorialStepMessage.CONGRATULATIONS(),
            dropByBatchConfig,
        ),
        TutorialStep.anyMove(
            $localize`Custom config: drop mode: piece by piece`,
            $localize`You have the option to decide yourself where you place your pieces, one per turn. Once one player has no more piece to drop, the other player drop all its piece in one turn.<br/><br/>You're playing Dark/Defender, drop a piece.`,
            QuebecCastlesRules.get().getInitialState(dropPieceByPieceConfig),
            QuebecCastlesMove.drop([new Coord(7, 7)]),
            TutorialStepMessage.CONGRATULATIONS(),
            dropPieceByPieceConfig,
        ),
        TutorialStep.informational(
            $localize`Custom config: number of piece & territory size`,
            $localize`You have the option to change territory size, which is the number of lines on which you can drop your pieces. It is indicated by a semi-transparent color. You can also change how many pieces each player control.`,
            QuebecCastlesRules.get().getInitialState(numberOfPieceAndTerritorySizeConfig),
            numberOfPieceAndTerritorySizeConfig,
        ),
    ];
}
