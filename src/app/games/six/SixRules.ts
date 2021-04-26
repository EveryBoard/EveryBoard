import { Coord } from 'src/app/jscaip/coord/Coord';
import { HexaDirection } from 'src/app/jscaip/hexa/HexaDirection';
import { MGPNode } from 'src/app/jscaip/mgp-node/MGPNode';
import { Player } from 'src/app/jscaip/player/Player';
import { Rules } from 'src/app/jscaip/Rules';
import { MGPBiMap, MGPMap } from 'src/app/utils/mgp-map/MGPMap';
import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';
import { MGPSet } from 'src/app/utils/mgp-set/MGPSet';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';
import { MGPBoolean, SixGameState } from './SixGameState';
import { SixMove } from './SixMove';
import { SixLegalityStatus } from './SixLegalityStatus';
import { SixFailure } from './SixFailure';
import { SCORE } from 'src/app/jscaip/SCORE';
import { display } from 'src/app/utils/utils/utils';
import { BoardInfo } from 'src/app/jscaip/AlignementMinimax';

export class SixNode extends MGPNode<SixRules, SixMove, SixGameState, SixLegalityStatus> {}

export class SixRules extends Rules<SixMove, SixGameState, SixLegalityStatus> {

    public VERBOSE: boolean = true;

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
        const LAST_PLAYER: Player = slice.getCurrentEnnemy();
        const victoryValue: number = LAST_PLAYER.getVictoryValue();
        const shapeInfo: BoardInfo = this.getShapeInfo(lastDrop, slice);
        if (shapeInfo.status === SCORE.VICTORY) {
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
        if (shapeInfo.status === SCORE.PRE_VICTORY) {
            return LAST_PLAYER.getPreVictory();
        }
        return shapeInfo.sum * LAST_PLAYER.getScoreModifier();
    }
    public getShapeInfo(lastDrop: Coord, state: SixGameState): BoardInfo
    {
        const boardInfo: BoardInfo = {
            status: SCORE.DEFAULT,
            victory: null,
            preVictory: MGPOptional.empty(),
            sum: 0,
        };
        const lineInfo: BoardInfo = this.getLineInfo(lastDrop, state, boardInfo);
        if (lineInfo.status === SCORE.VICTORY) {
            return lineInfo;
        }
        const triangleInfo: BoardInfo = this.getTriangleInfo(lastDrop, state, lineInfo);
        if (triangleInfo.status === SCORE.VICTORY) {
            return triangleInfo;
        }
        return this.getCircleInfo(lastDrop, state, triangleInfo);
    }
    public getLineInfo(lastDrop: Coord, state: SixGameState, boardInfo: BoardInfo): BoardInfo {
        display(this.VERBOSE, { called: 'SixRules.getListVictory', lastDrop, state, boardInfo });
        const LAST_ENNEMY: Player = state.getCurrentPlayer();
        const coordsOfDirection: MGPMap<HexaDirection, Coord[]> = new MGPMap<HexaDirection, Coord[]>();
        coordsOfDirection.set(HexaDirection.UP, [lastDrop]);
        coordsOfDirection.set(HexaDirection.UP_RIGHT, [lastDrop]);
        coordsOfDirection.set(HexaDirection.UP_LEFT, [lastDrop]);
        let sum: number = boardInfo.sum;
        let preVictory: MGPOptional<Coord> = boardInfo.preVictory;
        for (const dir of HexaDirection.factory.all) {
            let subSum: number = 0;
            let testedCoords: number = 0;
            let pathIsWinnable: boolean = true;
            let testCoord: Coord = lastDrop.getNext(dir, 1);
            let lastEmpty: Coord;
            while (testedCoords < 6 && pathIsWinnable) {
                const testedPiece: Player = state.getPieceAt(testCoord);
                if (testedPiece === LAST_ENNEMY) {
                    subSum = 0;
                    pathIsWinnable = false;
                } else {
                    if (testedPiece === Player.NONE) {
                        subSum += 0.16; // roughly 1/6
                        lastEmpty = testCoord;
                    } else {
                        subSum++;
                        const aligned: Coord[] = this.addCoordForDirection(coordsOfDirection, dir, testCoord);
                        if (aligned.length === 6) {
                            return {
                                status: SCORE.VICTORY,
                                victory: aligned,
                                preVictory,
                                sum: null,
                            };
                        }
                    }
                    testedCoords++;
                    testCoord = testCoord.getNext(dir, 1);
                }
            }
            sum += subSum;
            if (subSum === 4.16) {
                display(this.VERBOSE, '5+1 found !');
                // We found 5 pieces aligned and one space, so that space is a preVictory coord
                if (preVictory.isPresent() && preVictory.get().equals(lastEmpty) === false) {
                    return {
                        status: SCORE.PRE_VICTORY,
                        victory: null,
                        preVictory, // no longer usefull
                        sum: null,
                    };
                } else {
                    preVictory = MGPOptional.of(lastEmpty);
                }
            }
        }
        return {
            status: boardInfo.status,
            victory: null,
            preVictory,
            sum,
        };
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
    public getCircleInfo(lastDrop: Coord, state: SixGameState, boardInfo: BoardInfo): BoardInfo {
        display(this.VERBOSE, { called: 'SixRules.getCircleVictory', lastDrop, state, preVictory: boardInfo });
        const LAST_ENNEMY: Player = state.getCurrentPlayer();
        let sum: number = 0;
        let preVictory: MGPOptional<Coord> = boardInfo.preVictory;
        for (let i: number = 0; i < 6; i++) {
            const initialDirection: HexaDirection = HexaDirection.factory.all[i];
            const testedCoords: Coord[] = [lastDrop];
            let pathIsWinnable: boolean = true;
            let testCoord: Coord = lastDrop.getNext(initialDirection, 1);
            let subSum: number = 0;
            let lastEmpty: Coord;
            while (testedCoords.length < 6 && pathIsWinnable) {
                const testedPiece: Player = state.getPieceAt(testCoord);
                if (testedPiece === LAST_ENNEMY) {
                    subSum = 0;
                    pathIsWinnable = false;
                } else {
                    const dirIndex: number = (i + testedCoords.length) % 6;
                    testedCoords.push(testCoord);
                    const dir: HexaDirection = HexaDirection.factory.all[dirIndex];
                    testCoord = testCoord.getNext(dir, 1);
                    if (testedPiece === Player.NONE) {
                        subSum += 0.16; // roughly 1/6
                        lastEmpty = testCoord;
                    } else {
                        subSum++;
                    }
                }
            }
            sum += subSum;
            if (subSum === 4.16) {
                display(this.VERBOSE, '5+1 found !');
                // We found 5 pieces aligned and one space, so that space is a preVictory coord
                if (preVictory.isPresent() && preVictory.get().equals(lastEmpty) === false) {
                    return {
                        status: SCORE.PRE_VICTORY,
                        victory: null,
                        preVictory, // no longer usefull
                        sum: null,
                    };
                } else {
                    preVictory = MGPOptional.of(lastEmpty);
                }
            }
            if (subSum === 5) {
                return {
                    status: SCORE.VICTORY,
                    victory: testedCoords,
                    preVictory,
                    sum: null,
                };
            }
        }
        return {
            status: boardInfo.status,
            victory: null,
            preVictory,
            sum,
        };
    }
    public getTriangleInfo(lastDrop: Coord, state: SixGameState, boardInfo: BoardInfo): BoardInfo {
        const triangleCornerInfo: BoardInfo = this.getTriangleCornerInfo(lastDrop, state, boardInfo);
        if (triangleCornerInfo.victory) {
            return triangleCornerInfo;
        }
        return this.getTriangleEdgeInfo(lastDrop, state, triangleCornerInfo);
    }
    public getTriangleCornerInfo(lastDrop: Coord, state: SixGameState, boardInfo: BoardInfo): BoardInfo {
        display(this.VERBOSE, { called: 'SixRules.getTriangleVictoryCorner', lastDrop, state: state, boardInfo });
        const LAST_ENNEMY: Player = state.getCurrentPlayer();
        let sum: number = 0;
        let preVictory: MGPOptional<Coord> = boardInfo.preVictory;
        for (let i: number = 0; i < 6; i++) {
            let edgeDirection: HexaDirection = HexaDirection.factory.all[i];
            const testedCoords: Coord[] = [lastDrop];
            let pathIsWinnable: boolean = true;
            let testCoord: Coord = lastDrop.getNext(edgeDirection, 1);
            let subSum: number = 0;
            let lastEmpty: Coord;
            while (testedCoords.length < 6 && pathIsWinnable) {
                // Testing the corner
                const testedPiece: Player = state.getPieceAt(testCoord);
                if (testedPiece === LAST_ENNEMY) {
                    subSum = 0;
                    pathIsWinnable = false;
                } else {
                    if (testedPiece === Player.NONE) {
                        subSum += 0.16; // rougly 1/6
                        lastEmpty = testCoord;
                    } else {
                        subSum++;
                    }
                    if (testedCoords.length % 2 === 0) {
                        // reached a corner, let's turn
                        const dirIndex: number = (i + testedCoords.length) % 6;
                        edgeDirection = HexaDirection.factory.all[dirIndex];
                    }
                    testedCoords.push(testCoord);
                    testCoord = testCoord.getNext(edgeDirection, 1);
                }
            }
            sum += subSum;
            if (subSum === 5) {
                return {
                    status: SCORE.VICTORY,
                    victory: testedCoords,
                    preVictory,
                    sum: null,
                };
            }
            if (subSum === 4.16) {
                display(this.VERBOSE, '5+1 found !');
                // We found 5 pieces aligned and one space, so that space is a preVictory coord
                if (preVictory.isPresent() && preVictory.get().equals(lastEmpty) === false) {
                    return {
                        status: SCORE.PRE_VICTORY,
                        victory: null,
                        preVictory, // no longer usefull
                        sum: null,
                    };
                } else {
                    preVictory = MGPOptional.of(lastEmpty);
                }
            }
        }
        return {
            status: boardInfo.status,
            victory: null,
            preVictory,
            sum,
        };
    }
    public getTriangleEdgeInfo(lastDrop: Coord, state: SixGameState, boardInfo: BoardInfo): BoardInfo {
        display(this.VERBOSE, { called: 'SixRules.getTriangleVictoryEdge', lastDrop, state, preVictory: boardInfo });
        const LAST_ENNEMY: Player = state.getCurrentPlayer();
        let sum: number = 0;
        let preVictory: MGPOptional<Coord> = boardInfo.preVictory;
        for (let i: number = 0; i < 6; i++) {
            let edgeDirection: HexaDirection = HexaDirection.factory.all[i];
            const testedCoords: Coord[] = [lastDrop];
            let pathIsWinnable: boolean = true;
            let testCoord: Coord = lastDrop.getNext(edgeDirection, 1);
            let subSum: number = 0;
            let lastEmpty: Coord;
            while (testedCoords.length < 6 && pathIsWinnable) {
                // Testing the corner
                const testedPiece: Player = state.getPieceAt(testCoord);
                if (testedPiece === LAST_ENNEMY) {
                    subSum = 0;
                    pathIsWinnable = false;
                } else {
                    if (testedPiece === Player.NONE) {
                        subSum += 0.16; // rougly 1/6
                        lastEmpty = testCoord;
                    } else {
                        subSum++;
                    }
                    testedCoords.push(testCoord);
                    if (testedCoords.length % 2 === 0) {
                        // reached a corner, let's turn
                        const dirIndex: number = (i + testedCoords.length) % 6;
                        edgeDirection = HexaDirection.factory.all[dirIndex];
                    }
                    testCoord = testCoord.getNext(edgeDirection, 1);
                }
            }
            sum += subSum;
            if (subSum === 5) {
                return {
                    status: SCORE.VICTORY,
                    victory: testedCoords,
                    preVictory,
                    sum: null,
                };
            }
            if (subSum === 4.16) {
                display(this.VERBOSE, '5+1 found !');
                // We found 5 pieces aligned and one space, so that space is a preVictory coord
                if (preVictory.isPresent() && preVictory.get().equals(lastEmpty) === false) {
                    return {
                        status: SCORE.PRE_VICTORY,
                        victory: null,
                        preVictory, // no longer usefull
                        sum: null,
                    };
                } else {
                    preVictory = MGPOptional.of(lastEmpty);
                }
            }
        }
        return {
            status: boardInfo.status,
            victory: null,
            preVictory,
            sum,
        };
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
