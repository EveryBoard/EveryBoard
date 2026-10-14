import { RulesConfig } from '@everyboard/games';


export type ModeConfig = RulesConfig & {

    offsetRatio: number;

    horizontalWidthRatio: number;

    pieceHeightRatio: number;

    parallelogramHeight: number;

};
