import { MancalaState } from './../common/MancalaState';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MancalaCaptureResult, MancalaDistributionResult, MancalaRules } from '../common/MancalaRules';
import { Coord } from 'src/app/jscaip/Coord';
import { TableUtils } from 'src/app/utils/ArrayUtils';
import { MancalaConfig } from '../common/MancalaConfig';
import { RulesConfigDescription, RulesConfigDescriptionLocalizable } from 'src/app/components/wrapper-components/rules-configuration/RulesConfigDescription';
import { MGPValidators } from 'src/app/utils/MGPValidator';

export class KalahRules extends MancalaRules {

    private static singleton: MGPOptional<KalahRules> = MGPOptional.empty();

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<MancalaConfig> = new RulesConfigDescription(
        {
            name: (): string => $localize`Kalah`,
            config: {
                feedOriginalHouse: true,
                mustFeed: false,
                passByPlayerStore: true,
                mustContinueDistributionAfterStore: true,
                seedsByHouse: 4,
                width: 6,
            },
        }, {
            width: RulesConfigDescriptionLocalizable.WIDTH,
            seedsByHouse: (): string => $localize`Seed by house`,
            feedOriginalHouse: (): string => $localize`Feed original house`,
            mustFeed: (): string => $localize`Must feed`,
            passByPlayerStore: (): string => $localize`Pass by player store`,
            mustContinueDistributionAfterStore: (): string => $localize`Must continue distribution after last seed ends in store`,
        }, [
        ], {
            width: MGPValidators.range(1, 99),
            seedsByHouse: MGPValidators.range(1, 99),
        });

    public static get(): KalahRules {
        if (KalahRules.singleton.isAbsent()) {
            KalahRules.singleton = MGPOptional.of(new KalahRules());
        }
        return KalahRules.singleton.get();
    }

    public override getRulesConfigDescription(): RulesConfigDescription<MancalaConfig> {
        return KalahRules.RULES_CONFIG_DESCRIPTION;
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
                                                                        captured,
                                                                        distributedState.config);
                return {
                    capturedSum, captureMap, resultingState: postCaptureState,
                };
            } else {
                return capturelessResult;
            }
        }
    }

}
