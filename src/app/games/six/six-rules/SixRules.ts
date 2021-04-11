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

export class SixFailure {

    public static readonly MUST_CUT: string = 'Several groups are of same size, you must pick the one to keep!';
}
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
        const lastDrop: Coord = move.landing;
        const victoryValue: number = slice.getCurrentPlayer().getVictoryValue();
        if (this.isLineVictory(lastDrop, slice)) {
            return victoryValue;
        }
        if (this.isCircleVictory(lastDrop, slice)) {
            return victoryValue;
        }
        if (this.isTriangleVictory(lastDrop, slice)) {
            return victoryValue;
        }
        if (slice.turn > 40) {
            const pieceByPlayer: MGPBiMap<MGPBoolean, MGPSet<Coord>> = slice.pieces.groupByValue();
            const LAST_PLAYER: Player = slice.getCurrentEnnemy();
            const ENNEMY: MGPBoolean = slice.getCurrentPlayer() === Player.ONE ? MGPBoolean.TRUE : MGPBoolean.FALSE;
            const ennemyPieces: number =
                pieceByPlayer.get(ENNEMY).isAbsent() ? 0 : pieceByPlayer.get(ENNEMY).get().size();
            const PLAYER: MGPBoolean = LAST_PLAYER === Player.ONE ? MGPBoolean.TRUE : MGPBoolean.FALSE;
            const playerPieces: number =
                pieceByPlayer.get(PLAYER).isAbsent() ? 0 : pieceByPlayer.get(PLAYER).get().size();
            if (ennemyPieces < 6 && playerPieces < 6) {
                if (ennemyPieces < playerPieces) {
                    return LAST_PLAYER.getVictoryValue();
                } else if (ennemyPieces > playerPieces) {
                    return LAST_PLAYER.getDefeatValue();
                } else {
                    return 0; // DRAW
                }
            } else if (ennemyPieces < 6) {
                return LAST_PLAYER.getVictoryValue();
            } else if (playerPieces < 6) {
                return LAST_PLAYER.getDefeatValue();
            } else {
                return (playerPieces - ennemyPieces) * LAST_PLAYER.getScoreModifier();
            }
        }
        return 0;
    }
    public isLineVictory(lastDrop: Coord, state: SixGameState): boolean {
        const LAST_PLAYER: Player = state.getCurrentEnnemy();
        const alignedByDirection: MGPMap<HexaDirection, number> = new MGPMap<HexaDirection, number>();
        alignedByDirection.set(HexaDirection.UP, 1);
        alignedByDirection.set(HexaDirection.UP_RIGHT, 1);
        alignedByDirection.set(HexaDirection.UP_LEFT, 1);
        for (const dir of HexaDirection.factory.all) {
            let testedCoords: number = 0;
            let noStop: boolean = true;
            let testCoord: Coord = lastDrop.getNext(dir, 1);
            while (testedCoords < 6 && noStop) {
                if (state.getPieceAt(testCoord) === LAST_PLAYER) {
                    const aligned: number = this.incrementForDirection(alignedByDirection, dir);
                    if (aligned === 6) {
                        return true;
                    }
                    testedCoords++;
                    testCoord = testCoord.getNext(dir, 1);
                } else {
                    noStop = false;
                }
            }
        }
        return false;
    }
    private incrementForDirection(alignedByDirection: MGPMap<HexaDirection, number>, dir: HexaDirection): number {
        let key: HexaDirection;
        if (alignedByDirection.containsKey(dir)) {
            key = dir;
        } else {
            key = dir.getOpposite();
        }
        const aligned: number = alignedByDirection.get(key).get() + 1;
        alignedByDirection.replace(key, aligned);
        return aligned;
    }
    public isCircleVictory(lastDrop: Coord, state: SixGameState): boolean {
        const LAST_PLAYER: Player = state.getCurrentEnnemy();
        for (let i: number = 0; i < 6; i++) {
            const initialDirection: HexaDirection = HexaDirection.factory.all[i];
            let testedCoords: number = 0;
            let noStop: boolean = true;
            let testCoord: Coord = lastDrop.getNext(initialDirection, 1);
            while (testedCoords < 5 && noStop) {
                if (state.getPieceAt(testCoord) === LAST_PLAYER) {
                    testedCoords++;
                    const dirIndex: number = (testedCoords + i) % 6;
                    const dir: HexaDirection = HexaDirection.factory.all[dirIndex];
                    testCoord = testCoord.getNext(dir, 1);
                } else {
                    noStop = false;
                }
            }
            if (testedCoords === 5 && noStop) {
                return true;
            }
        }
        return false;
    }
    public isTriangleVictory(lastDrop: Coord, state: SixGameState): boolean {
        if (this.isTrangleVictoryCorner(lastDrop, state)) {
            return true;
        }
        if (this.isTrangleVictoryEdge(lastDrop, state)) {
            return true;
        }
        return false;
    }
    public isTrangleVictoryCorner(lastDrop: Coord, state: SixGameState): boolean {
        const LAST_PLAYER: Player = state.getCurrentEnnemy();
        for (let i: number = 0; i < 6; i++) {
            let edgeDirection: HexaDirection = HexaDirection.factory.all[i];
            let testedEdges: number = 0;
            let noStop: boolean = true;
            let testCorner: Coord = lastDrop;
            while (testedEdges < 3 && noStop) {
                if (state.getPieceAt(testCorner) === LAST_PLAYER &&
                    state.getPieceAt(testCorner.getNext(edgeDirection, 1)) === LAST_PLAYER)
                {
                    testedEdges++;
                    const dirIndex: number = ((2*testedEdges) + i) % 6;
                    testCorner = testCorner.getNext(edgeDirection, 2);
                    edgeDirection = HexaDirection.factory.all[dirIndex];
                } else {
                    noStop = false;
                }
            }
            if (testedEdges === 3 && noStop) {
                return true;
            }
        }
        return false;
    }
    public isTrangleVictoryEdge(lastDrop: Coord, state: SixGameState): boolean {
        const LAST_PLAYER: Player = state.getCurrentEnnemy();
        for (let i: number = 0; i < 6; i++) {
            const initialDirection: HexaDirection = HexaDirection.factory.all[i];
            let edgeDirection: HexaDirection = HexaDirection.factory.all[(i + 2) % 6];
            let testedEdges: number = 0;
            let noStop: boolean = true;
            let testCorner: Coord = lastDrop.getNext(initialDirection, 1);
            while (testedEdges < 3 && noStop) {
                if (state.getPieceAt(testCorner) === LAST_PLAYER &&
                    state.getPieceAt(testCorner.getNext(edgeDirection, 1)) === LAST_PLAYER)
                {
                    testedEdges++;
                    const dirIndex: number = ((2*testedEdges) + i + 2) % 6;
                    testCorner = testCorner.getNext(edgeDirection, 2);
                    edgeDirection = HexaDirection.factory.all[dirIndex];
                } else {
                    noStop = false;
                }
            }
            if (testedEdges === 3 && noStop) {
                return true;
            }
        }
        return false;
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
            SixGameState.getGroups(piecesAfterDeplacement, move.start.get()); // LELE
        if (this.isSplit(groupsAfterMove)) {
            const biggerGroups: MGPSet<MGPSet<Coord>> = this.getBiggerGroups(groupsAfterMove);
            if (biggerGroups.size() === 1) {
                if (move.keep.isPresent()) {
                    return {
                        legal: MGPValidation.failure('You cannot choose which part to keep when one is smaller than the other!'),
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
            return { legal: MGPValidation.failure('Cannot keep empty coord!'), kept: null };
        }
        const keptCoord: Coord = keep.get();
        for (let i: number = 0; i < biggerGroups.size(); i++) {
            const subGroup: MGPSet<Coord> = biggerGroups.get(i);
            if (subGroup.contains(keptCoord)) {
                return { legal: MGPValidation.SUCCESS, kept: subGroup };
            }
        }
        return {
            legal: MGPValidation.failure('Should keep a piece belonging to one of the greater groups'),
            kept: null,
        };
    }
}
