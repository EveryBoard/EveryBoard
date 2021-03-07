import { MGPMap } from 'src/app/utils/mgp-map/MGPMap';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { Direction } from 'src/app/jscaip/DIRECTION';
import { MGPNode } from 'src/app/jscaip/mgp-node/MGPNode';
import { Player } from 'src/app/jscaip/player/Player';
import { Rules } from 'src/app/jscaip/Rules';
import { EpaminondasLegalityStatus } from '../epaminondaslegalitystatus';
import { EpaminondasMove } from '../epaminondas-move/EpaminondasMove';
import { EpaminondasPartSlice } from '../epaminondas-part-slice/EpaminondasPartSlice';

export class EpaminondasNode extends MGPNode<EpaminondasRules,
                                             EpaminondasMove,
                                             EpaminondasPartSlice,
                                             EpaminondasLegalityStatus> {}

export class EpaminondasRules extends Rules<EpaminondasMove, EpaminondasPartSlice, EpaminondasLegalityStatus> {
    public getListMoves(node: EpaminondasNode): MGPMap<EpaminondasMove, EpaminondasPartSlice> {
        const PLAYER: number = node.gamePartSlice.getCurrentPlayer().value;
        const ENNEMY: number = node.gamePartSlice.getCurrentEnnemy().value;
        const EMPTY: number = Player.NONE.value;

        let moves: MGPMap<EpaminondasMove, EpaminondasPartSlice> = new MGPMap<EpaminondasMove, EpaminondasPartSlice>();
        const slice: EpaminondasPartSlice = node.gamePartSlice;
        let move: EpaminondasMove;
        for (let y = 0; y < 12; y++) {
            for (let x = 0; x < 14; x++) {
                const firstCoord: Coord = new Coord(x, y);
                if (slice.getBoardAt(firstCoord) === PLAYER) {
                    for (const direction of Direction.DIRECTIONS) {
                        let movedPieces = 1;
                        let nextCoord: Coord = firstCoord.getNext(direction, 1);
                        while (nextCoord.isInRange(14, 12) &&
                               slice.getBoardAt(nextCoord) === PLAYER) {
                            movedPieces += 1;
                            nextCoord = nextCoord.getNext(direction, 1);
                        }
                        let stepSize = 1;
                        while (nextCoord.isInRange(14, 12) &&
                               stepSize <= movedPieces &&
                               slice.getBoardAt(nextCoord) === EMPTY) {
                            move = new EpaminondasMove(x, y, movedPieces, stepSize, direction);
                            moves = this.addMove(moves, move, slice);

                            stepSize++;
                            nextCoord = nextCoord.getNext(direction, 1);
                        }
                        if (nextCoord.isInRange(14, 12) &&
                            stepSize <= movedPieces &&
                            slice.getBoardAt(nextCoord) === ENNEMY) {
                            move = new EpaminondasMove(x, y, movedPieces, stepSize, direction);
                            moves = this.addMove(moves, move, slice);
                        }
                    }
                }
            }
        }
        return moves;
    }
    public addMove(
        moves: MGPMap<EpaminondasMove, EpaminondasPartSlice>,
        move: EpaminondasMove,
        slice: EpaminondasPartSlice,
    ): MGPMap<EpaminondasMove, EpaminondasPartSlice> {
        const legality: EpaminondasLegalityStatus = this.isLegal(move, slice);
        if (legality.legal.isSuccess()) {
            const resultingSlice: EpaminondasPartSlice = this.applyLegalMove(move, slice, legality).resultingSlice;
            moves.put(move, resultingSlice);
        }
        return moves;
    }
    public getBoardValue(move: EpaminondasMove, slice: EpaminondasPartSlice): number {
        // TODO: Teach EpaminondasRules to go forward ?
        const zerosInFirstLine: number = slice.count(Player.ZERO, 0);
        const onesInLastLine: number = slice.count(Player.ONE, 11);
        if (slice.turn % 2 === 0) {
            if (zerosInFirstLine > onesInLastLine) return Number.MIN_SAFE_INTEGER;
        } else {
            if (onesInLastLine > zerosInFirstLine) return Number.MAX_SAFE_INTEGER;
        }
        return slice.countPiecesOnBoard();
    }
    public applyLegalMove(
        move: EpaminondasMove,
        slice: EpaminondasPartSlice,
        status: EpaminondasLegalityStatus): { resultingMove: EpaminondasMove; resultingSlice: EpaminondasPartSlice; }
    {
        const resultingSlice: EpaminondasPartSlice = new EpaminondasPartSlice(status.newBoard, slice.turn + 1);
        return { resultingMove: move, resultingSlice };
    }
    public isLegal(move: EpaminondasMove, slice: EpaminondasPartSlice): EpaminondasLegalityStatus {
        const phalanxValidity: MGPValidation = this.getPhalanxValidity(slice, move);
        if (phalanxValidity.isFailure()) {
            return EpaminondasLegalityStatus.failure(phalanxValidity.reason);
        }
        const landingStatus: EpaminondasLegalityStatus = this.getLandingStatus(slice, move);
        if (landingStatus.legal.isFailure()) {
            return landingStatus;
        }
        const newBoard: number[][] = landingStatus.newBoard;
        const ENNEMY: number = slice.getCurrentEnnemy().value;
        const captureValidity: EpaminondasLegalityStatus = this.getCaptureValidity(slice, newBoard, move, ENNEMY);
        if (captureValidity.legal.isFailure()) {
            return EpaminondasLegalityStatus.failure(captureValidity.legal.reason);
        }
        return { newBoard, legal: MGPValidation.SUCCESS };
    }
    public getPhalanxValidity(slice: EpaminondasPartSlice, move: EpaminondasMove): MGPValidation {
        let coord: Coord = move.coord;
        let soldierIndex: number = 0;
        let caseContent: number;
        const ENNEMY: number = slice.getCurrentEnnemy().value;
        while (soldierIndex < move.movedPieces) {
            if (coord.isNotInRange(14, 12)) {
                return MGPValidation.failure('Cette phalange contient des pièces en dehors du plateau.');
            }
            caseContent = slice.getBoardAt(coord);
            if (caseContent === Player.NONE.value) {
                return MGPValidation.failure('Une phalange ne peut pas contenir cases vides.');
            }
            if (caseContent === ENNEMY) {
                return MGPValidation.failure('Une phalange ne peut pas contenir de pièces ennemies.');
            }
            coord = coord.getNext(move.direction, 1);
            soldierIndex++;
        }
        return MGPValidation.SUCCESS;
    }
    public getLandingStatus(slice: EpaminondasPartSlice, move: EpaminondasMove): EpaminondasLegalityStatus {
        const newBoard: number[][] = slice.getCopiedBoard();
        const CURRENT_PLAYER: number = slice.getCurrentPlayer().value;
        let emptied: Coord = move.coord;
        let landingCoord: Coord = move.coord.getNext(move.direction, move.movedPieces);
        let landingIndex: number = 0;
        while (landingIndex + 1 < move.stepSize) {
            newBoard[emptied.y][emptied.x] = Player.NONE.value;
            newBoard[landingCoord.y][landingCoord.x] = CURRENT_PLAYER;
            if (landingCoord.isNotInRange(14, 12)) {
                return EpaminondasLegalityStatus.failure('La distance de déplacement de votre phalange la fait sortir du plateau.');
            }
            if (slice.getBoardAt(landingCoord) !== Player.NONE.value) {
                return EpaminondasLegalityStatus.failure('Il y a quelque chose dans le chemin de votre phalange.');
            }
            landingIndex++;
            landingCoord = landingCoord.getNext(move.direction, 1);
            emptied = emptied.getNext(move.direction, 1);
        }
        if (landingCoord.isNotInRange(14, 12)) {
            return EpaminondasLegalityStatus.failure('La distance de déplacement de votre phalange la fait sortir du plateau.');
        }
        if (slice.getBoardAt(landingCoord) === CURRENT_PLAYER) {
            return EpaminondasLegalityStatus.failure('Vous ne pouvez pas capturer/atterrir sur vos propres pions.');
        }
        newBoard[emptied.y][emptied.x] = Player.NONE.value;
        newBoard[landingCoord.y][landingCoord.x] = CURRENT_PLAYER;
        return { newBoard, legal: MGPValidation.SUCCESS };
    }
    public getCaptureValidity(oldSlice: EpaminondasPartSlice, board: number[][], move: EpaminondasMove, ENNEMY: number): EpaminondasLegalityStatus {
        let capturedSoldier: Coord = move.coord.getNext(move.direction, move.movedPieces + move.stepSize - 1);
        const EMPTY: number = Player.NONE.value;
        let captured = 0;
        while (capturedSoldier.isInRange(14, 12) &&
               oldSlice.getBoardAt(capturedSoldier) === ENNEMY
        ) {
            // Capture
            if (captured > 0) {
                board[capturedSoldier.y][capturedSoldier.x] = EMPTY;
            }
            captured++;
            if (captured >= move.movedPieces) {
                return EpaminondasLegalityStatus.failure('Votre phalange doit être plus grande que celle qu\'elle tente de capturer.');
            }
            capturedSoldier = capturedSoldier.getNext(move.direction, 1);
        }
        return { newBoard: board, legal: MGPValidation.SUCCESS };
    }
}
