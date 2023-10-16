import { KalahMove } from './KalahMove';
import { MancalaState } from './../common/MancalaState';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MancalaDistribution } from '../common/MancalaMove';
import { MancalaCaptureResult, MancalaDistributionResult, MancalaRules } from '../common/MancalaRules';
import { Coord } from 'src/app/jscaip/Coord';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { MancalaFailure } from '../common/MancalaFailure';
import { Utils } from 'src/app/utils/utils';
import { MancalaConfig } from '../common/MancalaConfig';
import { GameNode } from 'src/app/jscaip/GameNode';

export class KalahNode extends GameNode<KalahMove, MancalaState> {}

export class KalahRules extends MancalaRules<KalahMove> {

    private static singleton: MGPOptional<KalahRules> = MGPOptional.empty();

    public static readonly DEFAULT_CONFIG: MancalaConfig = {
        feedOriginalHouse: true,
        mustFeed: false,
        passByPlayerStore: true,
        seedsByHouse: 4,
        width: 6,
    };

    public static get(): KalahRules {
        if (KalahRules.singleton.isAbsent()) {
            KalahRules.singleton = MGPOptional.of(new KalahRules());
        }
        return KalahRules.singleton.get();
    }
    private constructor() {
        super(KalahRules.DEFAULT_CONFIG);
    }
    public isLegal(move: KalahMove, state: MancalaState): MGPValidation {
        const playerY: number = state.getCurrentPlayerY();
        let canStillPlay: boolean = true;
        for (const distribution of move) {
            Utils.assert(canStillPlay === true, 'CANNOT_PLAY_AFTER_NON_KALAH_MOVE');
            const distributionResult: MGPFallible<boolean> = this.isLegalDistribution(distribution, state);
            if (distributionResult.isFailure()) {
                return MGPValidation.ofFallible(distributionResult);
            } else {
                state = this.distributeHouse(distribution.x, playerY, state).resultingState;
                canStillPlay = distributionResult.get();
            }
        }
        Utils.assert(canStillPlay === false, 'MUST_CONTINUE_PLAYING_AFTER_KALAH_MOVE');
        return MGPValidation.SUCCESS;
    }
    /**
      * @param distributions the distributions to try
      * @return: MGPFallible.failure(reason) if it is illegal, MGPFallible.success(userCanStillPlay)
      */
    private isLegalDistribution(distributions: MancalaDistribution, state: MancalaState): MGPFallible<boolean> {
        const playerY: number = state.getCurrentPlayerY();
        if (state.getPieceAtXY(distributions.x, playerY) === 0) {
            return MGPFallible.failure(MancalaFailure.MUST_CHOOSE_NON_EMPTY_HOUSE());
        }
        const distributionResult: MancalaDistributionResult = this.distributeHouse(distributions.x, playerY, state);
        const isStarving: boolean = MancalaRules.isStarving(distributionResult.resultingState.getCurrentPlayer(),
                                                            distributionResult.resultingState.board);
        return MGPFallible.success(distributionResult.endsUpInStore && isStarving === false);
    }
    public distributeMove(move: KalahMove, state: MancalaState): MancalaDistributionResult {
        const playerValue: number = state.getCurrentPlayer().value;
        const playerY: number = state.getCurrentPlayerY();
        const filledCoords: Coord[] = [];
        let passedByStoreNTimes: number = 0;
        let endsUpInStore: boolean = false;
        let postDistributionState: MancalaState = state;
        for (const distributions of move) {
            const distributionResult: MancalaDistributionResult =
                this.distributeHouse(distributions.x, playerY, postDistributionState);
            const captures: [number, number] = postDistributionState.getScoresCopy();
            captures[playerValue] += distributionResult.passedByStoreNTimes;
            postDistributionState = distributionResult.resultingState;
            filledCoords.push(...distributionResult.filledCoords);
            passedByStoreNTimes += distributionResult.passedByStoreNTimes;
            endsUpInStore = distributionResult.endsUpInStore;
        }
        const captured: [number, number] = postDistributionState.getScoresCopy();
        const distributedState: MancalaState = new MancalaState(postDistributionState.getCopiedBoard(),
                                                                postDistributionState.turn,
                                                                captured,
                                                                postDistributionState.config);
        return {
            endsUpInStore,
            filledCoords,
            passedByStoreNTimes,
            resultingState: distributedState,
        };
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
                const captureMap: number[][] = ArrayUtils.createTable(distributedState.board[0].length, 2, 0);
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
