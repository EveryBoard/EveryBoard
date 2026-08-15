import { RulesConfig } from 'src/app/jscaip/RulesConfigUtil';


export type ModeConfig = RulesConfig & {

    offsetRatio: number;

    horizontalWidthRatio: number;

    pieceHeightRatio: number;

    parallelogramHeight: number;

};
