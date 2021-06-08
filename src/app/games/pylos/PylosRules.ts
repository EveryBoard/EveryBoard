import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { PylosCoord } from './PylosCoord';
import { PylosMove } from './PylosMove';
import { PylosPartSlice } from './PylosPartSlice';

export class PylosNode extends MGPNode<Rules<PylosMove, PylosPartSlice>,
                                       PylosMove,
                                       PylosPartSlice> {}

export class PylosRules extends Rules<PylosMove, PylosPartSlice> {

    public static getSliceInfo(slice: PylosPartSlice): { freeToMove: PylosCoord[], landable: PylosCoord[] } {
        const freeToMove: PylosCoord[] = [];
        const landable: PylosCoord[] = [];
        for (let z: number = 0; z < 3; z++) {
            for (let y: number = 0; y < (4 - z); y++) {
                for (let x: number = 0; x < (4 - z); x++) {
                    const c: PylosCoord = new PylosCoord(x, y, z);
                    if (slice.getBoardAt(c) === slice.getCurrentPlayer().value &&
                        slice.isSupporting(c) === false) {
                        freeToMove.push(c);
                    }
                    if (slice.isLandable(c)) {
                        landable.push(c);
                    }
                }
            }
        }
        return { freeToMove, landable };
    }
    public static getClimbingMoves(sliceInfo: { freeToMove: PylosCoord[], landable: PylosCoord[] }): PylosMove[] {
        const moves: PylosMove[] = [];
        for (const startingCoord of sliceInfo.freeToMove) {
            for (const landingCoord of sliceInfo.landable) {
                if (landingCoord.isUpperThan(startingCoord) &&
                    landingCoord.getLowerPieces().some((c: PylosCoord) => startingCoord.equals(c)) === false) {
                    const newMove: PylosMove = PylosMove.fromClimb(startingCoord, landingCoord, []);
                    moves.push(newMove);
                }
            }
        }
        return moves;
    }
    public static getDropMoves(sliceInfo: { freeToMove: PylosCoord[], landable: PylosCoord[] }): PylosMove[] {
        const drops: PylosMove[] = [];
        for (const landableCoord of sliceInfo.landable) {
            const newMove: PylosMove = PylosMove.fromDrop(landableCoord, []);
            drops.push(newMove);
        }
        return drops;
    }
    public static canCapture(slice: PylosPartSlice, landingCoord: PylosCoord): boolean {
        const currentPlayer: number = slice.getCurrentPlayer().value;
        for (const vertical of [Orthogonal.UP, Orthogonal.DOWN]) {
            const firstNeighboors: MGPOptional<PylosCoord> = landingCoord.getNextValid(vertical);
            if (firstNeighboors.isPresent() && slice.getBoardAt(firstNeighboors.get()) === currentPlayer) {
                for (const horizontal of [Orthogonal.LEFT, Orthogonal.RIGHT]) {
                    const secondNeighboors: PylosCoord = firstNeighboors
                        .get()
                        .getNextValid(horizontal)
                        .getOrNull();
                    if (secondNeighboors && slice.getBoardAt(secondNeighboors) === currentPlayer) {
                        const thirdDirection: Orthogonal = vertical.getOpposite();
                        const thirdNeighboors: PylosCoord = secondNeighboors.getNextValid(thirdDirection).get();
                        if (slice.getBoardAt(thirdNeighboors) === currentPlayer) return true;
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

        freeToMoves = freeToMoves.filter((c: PylosCoord) => c.equals(startingCoord.getOrNull()) === false);

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
                                 slice: PylosPartSlice,
                                 status: LegalityStatus)
    : PylosPartSlice {
        return slice.applyLegalMove(move);
    }
    public static isValidCapture(slice: PylosPartSlice, move: PylosMove, capture: PylosCoord): boolean {
        const currentPlayer: number = slice.getCurrentPlayer().value;
        if (!capture.equals(move.landingCoord) &&
            slice.getBoardAt(capture) !== currentPlayer) {
            return false;
        }
        const supportedPieces: PylosCoord[] = capture.getHigherPieces()
            .filter((p: PylosCoord) => slice.getBoardAt(p) !== Player.NONE.value &&
                                       p.equals(move.firstCapture.get()) === false);
        if (supportedPieces.length > 0) {
            return false;
        }
        return true;
    }
    public static getGameStatus(node: PylosNode): GameStatus {
        const state: PylosPartSlice = node.gamePartSlice;
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
                          slice: PylosPartSlice,
                          status: LegalityStatus)
    : PylosPartSlice
    {
        return PylosRules.applyLegalMove(move, slice, status);
    }
    public isLegal(move: PylosMove, slice: PylosPartSlice): LegalityStatus {
        if (slice.getBoardAt(move.landingCoord) !== Player.NONE.value) {
            return { legal: MGPValidation.failure('move does not land on empty target') };
        }

        const startingCoord: PylosCoord = move.startingCoord.getOrNull();
        const currentPlayer: number = slice.getCurrentPlayer().value;

        if (startingCoord != null) {
            if (slice.getBoardAt(startingCoord) !== currentPlayer) {
                return { legal: MGPValidation.failure('move does not start from a player piece') };
            }

            const supportedPieces: PylosCoord[] = startingCoord.getHigherPieces()
                .filter((p: PylosCoord) => slice.getBoardAt(p) !== Player.NONE.value ||
                                           p.equals(move.landingCoord));
            if (supportedPieces.length > 0) {
                return { legal: MGPValidation.failure('move does not have supported pieces') };
            }
        }
        if (!slice.isLandable(move.landingCoord)) {
            return { legal: MGPValidation.failure('landing coord is not landable') };
        }

        if (move.firstCapture.isPresent()) {
            if (!PylosRules.canCapture(slice, move.landingCoord)) {
                return { legal: MGPValidation.failure('cannot capture') };
            }

            if (PylosRules.isValidCapture(slice, move, move.firstCapture.get())) {
                if (move.secondCapture.isPresent() &&
                    !PylosRules.isValidCapture(slice, move, move.secondCapture.get())) {
                    return { legal: MGPValidation.failure('second capture is not valid') };
                }
            } else return { legal: MGPValidation.failure('first capture is not valid') };
        }
        return { legal: MGPValidation.SUCCESS };
    }
    public getGameStatus(node: PylosNode): GameStatus {
        return PylosRules.getGameStatus(node);
    }
}
