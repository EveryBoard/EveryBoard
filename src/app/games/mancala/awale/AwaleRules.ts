import { MancalaState } from '../common/MancalaState';
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MancalaCaptureResult, MancalaDistributionResult, MancalaRules } from '../common/MancalaRules';
import { Utils } from 'src/app/utils/utils';
import { MancalaConfig } from '../common/MancalaConfig';
import { MGPValidators } from 'src/app/utils/MGPValidator';
import { BooleanConfig, NumberConfig, RulesConfigDescription, RulesConfigDescriptionLocalizable } from 'src/app/components/wrapper-components/rules-configuration/RulesConfigDescription';
import { TableUtils } from 'src/app/utils/ArrayUtils';

export class AwaleRules extends MancalaRules {

    private static singleton: MGPOptional<AwaleRules> = MGPOptional.empty();

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<MancalaConfig> =
        new RulesConfigDescription<MancalaConfig>({
            name: (): string => $localize`Awalé`,
            config: {
                feedOriginalHouse: new BooleanConfig(false, MancalaRules.FEED_ORIGINAL_HOUSE),
                mustFeed: new BooleanConfig(true, MancalaRules.MUST_FEED),
                passByPlayerStore: new BooleanConfig(false, MancalaRules.PASS_BY_PLAYER_STORE),
                mustContinueDistributionAfterStore: new BooleanConfig(false, MancalaRules.MULTIPLE_SOW),
                continueLapUntilCaptureOrEmptyHouse: new BooleanConfig(false, MancalaRules.CYCLICAL_LAP),
                seedsByHouse: new NumberConfig(4, MancalaRules.SEEDS_BY_HOUSE, MGPValidators.range(1, 99)),
                width: new NumberConfig(6, RulesConfigDescriptionLocalizable.WIDTH, MGPValidators.range(1, 99)),
            },
        });

    public static get(): AwaleRules {
        if (AwaleRules.singleton.isAbsent()) {
            AwaleRules.singleton = MGPOptional.of(new AwaleRules([2, 3]));
        }
        return AwaleRules.singleton.get();
    }

    public override getRulesConfigDescription(): MGPOptional<RulesConfigDescription<MancalaConfig>> {
        return MGPOptional.of(AwaleRules.RULES_CONFIG_DESCRIPTION);
    }

    public applyCapture(distributionResult: MancalaDistributionResult, config: MancalaConfig): MancalaCaptureResult {
        const filledCoords: Coord[] = distributionResult.filledCoords;
        const landingCoord: Coord = filledCoords[filledCoords.length - 1];
        const resultingState: MancalaState = distributionResult.resultingState;
        return this.captureIfLegal(landingCoord.x, landingCoord.y, resultingState, config);
    }

    /**
     * Only called if y and player are not equal.
     * If the condition to make a capture into the opponent's side are met
     * Captures and return the number of captured
     * Captures even if this could mean doing an illegal starvation
     */
    private capture(x: number, y: number, state: MancalaState, config: MancalaConfig): MancalaCaptureResult {
        const playerY: number = state.getCurrentPlayerY();
        Utils.assert(y !== playerY, 'AwaleRules.capture cannot capture the players house');
        let resultingState: MancalaState = state;
        let target: MGPOptional<number> = resultingState.getOptionalPieceAtXY(x, y);
        let capturedSum: number = 0;
        const captureMap: number[][] = TableUtils.create(config.width, 2, 0);
        if ((target.get() < 2) || (target.get() > 3)) {
            // first space not capturable, we apply no change
            return { capturedSum: 0, captureMap, resultingState: state };
        }

        let direction: number = -1; // by defaut, capture from right to left
        let limit: number = -1;
        const player: Player = state.getCurrentPlayer();
        if (player === Player.ONE) {
            /** if Player.ONE capture, it is on the bottom line
             * means capture goes from left to right ( + 1)
             * so one ending condition of the loop is reaching index MancalaState.WIDTH
             */
            direction = +1;
            limit = state.getWidth();
        }
        do {
            captureMap[y][x] = target.get(); // we addPart to the player score the captured seeds
            capturedSum += target.get();
            resultingState = resultingState.capture(player, new Coord(x, y));
            x += direction;
            target = resultingState.getOptionalPieceAtXY(x, y);
        } while ((x !== limit) && (target.equalsValue(2) || target.equalsValue(3)));

        return { capturedSum, captureMap, resultingState };
    }

    public captureIfLegal(x: number, y: number, state: MancalaState, config: MancalaConfig): MancalaCaptureResult {
        const player: Player = state.getCurrentPlayer();
        const captureLessResult: MancalaCaptureResult = {
            capturedSum: 0,
            resultingState: state, // Apply no capture
            captureMap: TableUtils.create(state.getWidth(), 2, 0),
        };
        if (y === player.getValue()) {
            const captureResult: MancalaCaptureResult = this.capture(x, y, state, config);
            const isStarving: boolean = MancalaRules.isStarving(player.getOpponent(),
                                                                captureResult.resultingState.board);
            if (captureResult.capturedSum > 0 && isStarving) {
                /* if the distribution would capture all seeds
                 * the capture is forbidden and cancelled
                 */
                return captureLessResult;
            } else {
                return captureResult;
            }
        } else {
            return captureLessResult;
        }
    }

}
