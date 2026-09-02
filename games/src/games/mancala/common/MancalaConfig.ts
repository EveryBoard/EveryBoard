import { RulesConfig } from '../../../config/RulesConfig';

export type MancalaConfig = RulesConfig & {

    readonly width: number;

    readonly seedsByHouse: number;

    readonly passByPlayerStore: boolean;

    readonly mustContinueDistributionAfterStore: boolean;

    readonly mustFeed: boolean;

    readonly feedOriginalHouse: boolean; // If, when you have 12 seeds, the 12th must be dropped in the original house

    readonly continueLapUntilCaptureOrEmptyHouse: boolean;

    readonly numberOfRows: number;
};
