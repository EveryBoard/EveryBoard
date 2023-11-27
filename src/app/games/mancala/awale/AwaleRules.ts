import { MancalaState } from '../common/MancalaState';
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MancalaCaptureResult, MancalaDistributionResult, MancalaRules } from '../common/MancalaRules';
import { Utils } from 'src/app/utils/utils';
import { MancalaConfig } from '../common/MancalaConfig';
import { MGPValidators } from 'src/app/utils/MGPValidator';
import { RulesConfigDescription, RulesConfigDescriptionLocalizable } from 'src/app/components/wrapper-components/rules-configuration/RulesConfigDescription';

export class AwaleRules extends MancalaRules {

    private static singleton: MGPOptional<AwaleRules> = MGPOptional.empty();

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<MancalaConfig> =
        new RulesConfigDescription(
            {
                name: (): string => $localize`Awalé`,
                config: {
                    feedOriginalHouse: false,
                    mustFeed: true,
                    passByPlayerStore: false,
                    mustContinueDistributionAfterStore: false,
                    seedsByHouse: 4,
                    width: 6,
                },
            }, {
                width: RulesConfigDescriptionLocalizable.WIDTH,
                seedsByHouse: (): string => $localize`Seeds by house`,
                feedOriginalHouse: (): string => $localize`Feed original house`,
                mustFeed: (): string => $localize`Must feed`,
                passByPlayerStore: (): string => $localize`Pass by player store`,
                mustContinueDistributionAfterStore: (): string => $localize`Must continue distribution after last seed ends in store`,
            }, [
            ], {
                width: MGPValidators.range(1, 99),
                seedsByHouse: MGPValidators.range(1, 99),
            });

    public static get(): AwaleRules {
        if (AwaleRules.singleton.isAbsent()) {
            AwaleRules.singleton = MGPOptional.of(new AwaleRules());
        }
        return AwaleRules.singleton.get();
    }

    public override getRulesConfigDescription(): MGPOptional<RulesConfigDescription<MancalaConfig>> {
        return MGPOptional.of(AwaleRules.RULES_CONFIG_DESCRIPTION);
    }

    public applyCapture(distributionResult: MancalaDistributionResult): MancalaCaptureResult {
        const filledCoords: Coord[] = distributionResult.filledCoords;
        const landingCoord: Coord = filledCoords[filledCoords.length - 1];
        const resultingState: MancalaState = distributionResult.resultingState;
        return this.captureIfLegal(landingCoord.x, landingCoord.y, resultingState);
    }

    /**
     * Only called if y and player are not equal.
     * If the condition to make a capture into the opponent's side are met
     * Captures and return the number of captured
     * Captures even if this could mean doing an illegal starvation
     */
    private capture(x: number, y: number, state: MancalaState): MancalaCaptureResult {
        const playerY: number = state.getCurrentPlayerY();
        Utils.assert(y !== playerY, 'AwaleRules.capture cannot capture the players house');
        const resultingBoard: number[][] = state.getCopiedBoard();
        let target: number = resultingBoard[y][x];
        let capturedSum: number = 0;
        const captureMap: number[][] = [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
        ];
        if ((target < 2) || (target > 3)) {
            // first space not capturable, we apply no change
            return { capturedSum: 0, captureMap, resultingState: state };
        }

        let direction: number = -1; // by defaut, capture from right to left
        let limit: number = -1;
        if (state.getCurrentPlayer() === Player.ONE) {
            /** if Player.ONE capture, it is on the bottom line
             * means capture goes from left to right ( + 1)
             * so one ending condition of the loop is reaching index MancalaState.WIDTH
             */
            direction = +1;
            limit = state.getWidth();
        }

        do {
            captureMap[y][x] = target; // we addPart to the player score the captured seeds
            capturedSum += target;
            resultingBoard[y][x] = 0; // since now they're capture, we get them off the board
            x += direction;
            target = resultingBoard[y][x];
        } while ((x !== limit) && ((target === 2) || (target === 3)));
        const captured: [number, number] = state.getScoresCopy();
        captured[state.getCurrentPlayer().value] += capturedSum;
        return {
            capturedSum,
            captureMap,
            resultingState: new MancalaState(resultingBoard, state.turn, captured),
        };
    }

    public captureIfLegal(x: number, y: number, state: MancalaState): MancalaCaptureResult {
        const player: Player = state.getCurrentPlayer();
        const captureLessResult: MancalaCaptureResult = {
            capturedSum: 0,
            resultingState: state, // Apply no capture
            captureMap: [
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
            ],
        };
        if (y === player.value) {
            const captureResult: MancalaCaptureResult = this.capture(x, y, state);
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
