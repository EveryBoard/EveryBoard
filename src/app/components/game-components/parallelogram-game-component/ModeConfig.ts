import { RulesConfig } from '../../../jscaip/RulesConfigUtil';


export type ModeConfig = RulesConfig & {

    offsetRatio: number;

    horizontalWidthRatio: number;

    pieceHeightRatio: number;

    parallelogramHeight: number;

};
