import { BooleanConfig, NumberConfig, RulesConfigDescription, RulesConfigDescriptionLocalizable } from 'src/app/components/wrapper-components/rules-configuration/RulesConfigDescription';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { BaAwaConfig } from './BaAwaConfig';
import { MancalaCaptureResult, MancalaDistributionResult, MancalaDropResult, MancalaRules } from '../common/MancalaRules';
import { MGPValidators } from 'src/app/utils/MGPValidator';
import { TableUtils } from 'src/app/utils/ArrayUtils';
import { MancalaState } from '../common/MancalaState';
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';

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
                splitFinalSeedsEvenly: true,
            },
        }]);

    public static get(): BaAwaRules {
        if (BaAwaRules.singleton.isAbsent()) {
            BaAwaRules.singleton = MGPOptional.of(new BaAwaRules([4]));
        }
        return BaAwaRules.singleton.get();
    }

    public override getRulesConfigDescription(): MGPOptional<RulesConfigDescription<BaAwaConfig>> {
        return MGPOptional.of(BaAwaRules.RULES_CONFIG_DESCRIPTION);
    }

    public override applyCapture(distributionResult: MancalaDistributionResult)
    : MancalaCaptureResult
    {
        const captureMap: number[][] = TableUtils.copy(distributionResult.captureMap);
        const lastDrop: Coord = distributionResult.filledCoords[distributionResult.filledCoords.length - 1];
        const captureIsPossible: boolean =
            distributionResult.endsUpInStore === false &&
            distributionResult.resultingState.getPieceAt(lastDrop) === 4;
        if (captureIsPossible) {
            const currentPlayer: Player = distributionResult.resultingState.getCurrentPlayer();
            distributionResult.capturedSum += 4;
            captureMap[lastDrop.y][lastDrop.x] += 4;
            distributionResult.resultingState =
                distributionResult.resultingState.capture(currentPlayer, lastDrop);
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
        const captureMap: number[][] = TableUtils.create(state.getWidth(), 2, 0);
        if (previousValue === 4 && seedsInHand > 1) {
            captureMap[coord.y][coord.x] = 4;
            const houseOwner: Player = Player.of(coord.y).getOpponent();
            resultingState = resultingState.capture(houseOwner, coord);
            return { capturedSum: 4, captureMap, resultingState };
        } else {
            return { capturedSum: 0, captureMap, resultingState };
        }
    }

    public override mustMonsoon(postCaptureState: MancalaState, config: BaAwaConfig): Player[] {
        const mustMonsoon: Player[] = super.mustMonsoon(postCaptureState, config);
        if (mustMonsoon.length > 0) {
            return mustMonsoon;
        } else {
            if (postCaptureState.getTotalRemainingSeeds() <= 8) {
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
