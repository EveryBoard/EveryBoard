import { MGPNode } from 'src/app/jscaip/MGPNode';
import { MancalaState } from '../commons/MancalaState';
import { MancalaMove } from '../commons/MancalaMove';
import { Coord } from 'src/app/jscaip/Coord';
import { MancalaFailure } from './../commons/MancalaFailure';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Player } from 'src/app/jscaip/Player';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MancalaCaptureResult, MancalaDistributionResult, MancalaRules } from '../commons/MancalaRules';
import { Utils } from 'src/app/utils/utils';

export class AwaleNode extends MGPNode<AwaleRules, MancalaMove, MancalaState> {}

export class AwaleRules extends MancalaRules<MancalaMove> {

    public static VERBOSE: boolean = false;

    private static singleton: MGPOptional<AwaleRules> = MGPOptional.empty();

    public static get(): AwaleRules {
        if (AwaleRules.singleton.isAbsent()) {
            AwaleRules.singleton = MGPOptional.of(new AwaleRules());
        }
        return AwaleRules.singleton.get();
    }
    private constructor() {
        super({
            passByPlayerKalah: false,
            mustFeed: true,
        });
    }
    public distributeMove(move: MancalaMove, state: MancalaState): MancalaDistributionResult {
        const playerY: number = state.getCurrentOpponent().value;
        return this.distributeHouse(move.x, playerY, state);
    }
    public applyCapture(distributionResult: MancalaDistributionResult)
    : MancalaCaptureResult
    {
        const postDistributionState: MancalaState = distributionResult.resultingState;
        // So that Player ZERO plays on the row 1
        const playerY: number = postDistributionState.getCurrentOpponent().value;
        const filledHouses: Coord[] = distributionResult.filledHouses;
        const landingCoord: Coord = filledHouses[filledHouses.length - 1];
        const landingCamp: number = landingCoord.y;
        const resultingState: MancalaState = distributionResult.resultingState;
        if (landingCamp === playerY) {
            // we finish sowing on our own side, nothing else to do
            return {
                capturedSum: 0,
                captureMap: [[0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]],
                resultingState: distributionResult.resultingState,
            };
        } else {
            // we finish sowing on the opponent's side, we therefore check the captures
            return this.captureIfLegal(landingCoord.x, landingCoord.y, resultingState);
        }
    }
    /**
     * Modifies the move to addPart the capture.
     * Modifies the board to get the after-move result.
     * Returns -1 if it is not legal, if so, the board should not be affected
     * Returns the number captured otherwise
     */
    public isLegal(move: MancalaMove, state: MancalaState): MGPValidation {
        const opponent: Player = state.getCurrentOpponent();
        const playerY: number = opponent.value; // So player 0 is in row 1

        const x: number = move.x;
        if (state.getPieceAtXY(x, playerY) === 0) {
            return MGPValidation.failure(MancalaFailure.MUST_CHOOSE_NON_EMPTY_HOUSE());
        }
        const opponentIsStarving: boolean = this.isStarving(opponent, state.board);
        const playerDoesNotDistribute: boolean = this.doesDistribute(x, playerY, state.board) === false;
        if (opponentIsStarving && playerDoesNotDistribute) {
            return MGPValidation.failure(MancalaFailure.SHOULD_DISTRIBUTE());
        }
        return MGPValidation.SUCCESS;
    }
    /**
     * Only called if y and player are not equal.
     * If the condition to make a capture into the opponent's side are met
     * Captures and return the number of captured
     * Captures even if this could mean doing an illegal starvation
     */
    private capture(x: number, y: number, state: MancalaState): MancalaCaptureResult {
        const playerY: number = state.getCurrentOpponent().value;
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
              * so one ending condition of the loop is reaching index 6
             */
            direction = +1;
            limit = 6;
        }

        do {
            captureMap[y][x] = target; // we addPart to the player score the captured seeds
            capturedSum += target;
            resultingBoard[y][x] = 0; // since now they're capture, we get them off the board
            x += direction;
            target = resultingBoard[y][x];
        } while ((x !== limit) && ((target === 2) || (target === 3)));
        const captured: [number, number] = state.getCapturedCopy();
        captured[state.getCurrentPlayer().value] += capturedSum;
        return {
            capturedSum, // TODO: kill this perhaps
            captureMap,
            // TODO: update capture with captureSum ?
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
        if (y === player.getOpponent().value) {
            return captureLessResult;
        } else {
            const captureResult: MancalaCaptureResult = this.capture(x, y, state);
            const isStarving: boolean = this.isStarving(player.getOpponent(),
                                                        captureResult.resultingState.board);
            if (captureResult.capturedSum > 0 && isStarving) {
                /* if the distribution would capture all seeds
                 * the capture is forbidden and cancelled
                 */
                return captureLessResult;
            } else {
                return captureResult;
            }
        }
    }
}
