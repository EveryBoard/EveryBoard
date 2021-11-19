import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { PylosCoord } from './PylosCoord';
import { PylosMove } from './PylosMove';
import { PylosState } from './PylosState';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { PylosFailure } from './PylosFailure';
import { MGPFallible } from 'src/app/utils/MGPFallible';

export class PylosNode extends MGPNode<PylosRules, PylosMove, PylosState> {}

export class PylosRules extends Rules<PylosMove, PylosState> {

    public static getStateInfo(state: PylosState): { freeToMove: PylosCoord[], landable: PylosCoord[] } {
        const freeToMove: PylosCoord[] = [];
        const landable: PylosCoord[] = [];
        for (let z: number = 0; z < 3; z++) {
            for (let y: number = 0; y < (4 - z); y++) {
                for (let x: number = 0; x < (4 - z); x++) {
                    const c: PylosCoord = new PylosCoord(x, y, z);
                    if (state.getPieceAt(c) === state.getCurrentPlayer() &&
                        state.isSupporting(c) === false)
                    {
                        freeToMove.push(c);
                    }
                    if (state.isLandable(c)) {
                        landable.push(c);
                    }
                }
            }
        }
        return { freeToMove, landable };
    }
    public static getClimbingMoves(stateInfo: { freeToMove: PylosCoord[], landable: PylosCoord[] }): PylosMove[] {
        const moves: PylosMove[] = [];
        for (const startingCoord of stateInfo.freeToMove) {
            for (const landingCoord of stateInfo.landable) {
                if (landingCoord.isUpperThan(startingCoord) &&
                    landingCoord.getLowerPieces().some((c: PylosCoord) => startingCoord.equals(c)) === false) {
                    const newMove: PylosMove = PylosMove.fromClimb(startingCoord, landingCoord, []);
                    moves.push(newMove);
                }
            }
        }
        return moves;
    }
    public static getDropMoves(stateInfo: { freeToMove: PylosCoord[], landable: PylosCoord[] }): PylosMove[] {
        const drops: PylosMove[] = [];
        for (const landableCoord of stateInfo.landable) {
            const newMove: PylosMove = PylosMove.fromDrop(landableCoord, []);
            drops.push(newMove);
        }
        return drops;
    }
    public static canCapture(state: PylosState, landingCoord: PylosCoord): boolean {
        const currentPlayer: Player = state.getCurrentPlayer();
        for (const vertical of [Orthogonal.UP, Orthogonal.DOWN]) {
            const firstNeighboors: MGPOptional<PylosCoord> = landingCoord.getNextValid(vertical);
            if (firstNeighboors.isPresent() && state.getPieceAt(firstNeighboors.get()) === currentPlayer) {
                for (const horizontal of [Orthogonal.LEFT, Orthogonal.RIGHT]) {
                    const secondNeighboors: MGPOptional<PylosCoord> = firstNeighboors.get().getNextValid(horizontal);
                    if (secondNeighboors.isPresent() &&
                        state.getPieceAt(secondNeighboors.get()) === currentPlayer)
                    {
                        const thirdDirection: Orthogonal = vertical.getOpposite();
                        const thirdNeighboors: PylosCoord = secondNeighboors.get().getNextValid(thirdDirection).get();
                        if (state.getPieceAt(thirdNeighboors) === currentPlayer) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }
    public static getPossibleCaptures(freeToMoves: PylosCoord[],
                                      startingCoord: MGPOptional<PylosCoord>,
                                      landingCoord: PylosCoord)
    : PylosCoord[][]
    {
        const possiblesCapturesSet: PylosCoord[][] = [];

        // TODO this must be covered by a test (currently, commenting the line does not break anything)
        freeToMoves = freeToMoves.filter((c: PylosCoord) => startingCoord.equalsValue(c) === false);

        const capturables: PylosCoord[] = freeToMoves.concat(landingCoord);
        for (let i: number = 0; i < capturables.length; i++) {
            const firstCapture: PylosCoord = capturables[i];
            possiblesCapturesSet.push([firstCapture]);
            for (let j: number = i + 1; j < capturables.length; j++) {
                const secondCapture: PylosCoord = capturables[j];
                possiblesCapturesSet.push([secondCapture, firstCapture]);
            }
        }
        return possiblesCapturesSet;
    }
    public static applyLegalMove(move: PylosMove,
                                 state: PylosState,
                                 _status: void)
    : PylosState
    {
        return state.applyLegalMove(move);
    }
    public static isValidCapture(state: PylosState, move: PylosMove, capture: PylosCoord): boolean {
        const currentPlayer: Player = state.getCurrentPlayer();
        if (!capture.equals(move.landingCoord) &&
            state.getPieceAt(capture) !== currentPlayer)
        {
            return false;
        }
        const supportedPieces: PylosCoord[] = capture.getHigherPieces()
            .filter((p: PylosCoord) => state.getPieceAt(p) !== Player.NONE &&
                                       p.equals(move.firstCapture.get()) === false);
        if (supportedPieces.length > 0) {
            return false;
        }
        return true;
    }
    public static getGameStatus(node: PylosNode): GameStatus {
        const state: PylosState = node.gameState;
        const ownershipMap: { [owner: number]: number } = state.getPiecesRepartition();
        if (ownershipMap[Player.ZERO.value] === 15) {
            return GameStatus.ONE_WON;
        } else if (ownershipMap[Player.ONE.value] === 15) {
            return GameStatus.ZERO_WON;
        } else {
            return GameStatus.ONGOING;
        }
    }
    public applyLegalMove(move: PylosMove,
                          state: PylosState,
                          status: void)
    : PylosState
    {
        return PylosRules.applyLegalMove(move, state, status);
    }
    public isLegal(move: PylosMove, state: PylosState): MGPFallible<void> {
        if (state.getPieceAt(move.landingCoord) !== Player.NONE) {
            return MGPFallible.failure(RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
        }

        const OPPONENT: Player = state.getCurrentOpponent();

        if (move.startingCoord.isPresent()) {
            const startingCoord: PylosCoord = move.startingCoord.get();
            const startingPiece: Player = state.getPieceAt(startingCoord);
            if (startingPiece === OPPONENT) {
                return MGPFallible.failure(RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
            } else if (startingPiece === Player.NONE) {
                return MGPFallible.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
            }

            const supportedPieces: PylosCoord[] = startingCoord.getHigherPieces()
                .filter((p: PylosCoord) => state.getPieceAt(p) !== Player.NONE ||
                                           p.equals(move.landingCoord));
            if (supportedPieces.length > 0) {
                return MGPFallible.failure(PylosFailure.SHOULD_HAVE_SUPPORTING_PIECES());
            }
        }
        if (!state.isLandable(move.landingCoord)) {
            return MGPFallible.failure(PylosFailure.CANNOT_LAND());
        }

        if (move.firstCapture.isPresent()) {
            if (PylosRules.canCapture(state, move.landingCoord) === false) {
                return MGPFallible.failure(PylosFailure.CANNOT_CAPTURE());
            }

            if (PylosRules.isValidCapture(state, move, move.firstCapture.get())) {
                if (move.secondCapture.isPresent() &&
                    !PylosRules.isValidCapture(state, move, move.secondCapture.get())) {
                    return MGPFallible.failure(PylosFailure.INVALID_SECOND_CAPTURE());
                }
            } else return MGPFallible.failure(PylosFailure.INVALID_FIRST_CAPTURE());
        }
        return MGPFallible.success(undefined);
    }
    public getGameStatus(node: PylosNode): GameStatus {
        return PylosRules.getGameStatus(node);
    }
}
