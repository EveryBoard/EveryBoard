import { MancalaState } from '../common/MancalaState';
import { AwaleMove } from './AwaleMove';
import { Coord } from 'src/app/jscaip/Coord';
import { MancalaFailure } from './../common/MancalaFailure';
import { MGPValidation } from '@everyboard/lib';
import { Player } from 'src/app/jscaip/Player';
import { MGPOptional } from '@everyboard/lib';
import { MancalaCaptureResult, MancalaDistributionResult, MancalaRules } from '../common/MancalaRules';
import { Utils } from '@everyboard/lib';
import { GameNode } from 'src/app/jscaip/GameNode';

export class AwaleNode extends GameNode<AwaleMove, MancalaState> {}

export class AwaleRules extends MancalaRules<AwaleMove> {

    private static singleton: MGPOptional<AwaleRules> = MGPOptional.empty();

    public static get(): AwaleRules {
        if (AwaleRules.singleton.isAbsent()) {
            AwaleRules.singleton = MGPOptional.of(new AwaleRules());
        }
        return AwaleRules.singleton.get();
    }
    private constructor() {
        super({
            passByPlayerStore: false,
            mustFeed: true,
            feedOriginalHouse: false,
        });
    }
    public distributeMove(move: AwaleMove, state: MancalaState): MancalaDistributionResult {
        const playerY: number = state.getCurrentPlayerY();
        return this.distributeHouse(move.x, playerY, state);
    }
    public applyCapture(distributionResult: MancalaDistributionResult): MancalaCaptureResult {
        const filledCoords: Coord[] = distributionResult.filledCoords;
        const landingCoord: Coord = filledCoords[filledCoords.length - 1];
        const resultingState: MancalaState = distributionResult.resultingState;
        return this.captureIfLegal(landingCoord.x, landingCoord.y, resultingState);
    }
    public isLegal(move: AwaleMove, state: MancalaState): MGPValidation {
        const opponent: Player = state.getCurrentOpponent();
        const playerY: number = state.getCurrentPlayerY();

        const x: number = move.x;
        if (state.getPieceAtXY(x, playerY) === 0) {
            return MGPValidation.failure(MancalaFailure.MUST_CHOOSE_NON_EMPTY_HOUSE());
        }
        const opponentIsStarving: boolean = MancalaRules.isStarving(opponent, state.board);
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
            limit = MancalaState.WIDTH;
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
        if (y === player.getOpponent().value) {
            return captureLessResult;
        } else {
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
        }
    }
}
