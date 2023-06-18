import { MGPNode } from 'src/app/jscaip/MGPNode';
import { KalahMove } from './KalahMove';
import { MancalaState } from './../MancalaState';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MancalaMove } from '../MancalaMove';
import { KalahFailure } from './KalahFailure';
import { MancalaCaptureResult, MancalaDistributionResult, MancalaRules } from '../MancalaRules';
import { Player } from 'src/app/jscaip/Player';
import { Coord } from 'src/app/jscaip/Coord';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';

export class KalahNode extends MGPNode<KalahRules, KalahMove, MancalaState> {}

export class KalahRules extends MancalaRules<KalahMove> {

    private static singleton: MGPOptional<KalahRules> = MGPOptional.empty();

    public static get(): KalahRules {
        if (KalahRules.singleton.isAbsent()) {
            KalahRules.singleton = MGPOptional.of(new KalahRules());
        }
        return KalahRules.singleton.get();
    }
    private constructor() {
        super({
            passByPlayerKalah: true,
            mustFeed: false,
        });
    }
    public isLegal(move: KalahMove, state: MancalaState): MGPValidation {
        const playerY: number = state.getCurrentOpponent().value; // centralise that in MancalaState !
        let canStillPlay: boolean = true;
        for (const subMove of move) {
            if (canStillPlay === false) {
                return MGPValidation.failure(KalahFailure.CANNOT_PLAY_AFTER_NON_KALAH_MOVE());
            }
            const subMoveResult: MGPFallible<boolean> = this.isLegalSubMove(subMove, state);
            if (subMoveResult.isFailure()) {
                return MGPValidation.ofFallible(subMoveResult);
            } else {
                state = this.distributeHouse(subMove.x, playerY, state).resultingState;
                canStillPlay = subMoveResult.get();
            }
        }
        if (canStillPlay) {
            return MGPValidation.failure(KalahFailure.MUST_CONTINUE_PLAYING_AFTER_KALAH_MOVE());
        } else {
            return MGPValidation.SUCCESS;
        }
    }
    /**
      * @param subMove the sub move to try
      * @param currentBoard the board at the beginning of the subMove, will be modified
      * @return: MGPFallible.failure(reason) if it is illegal, MGPFallible.success(userCanStillPlay)
      */
    private isLegalSubMove(subMove: MancalaMove, state: MancalaState): MGPFallible<boolean> {
        const opponent: Player = state.getCurrentOpponent();
        const playerY: number = opponent.value; // So player 0 is in row 1
        const distributionResult: MancalaDistributionResult = this.distributeHouse(subMove.x, playerY, state);
        return MGPFallible.success(distributionResult.endUpInKalah);
    }
    public distributeMove(move: KalahMove, state: MancalaState): MancalaDistributionResult { // TODO: eh wtf kill this
        const playerValue: number = state.getCurrentPlayer().value;
        const playerY: number = state.getCurrentOpponent().value;
        const filledHouses: Coord[] = [];
        let passedByKalahNTimes: number = 0;
        for (const subMove of move) {
            const distributionResult: MancalaDistributionResult = this.distributeHouse(subMove.x, playerY, state);
            const captures: [number, number] = state.getCapturedCopy();
            captures[playerValue] += distributionResult.passedByKalahNTimes;
            state = distributionResult.resultingState;
            filledHouses.push(...distributionResult.filledHouses);
            passedByKalahNTimes += distributionResult.passedByKalahNTimes;
        }
        const captured: [number, number] = state.getCapturedCopy();
        captured[playerValue] += passedByKalahNTimes;
        const distributedState: MancalaState = new MancalaState(state.getCopiedBoard(), state.turn, captured);
        return {
            endUpInKalah: false,
            filledHouses,
            passedByKalahNTimes,
            resultingState: distributedState, // TODO: reuse where needed ?
        };
    }
    public applyCapture(distributionResult: MancalaDistributionResult): MancalaCaptureResult {
        const landingSpace: Coord = distributionResult.filledHouses[distributionResult.filledHouses.length - 1];
        const playerY: number = distributionResult.resultingState.getCurrentOpponent().value;
        const landingSeeds: number = distributionResult.resultingState.getPieceAt(landingSpace);
        const distributedState: MancalaState = distributionResult.resultingState;
        if (landingSpace.y === playerY && landingSeeds === 1) {
            // We can capture
            const board: number[][] = distributedState.getCopiedBoard();
            const capturedSum: number = board[0][landingSpace.x] + board[1][landingSpace.x];
            const captureMap: number[][] = ArrayUtils.createTable(6, 2, 0);
            captureMap[0][landingSpace.x] = board[0][landingSpace.x];
            captureMap[1][landingSpace.x] = board[1][landingSpace.x];
            board[0][landingSpace.x] = 0;
            board[1][landingSpace.x] = 0;
            const captured: [number, number] = distributedState.getCapturedCopy();
            captured[distributedState.getCurrentPlayer().value] += capturedSum;
            const postCaptureState: MancalaState = new MancalaState(board,
                                                                    distributedState.turn,
                                                                    captured);
            return {
                capturedSum, captureMap, resultingState: postCaptureState,
            };
        } else {
            return {
                capturedSum: 0,
                captureMap: [[0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]],
                resultingState: distributedState,
            };
        }
    }
}
