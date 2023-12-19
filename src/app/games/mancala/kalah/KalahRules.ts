import { MancalaState } from './../common/MancalaState';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MancalaCaptureResult, MancalaDistributionResult, MancalaRules } from '../common/MancalaRules';
import { Coord } from 'src/app/jscaip/Coord';
import { TableUtils } from 'src/app/utils/ArrayUtils';
import { MancalaConfig } from '../common/MancalaConfig';
import { BooleanConfig, NumberConfig, RulesConfigDescription, RulesConfigDescriptionLocalizable } from 'src/app/components/wrapper-components/rules-configuration/RulesConfigDescription';
import { MGPValidators } from 'src/app/utils/MGPValidator';

export class KalahRules extends MancalaRules {

    private static singleton: MGPOptional<KalahRules> = MGPOptional.empty();

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<MancalaConfig> =
        new RulesConfigDescription<MancalaConfig>({
            name: (): string => $localize`Awalé`,
            config: {
                feedOriginalHouse: new BooleanConfig(true, MancalaRules.FEED_ORIGINAL_HOUSE),
                mustFeed: new BooleanConfig(false, MancalaRules.MUST_FEED),
                passByPlayerStore: new BooleanConfig(true, MancalaRules.PASS_BY_PLAYER_STORE),
                mustContinueDistributionAfterStore: new BooleanConfig(true, MancalaRules.MULTIPLE_SOW),
                seedsByHouse: new NumberConfig(4, MancalaRules.SEEDS_BY_HOUSE, MGPValidators.range(1, 99)),
                width: new NumberConfig(6, RulesConfigDescriptionLocalizable.WIDTH, MGPValidators.range(1, 99)),
            },
        });

    public static get(): KalahRules {
        if (KalahRules.singleton.isAbsent()) {
            KalahRules.singleton = MGPOptional.of(new KalahRules());
        }
        return KalahRules.singleton.get();
    }

    public override getRulesConfigDescription(): MGPOptional<RulesConfigDescription<MancalaConfig>> {
        return MGPOptional.of(KalahRules.RULES_CONFIG_DESCRIPTION);
    }

    public applyCapture(distributionResult: MancalaDistributionResult): MancalaCaptureResult {
        const distributedState: MancalaState = distributionResult.resultingState;
        const capturelessResult: MancalaCaptureResult = {
            capturedSum: 0,
            captureMap: [
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
            ],
            resultingState: distributedState,
        };
        if (distributionResult.endsUpInStore) {
            return capturelessResult;
        } else {
            const landingSpace: Coord = distributionResult.filledCoords[distributionResult.filledCoords.length - 1];
            const playerY: number = distributionResult.resultingState.getCurrentPlayerY();
            const opponentY: number = distributionResult.resultingState.getOpponentY();
            const landingSeeds: number = distributionResult.resultingState.getPieceAt(landingSpace);
            const parallelSeeds: number = distributionResult.resultingState.getPieceAtXY(landingSpace.x, opponentY);
            if (landingSpace.y === playerY && landingSeeds === 1 && parallelSeeds > 0) {
                // We can capture
                const board: number[][] = distributedState.getCopiedBoard();
                const capturedSum: number = board[0][landingSpace.x] + board[1][landingSpace.x];
                const captureMap: number[][] = TableUtils.create(distributedState.getWidth(), 2, 0);
                captureMap[0][landingSpace.x] = board[0][landingSpace.x];
                captureMap[1][landingSpace.x] = board[1][landingSpace.x];
                board[0][landingSpace.x] = 0;
                board[1][landingSpace.x] = 0;
                const captured: [number, number] = distributedState.getScoresCopy();
                captured[distributedState.getCurrentPlayer().value] += capturedSum;
                const postCaptureState: MancalaState = new MancalaState(board,
                                                                        distributedState.turn,
                                                                        captured);
                return {
                    capturedSum, captureMap, resultingState: postCaptureState,
                };
            } else {
                return capturelessResult;
            }
        }
    }

}
