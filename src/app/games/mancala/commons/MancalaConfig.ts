export interface MancalaConfig {

    readonly passByPlayerStore: boolean;

    readonly mustFeed: boolean;

    readonly feedOriginalHouse: boolean; // If, when you have 12 seeds, the 12th must be dropped in the original house
}
