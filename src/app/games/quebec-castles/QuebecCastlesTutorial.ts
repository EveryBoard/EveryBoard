import { MGPOptional } from '@everyboard/lib';

import { Tutorial, TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { TutorialStepMessage } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStepMessage';
import { DropModeEnum, QuebecCastlesConfig, QuebecCastlesRules } from './QuebecCastlesRules';
import { QuebecCastlesMove } from './QuebecCastlesMove';
import { Coord } from 'src/app/jscaip/Coord';
import { PlayerMap } from 'src/app/jscaip/PlayerMap';

const defaultConfig: MGPOptional<QuebecCastlesConfig> = QuebecCastlesRules.get().getDefaultRulesConfig();
const defaultThrones: PlayerMap<MGPOptional<Coord>> = PlayerMap.ofValues(
    MGPOptional.of(new Coord(8, 8)),
    MGPOptional.of(new Coord(0, 0)),
);
defaultThrones.makeImmutable();
const rectangularWidthHeightConfig: MGPOptional<QuebecCastlesConfig> = MGPOptional.of({
    ...defaultConfig.get(),
    height: 12,
    width: 14,
    isRhombic: false,
});
const placeThroneYourselfConfig: MGPOptional<QuebecCastlesConfig> = MGPOptional.of({
    ...defaultConfig.get(),
    placeThroneYourself: true,
});
const dropByBatchConfig: MGPOptional<QuebecCastlesConfig> = MGPOptional.of({
    ...defaultConfig.get(),
    dropMode: DropModeEnum.BY_BATCH,
});
const dropPieceByPieceConfig: MGPOptional<QuebecCastlesConfig> = MGPOptional.of({
    ...defaultConfig.get(),
    dropMode: DropModeEnum.PIECE_BY_PIECE,
});
const numberOfPieceAndTerritorySizeConfig: MGPOptional<QuebecCastlesConfig> = MGPOptional.of({
    ...defaultConfig.get(),
    linesForTerritory: 3,
    dropMode: DropModeEnum.PIECE_BY_PIECE,
    defender: 2,
    invader: 5,
});

export class QuebecCastlesTutorial extends Tutorial {
    public tutorial: TutorialStep[] = [
        TutorialStep.informational(
            TutorialStepMessage.INITIAL_BOARD_AND_OBJECT_OF_THE_GAME(),
            $localize`Quebec Castles is the first board game invented by the EveryBoard Team.<br/>The goal of the game is to capture all opponent piece, or to step on the opponent's throne. The thrones are by default on the corners.`,
            QuebecCastlesRules.get().getInitialState(defaultConfig),
        ),
        TutorialStep.anyMove(
            $localize`Defender's move`,
            $localize`The defenders have the Dark pieces, they play first by selecting one of their pieces and moving it on a neighbor square.<br/>You're playing Light, move a defender piece.`,
            QuebecCastlesRules.get().getInitialState(defaultConfig),
            QuebecCastlesMove.translation(new Coord(7, 7), new Coord(6, 6)),
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.anyMove(
            $localize`Invader's move`,
            $localize`The invaders have the Light piece, they play second by selecting one of their piece and moving them two step in a straight line. The piece cannot jump over another piece.<br/>Move an invader piece.`,
            QuebecCastlesRules.get().getInitialState(defaultConfig).incrementTurn(),
            QuebecCastlesMove.translation(new Coord(2, 2), new Coord(4, 4)),
            TutorialStepMessage.CONGRATULATIONS_YOU_KNOW_EVERYTHING(),
        ),
        // 5.a configurations alternatives: rectangulaire & width & height
        TutorialStep.informational(
            $localize`Custom config: Rhombic, width, height`,
            $localize`You have the option to change the shape of the board, if it's not rhombic, it's rectangular. You also can change the size`,
            {
                state: QuebecCastlesRules.get().getInitialState(rectangularWidthHeightConfig),
                config: rectangularWidthHeightConfig.get(),
            },
        ),
        TutorialStep.anyMove(
            $localize`Custom config: place throne yourself`,
            $localize`You have the option to change decide yourself where you place the throne. If you don't change anything else the piece placement will be automatically done right after.<br/>You're playing Dark/Defender, place your throne.`,
            {
                state: QuebecCastlesRules.get().getInitialState(placeThroneYourselfConfig),
                config: placeThroneYourselfConfig.get(),
            },
            QuebecCastlesMove.drop([new Coord(7, 7)]),
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.anyMove(
            $localize`Custom config: Drop Mode: By Batch`,
            $localize`You have the option to decide yourself where you place your pieces.`,
            {
                state: QuebecCastlesRules.get().getInitialState(dropByBatchConfig),
                config: dropByBatchConfig.get(),
            },
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
        ),
        TutorialStep.anyMove(
            $localize`Custom config: Drop Mode: Piece by piece`,
            $localize`You have the option to decide yourself where you place your pieces, one per turn. Once one player has no more piece to drop, the other player drop all its piece in one turn.<br/>You're playing Dark/Defender, drop a piece.`,
            {
                state: QuebecCastlesRules.get().getInitialState(dropPieceByPieceConfig),
                config: dropPieceByPieceConfig.get(),
            },
            QuebecCastlesMove.drop([new Coord(7, 7)]),
            TutorialStepMessage.CONGRATULATIONS(),
        ),
        TutorialStep.informational(
            $localize`Custom config: Number of piece & territory size`,
            $localize`You have the option to change territory size, which is the number of line on which you can drop your pieces, it's indicated by a semi-transparent color. You can also change how many pieces each player control.`,
            {
                state: QuebecCastlesRules.get().getInitialState(numberOfPieceAndTerritorySizeConfig),
                config: numberOfPieceAndTerritorySizeConfig.get(),
            },
        ),
    ];
}
