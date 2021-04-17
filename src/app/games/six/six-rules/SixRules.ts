import { Coord } from 'src/app/jscaip/coord/Coord';
import { HexaDirection } from 'src/app/jscaip/hexa/HexaDirection';
import { MGPNode } from 'src/app/jscaip/mgp-node/MGPNode';
import { Player } from 'src/app/jscaip/player/Player';
import { Rules } from 'src/app/jscaip/Rules';
import { MGPBiMap, MGPMap } from 'src/app/utils/mgp-map/MGPMap';
import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';
import { MGPSet } from 'src/app/utils/mgp-set/MGPSet';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';
import { MGPBoolean, SixGameState } from '../six-game-state/SixGameState';
import { SixMove } from '../six-move/SixMove';
import { SixLegalityStatus } from '../SixLegalityStatus';
import { SixFailure } from './SixFailure';

export class SixNode extends MGPNode<SixRules, SixMove, SixGameState, SixLegalityStatus> {}

export class SixRules extends Rules<SixMove, SixGameState, SixLegalityStatus> {

    public getListMoves(node: SixNode): MGPMap<SixMove, SixGameState> {
        const legalLandings: Coord[] = this.getLegalLandings(node.gamePartSlice);
        if (node.gamePartSlice.turn < 40) {
            return this.getListDrop(node.gamePartSlice, legalLandings);
        } else {
            return this.getListDeplacement(node.gamePartSlice, legalLandings);
        }
    }
    public getLegalLandings(state: SixGameState): Coord[] {
        const neighboors: Coord[] = [];
        for (const piece of state.pieces.listKeys()) {
            for (const dir of HexaDirection.factory.all) {
                const neighboor: Coord = piece.getNext(dir, 1);
                if (state.getPieceAt(neighboor) === Player.NONE) {
                    neighboors.push(neighboor);
                }
            }
        }
        return neighboors;
    }
    public getListDrop(state: SixGameState, legalLandings: Coord[]): MGPMap<SixMove, SixGameState> {
        const drops: MGPMap<SixMove, SixGameState> = new MGPMap<SixMove, SixGameState>();
        for (const landing of legalLandings) {
            const drop: SixMove = SixMove.fromDrop(landing);
            const resultingState: SixGameState = state.applyLegalDrop(landing);
            drops.put(drop, resultingState);
        }
        return drops;
    }
    public getListDeplacement(state: SixGameState, legalLandings: Coord[]): MGPMap<SixMove, SixGameState> {
        // get list pieces belonging to me
        // multiply list with legalLandings
        // check for each if a cut is needed
        const deplacements: MGPMap<SixMove, SixGameState> = new MGPMap<SixMove, SixGameState>();
        for (const start of state.pieces.listKeys()) {
            if (state.getPieceAt(start) === state.getCurrentPlayer()) {
                for (const landing of legalLandings) {
                    const move: SixMove = SixMove.fromDeplacement(start, landing);
                    const legality: SixLegalityStatus = this.isLegalDeplacement(move, state);
                    if (legality.legal.isSuccess()) { // TODO: cuttingMove
                        const resultingState: SixGameState =
                            this.applyLegalMove(move, state, legality).resultingSlice;
                        deplacements.put(move, resultingState);
                    }
                }
            }
        }
        return deplacements;
    }
    public getBoardValue(move: SixMove, slice: SixGameState): number {
        const lastDrop: Coord = move.landing.getNext(slice.offset, 1);
        const victoryValue: number = slice.getCurrentEnnemy().getVictoryValue();
        const shapeVictory: Coord[] = this.getShapeVictory(lastDrop, slice);
        if (shapeVictory.length === 6) {
            return victoryValue;
        }
        if (slice.turn > 39) {
            const pieces: number[] = slice.countPieces();
            const zeroPieces: number = pieces[0];
            const onePieces: number = pieces[1];
            if (zeroPieces < 6 && onePieces < 6) {
                if (zeroPieces < onePieces) {
                    return Player.ONE.getVictoryValue();
                } else if (onePieces < zeroPieces) {
                    return Player.ZERO.getVictoryValue();
                } else {
                    return 0; // DRAW
                }
            } else if (zeroPieces < 6) {
                return Player.ZERO.getDefeatValue();
            } else if (onePieces < 6) {
                return Player.ONE.getDefeatValue();
            } else {
                return zeroPieces - onePieces;
            }
        }
        return 0;
    }
    public getShapeVictory(lastDrop: Coord, state: SixGameState): Coord[] {
        const lineVictory: Coord[] = this.getLineVictory(lastDrop, state);
        if (lineVictory.length === 6) {
            return lineVictory;
        }
        const triangleVictory: Coord[] = this.getTriangleVictory(lastDrop, state);
        if (triangleVictory.length === 6) {
            return triangleVictory;
        }
        const circleVictory: Coord[] = this.getCircleVictory(lastDrop, state);
        if (circleVictory.length === 6) {
            return circleVictory;
        }
        return [];
    }
    public getLineVictory(lastDrop: Coord, state: SixGameState): Coord[] {
        const LAST_PLAYER: Player = state.getCurrentEnnemy();
        const coordsOfDirection: MGPMap<HexaDirection, Coord[]> = new MGPMap<HexaDirection, Coord[]>();
        coordsOfDirection.set(HexaDirection.UP, [lastDrop]);
        coordsOfDirection.set(HexaDirection.UP_RIGHT, [lastDrop]);
        coordsOfDirection.set(HexaDirection.UP_LEFT, [lastDrop]);
        for (const dir of HexaDirection.factory.all) {
            let testedCoords: number = 0;
            let noStop: boolean = true;
            let testCoord: Coord = lastDrop.getNext(dir, 1);
            while (testedCoords < 6 && noStop) {
                if (state.getPieceAt(testCoord) === LAST_PLAYER) {
                    const aligned: Coord[] = this.addCoordForDirection(coordsOfDirection, dir, testCoord);
                    if (aligned.length === 6) {
                        return aligned;
                    }
                    testedCoords++;
                    testCoord = testCoord.getNext(dir, 1);
                } else {
                    noStop = false;
                }
            }
        }
        return [];
    }
    private addCoordForDirection(coordsOfDirection: MGPMap<HexaDirection, Coord[]>,
                                 dir: HexaDirection,
                                 coord: Coord): Coord[]
    {
        let key: HexaDirection;
        if (coordsOfDirection.containsKey(dir)) {
            key = dir;
        } else {
            key = dir.getOpposite();
        }
        const aligned: Coord[] = coordsOfDirection.get(key).get();
        aligned.push(coord);
        coordsOfDirection.replace(key, aligned);
        return aligned;
    }
    public getCircleVictory(lastDrop: Coord, state: SixGameState): Coord[] {
        const LAST_PLAYER: Player = state.getCurrentEnnemy();
        for (let i: number = 0; i < 6; i++) {
            const initialDirection: HexaDirection = HexaDirection.factory.all[i];
            const testedCoords: Coord[] = [lastDrop];
            let noStop: boolean = true;
            let testCoord: Coord = lastDrop.getNext(initialDirection, 1);
            while (testedCoords.length < 6 && noStop) {
                if (state.getPieceAt(testCoord) === LAST_PLAYER) {
                    testedCoords.push(testCoord);
                    const dirIndex: number = (testedCoords.length + i -1) % 6;
                    const dir: HexaDirection = HexaDirection.factory.all[dirIndex];
                    testCoord = testCoord.getNext(dir, 1);
                } else {
                    noStop = false;
                }
            }
            if (testedCoords.length === 6 && noStop) {
                return testedCoords;
            }
        }
        return [];
    }
    public getTriangleVictory(lastDrop: Coord, state: SixGameState): Coord[] {
        const triangleVictoryCorner: Coord[] = this.getTriangleVictoryCorner(lastDrop, state);
        if (triangleVictoryCorner.length === 6) {
            return triangleVictoryCorner;
        }
        const triangleVictoryEdge: Coord[] = this.getTriangleVictoryEdge(lastDrop, state);
        if (triangleVictoryEdge.length === 6) {
            return triangleVictoryEdge;
        }
        return [];
    }
    public getTriangleVictoryCorner(lastDrop: Coord, state: SixGameState): Coord[] {
        const LAST_PLAYER: Player = state.getCurrentEnnemy();
        for (let i: number = 0; i < 6; i++) {
            let edgeDirection: HexaDirection = HexaDirection.factory.all[i];
            const testedEdges: Coord[] = [];
            let noStop: boolean = true;
            let testCorner: Coord = lastDrop;
            while (testedEdges.length < 6 && noStop) {
                if (state.getPieceAt(testCorner) === LAST_PLAYER &&
                    state.getPieceAt(testCorner.getNext(edgeDirection, 1)) === LAST_PLAYER)
                {
                    testedEdges.push(testCorner, testCorner.getNext(edgeDirection, 1));
                    const dirIndex: number = ((testedEdges.length) + i) % 6;
                    testCorner = testCorner.getNext(edgeDirection, 2);
                    edgeDirection = HexaDirection.factory.all[dirIndex];
                } else {
                    noStop = false;
                }
            }
            if (testedEdges.length ===6 && noStop) {
                return testedEdges;
            }
        }
        return [];
    }
    public getTriangleVictoryEdge(lastDrop: Coord, state: SixGameState): Coord[] {
        const LAST_PLAYER: Player = state.getCurrentEnnemy();
        for (let i: number = 0; i < 6; i++) {
            const initialDirection: HexaDirection = HexaDirection.factory.all[i];
            let edgeDirection: HexaDirection = HexaDirection.factory.all[(i + 2) % 6];
            const testedCoords: Coord[] = [];
            let noStop: boolean = true;
            let testCorner: Coord = lastDrop.getNext(initialDirection, 1);
            while (testedCoords.length < 6 && noStop) {
                if (state.getPieceAt(testCorner) === LAST_PLAYER &&
                    state.getPieceAt(testCorner.getNext(edgeDirection, 1)) === LAST_PLAYER)
                {
                    testedCoords.push(testCorner, testCorner.getNext(edgeDirection, 1));
                    const dirIndex: number = (testedCoords.length + i + 2) % 6;
                    testCorner = testCorner.getNext(edgeDirection, 2);
                    edgeDirection = HexaDirection.factory.all[dirIndex];
                } else {
                    noStop = false;
                }
            }
            if (testedCoords.length && noStop) {
                return testedCoords;
            }
        }
        return [];
    }
    public applyLegalMove(move: SixMove,
                          state: SixGameState,
                          status: SixLegalityStatus): { resultingMove: SixMove; resultingSlice: SixGameState; }
    {
        if (state.turn < 40) {
            return { resultingSlice: state.applyLegalDrop(move.landing), resultingMove: move };
        } else {
            const kept: MGPSet<Coord> = status.kept;
            return { resultingSlice: state.applyLegalDeplacement(move, kept), resultingMove: move };
        }
    }
    public isLegal(move: SixMove, slice: SixGameState): SixLegalityStatus {
        const landingLegality: MGPValidation = slice.isIllegalLandingZone(move.landing);
        if (landingLegality.isFailure()) {
            return { legal: landingLegality, kept: null };
        }
        if (slice.turn < 40) {
            return this.isLegalDrop(move, slice);
        } else {
            return this.isLegalDeplacement(move, slice);
        }
    }
    public isLegalDrop(move: SixMove, slice: SixGameState): SixLegalityStatus {
        if (move.isDrop() === false) {
            return { legal: MGPValidation.failure('Cannot do deplacement before 42th turn!'), kept: null };
        }
        return {
            legal: MGPValidation.SUCCESS,
            kept: slice.pieces.getKeySet(),
        };
    }
    public isLegalDeplacement(move: SixMove, state: SixGameState): SixLegalityStatus {
        if (move.isDrop()) {
            return { legal: MGPValidation.failure('Can no longer drop after 40th turn!'), kept: null };
        }
        switch (state.getPieceAt(move.start.get())) {
            case Player.NONE:
                return { legal: MGPValidation.failure('Cannot move empty coord!'), kept: null };
            case state.getCurrentEnnemy():
                return { legal: MGPValidation.failure('Cannot move ennemy piece!'), kept: null };
        }
        const piecesAfterDeplacement: MGPBiMap<Coord, MGPBoolean> = SixGameState.deplacePiece(state, move);
        const groupsAfterMove: MGPSet<MGPSet<Coord>> =
            SixGameState.getGroups(piecesAfterDeplacement, move.start.get());
        if (this.isSplit(groupsAfterMove)) {
            const biggerGroups: MGPSet<MGPSet<Coord>> = this.getBiggerGroups(groupsAfterMove);
            if (biggerGroups.size() === 1) {
                if (move.keep.isPresent()) {
                    return {
                        legal: MGPValidation.failure(SixFailure.CANNOT_CHOOSE_TO_KEEP),
                        kept: null,
                    };
                } else {
                    return { legal: MGPValidation.SUCCESS, kept: biggerGroups.get(0) };
                }
            } else {
                return this.moveKeepBiggerGroup(move.keep, biggerGroups, piecesAfterDeplacement);
            }
        } else {
            return {
                legal: MGPValidation.SUCCESS,
                kept: new MGPSet(),
            };
        }
    }
    public isSplit(groups: MGPSet<MGPSet<Coord>>): boolean {
        return groups.size() > 1;
    }
    public getBiggerGroups(groups: MGPSet<MGPSet<Coord>>): MGPSet<MGPSet<Coord>> {
        let biggerSize: number = 0;
        let biggerGroups: MGPSet<MGPSet<Coord>> = new MGPSet();
        for (let i: number = 0; i < groups.size(); i++) {
            const group: MGPSet<Coord> = groups.get(i);
            const groupSize: number = group.size();
            if (groupSize > biggerSize) {
                biggerSize = groupSize;
                biggerGroups = new MGPSet([group]);
            } else if (groupSize === biggerSize) {
                biggerGroups.add(group);
            }
        }
        return biggerGroups;
    }
    public moveKeepBiggerGroup(keep: MGPOptional<Coord>,
                               biggerGroups: MGPSet<MGPSet<Coord>>,
                               pieces: MGPBiMap<Coord, MGPBoolean>): SixLegalityStatus {
        if (keep.isAbsent()) {
            return {
                legal: MGPValidation.failure(SixFailure.MUST_CUT),
                kept: null,
            };
        }
        if (pieces.get(keep.get()).isAbsent()) {
            return { legal: MGPValidation.failure(SixFailure.CANNOT_KEEP_EMPTY_COORD), kept: null };
        }
        const keptCoord: Coord = keep.get();
        for (let i: number = 0; i < biggerGroups.size(); i++) {
            const subGroup: MGPSet<Coord> = biggerGroups.get(i);
            if (subGroup.contains(keptCoord)) {
                return { legal: MGPValidation.SUCCESS, kept: subGroup };
            }
        }
        return {
            legal: MGPValidation.failure(SixFailure.MUST_CAPTURE_BIGGEST_GROUPS),
            kept: null,
        };
    }
}
