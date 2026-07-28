import { MGPOptional } from '@everyboard/lib';

import { BooleanConfig, NumberConfig, RulesConfigDescription, RulesConfigDescriptionLocalizable } from '../../../components/wrapper-components/rules-configuration/RulesConfigDescription';
import { Coord } from '../../../jscaip/Coord';
import { Player } from '../../../jscaip/Player';
import { TableUtils } from '../../../jscaip/TableUtils';
import { MGPValidators } from '../../../utils/MGPValidator';
import { MancalaCaptureResult, MancalaDistributionResult, MancalaDropResult, MancalaRules } from '../common/MancalaRules';
import { MancalaState } from '../common/MancalaState';

import { BaAwaConfig } from './BaAwaConfig';

export class BaAwaRules extends MancalaRules<BaAwaConfig> {

    private static singleton: MGPOptional<BaAwaRules> = MGPOptional.empty();

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<BaAwaConfig> =
        new RulesConfigDescription<BaAwaConfig>({
            name: (): string => $localize`Ba-awa`,
            config: {
                feedOriginalHouse: new BooleanConfig(true, MancalaRules.FEED_ORIGINAL_HOUSE),
                mustFeed: new BooleanConfig(false, MancalaRules.MUST_FEED),
                passByPlayerStore: new BooleanConfig(false, MancalaRules.PASS_BY_PLAYER_STORE),
                mustContinueDistributionAfterStore: new BooleanConfig(false, MancalaRules.MULTIPLE_SOW),
                continueLapUntilCaptureOrEmptyHouse: new BooleanConfig(true, MancalaRules.CYCLICAL_LAP),
                seedsByHouse: new NumberConfig(4, MancalaRules.SEEDS_BY_HOUSE, MGPValidators.range(1, 99)),
                width: new NumberConfig(6, RulesConfigDescriptionLocalizable.WIDTH, MGPValidators.range(1, 99)),
                numberOfRows: new NumberConfig(1, MancalaRules.NUMBER_OF_ROWS, MGPValidators.range(1, 99)),
                splitFinalSeedsEvenly: new BooleanConfig(false, () => $localize`Split final seeds evenly`),
            },
        }, [{
            name: (): string => $localize`Even Ba-awa`,
            config: {
                feedOriginalHouse: true,
                mustFeed: false,
                passByPlayerStore: false,
                mustContinueDistributionAfterStore: false,
                continueLapUntilCaptureOrEmptyHouse: true,
                seedsByHouse: 4,
                width: 6,
                numberOfRows: 1,
                splitFinalSeedsEvenly: true,
            },
        }]);

    public static get(): BaAwaRules {
        if (BaAwaRules.singleton.isAbsent()) {
            BaAwaRules.singleton = MGPOptional.of(new BaAwaRules([4]));
        }
        return BaAwaRules.singleton.get();
    }

    public override getRulesConfigDescription(): RulesConfigDescription<BaAwaConfig> {
        return BaAwaRules.RULES_CONFIG_DESCRIPTION;
    }

    public override applyCapture(distributionResult: MancalaDistributionResult)
    : MancalaCaptureResult
    {
        const captureMap: number[][] = TableUtils.copy(distributionResult.captureMap);
        const lastDrop: Coord = distributionResult.filledCoords[distributionResult.filledCoords.length - 1];
        if (distributionResult.endsUpInStore === false) {
            const lastHouseContent: number = distributionResult.resultingState.getPieceAt(lastDrop);
            if (this.isCapturableValue(lastHouseContent)) {
                const currentPlayer: Player = distributionResult.resultingState.getCurrentPlayer();
                distributionResult.capturedSum += lastHouseContent;
                captureMap[lastDrop.y][lastDrop.x] += lastHouseContent;
                distributionResult.resultingState =
                    distributionResult.resultingState.capture(currentPlayer, lastDrop);
            }
        }
        return {
            capturedSum: distributionResult.capturedSum,
            captureMap,
            resultingState: distributionResult.resultingState,
        };
    }

    public override getDropResult(seedsInHand: number, state: MancalaState, coord: Coord)
    : MancalaDropResult
    {
        let resultingState: MancalaState = state.feed(coord);
        const previousValue: number = resultingState.getPieceAt(coord);
        const captureMap: number[][] = TableUtils.create(state.getWidth(), state.getHeight(), 0);
        if (this.isCapturableValue(previousValue) && seedsInHand > 1) {
            captureMap[coord.y][coord.x] = previousValue;
            const houseOwner: Player = Player.of(coord.y).getOpponent();
            resultingState = resultingState.capture(houseOwner, coord);
            return { capturedSum: previousValue, captureMap, resultingState };
        } else {
            return { capturedSum: 0, captureMap, resultingState };
        }
    }

    public override mustMonsoon(postCaptureState: MancalaState, config: BaAwaConfig): Player[] {
        const mustMonsoon: Player[] = super.mustMonsoon(postCaptureState, config);
        if (mustMonsoon.length > 0) {
            return mustMonsoon;
        } else {
            if (postCaptureState.getTotalRemainingSeeds() <= 8) { // TODO: why the hardcoded numbar ?
                if (config.splitFinalSeedsEvenly) {
                    return [Player.ZERO, Player.ONE];
                } else {
                    return [Player.ZERO];
                }
            } else {
                return [];
            }
        }
    }

}
