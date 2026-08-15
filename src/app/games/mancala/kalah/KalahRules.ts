
import { BooleanConfig } from 'src/app/components/wrapper-components/rules-configuration/BooleanConfig';
import { NumberConfig } from 'src/app/components/wrapper-components/rules-configuration/NumberConfig';
import { RulesConfigDescriptionLocalizable } from 'src/app/components/wrapper-components/rules-configuration/RulesConfigDescriptionLocalizable';

import { MGPOptional } from '@everyboard/lib';

import { RulesConfigDescription } from '../../../components/wrapper-components/rules-configuration/RulesConfigDescription';
import { Coord } from '../../../jscaip/Coord';
import { Player } from '../../../jscaip/Player';
import { TableUtils } from '../../../jscaip/TableUtils';
import { MGPValidators } from '../../../utils/MGPValidator';
import { MancalaConfig } from '../common/MancalaConfig';
import { MancalaCaptureResult, MancalaDistributionResult, MancalaRules } from '../common/MancalaRules';
import { MancalaState } from '../common/MancalaState';

export class KalahRules extends MancalaRules {

    private static singleton: MGPOptional<KalahRules> = MGPOptional.empty();

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<MancalaConfig> =
        new RulesConfigDescription<MancalaConfig>({
            name: (): string => $localize`Kalah`,
            config: {
                feedOriginalHouse: new BooleanConfig(true, MancalaRules.FEED_ORIGINAL_HOUSE),
                mustFeed: new BooleanConfig(false, MancalaRules.MUST_FEED),
                passByPlayerStore: new BooleanConfig(true, MancalaRules.PASS_BY_PLAYER_STORE),
                mustContinueDistributionAfterStore: new BooleanConfig(true, MancalaRules.MULTIPLE_SOW),
                continueLapUntilCaptureOrEmptyHouse: new BooleanConfig(false, MancalaRules.CYCLICAL_LAP),
                seedsByHouse: new NumberConfig(4, MancalaRules.SEEDS_BY_HOUSE, MGPValidators.range(1, 99)),
                width: new NumberConfig(6, RulesConfigDescriptionLocalizable.WIDTH, MGPValidators.range(1, 99)),
                numberOfRows: new NumberConfig(1, MancalaRules.NUMBER_OF_ROWS, MGPValidators.range(1, 99)),
            },
        });

    public static get(): KalahRules {
        if (KalahRules.singleton.isAbsent()) {
            KalahRules.singleton = MGPOptional.of(new KalahRules([]));
        }
        return KalahRules.singleton.get();
    }

    public override getRulesConfigDescription(): RulesConfigDescription<MancalaConfig> {
        return KalahRules.RULES_CONFIG_DESCRIPTION;
    }

    public applyCapture(distributionResult: MancalaDistributionResult,
                        config: MancalaConfig,
    ): MancalaCaptureResult {
        const distributedState: MancalaState = distributionResult.resultingState;
        const capturelessResult: MancalaCaptureResult = {
            capturedSum: 0,
            captureMap: TableUtils.create(
                distributedState.getWidth(),
                distributedState.getHeight(),
                0,
            ),
            resultingState: distributedState,
        };
        if (distributionResult.endsUpInStore) {
            return capturelessResult;
        } else {
            const landingSpace: Coord = distributionResult.filledCoords[distributionResult.filledCoords.length - 1];
            const currentPlayer: Player = distributionResult.resultingState.getCurrentPlayer();
            const oppositeY: number = this.getOppositeY(landingSpace, config);
            const landingSeeds: number = distributionResult.resultingState.getPieceAt(landingSpace);
            const parallelSeeds: number = distributionResult.resultingState.getPieceAtXY(landingSpace.x, oppositeY);
            if (this.getSpaceOwner(landingSpace, config) === currentPlayer && landingSeeds === 1 && parallelSeeds > 0) {
                // We can capture
                const board: number[][] = distributedState.getCopiedBoard();
                const capturedSum: number = board[0][landingSpace.x] + board[1][landingSpace.x];
                const captureMap: number[][] = TableUtils.create(
                    distributedState.getWidth(),
                    distributedState.getHeight(),
                    0,
                );
                captureMap[landingSpace.y][landingSpace.x] = board[landingSpace.y][landingSpace.x];
                captureMap[oppositeY][landingSpace.x] = board[oppositeY][landingSpace.x];
                const capturer: Player = distributedState.getCurrentPlayer();
                let postCaptureState: MancalaState = distributedState.capture(capturer, landingSpace);
                const oppositeSpace: Coord = new Coord(landingSpace.x, oppositeY);
                postCaptureState = postCaptureState.capture(capturer, oppositeSpace);
                return {
                    capturedSum, captureMap, resultingState: postCaptureState,
                };
            } else {
                return capturelessResult;
            }
        }
    }

}
