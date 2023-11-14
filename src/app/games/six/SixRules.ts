import { Coord } from 'src/app/jscaip/Coord';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { GameNode } from 'src/app/jscaip/GameNode';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPSet } from 'src/app/utils/MGPSet';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { SixState } from './SixState';
import { SixMove } from './SixMove';
import { SixFailure } from './SixFailure';
import { Rules } from 'src/app/jscaip/Rules';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { CoordSet } from 'src/app/utils/OptimizedSet';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { Debug } from 'src/app/utils/utils';
import { Table } from 'src/app/utils/ArrayUtils';

export type SixLegalityInformation = MGPSet<Coord>;

export class SixNode extends GameNode<SixMove, SixState> {
}
export interface SixVictorySource {
    typeSource: 'LINE' | 'TRIANGLE_CORNER' | 'TRIANGLE_EDGE' | 'CIRCLE',
    index: number,
}

@Debug.log
export class SixRules extends Rules<SixMove, SixState, SixLegalityInformation> {

    private static singleton: MGPOptional<SixRules> = MGPOptional.empty();

    private currentVictorySource: SixVictorySource;

    public static get(): SixRules {
        if (SixRules.singleton.isAbsent()) {
            SixRules.singleton = MGPOptional.of(new SixRules());
        }
        return SixRules.singleton.get();
    }

    public getInitialState(): SixState {
        const board: Table<PlayerOrNone> = [[Player.ZERO], [Player.ONE]];
        return SixState.ofRepresentation(board, 0);
    }

    public applyLegalMove(move: SixMove, state: SixState, kept: SixLegalityInformation): SixState {
        if (state.turn < 40) {
            return state.applyLegalDrop(move.landing);
        } else {
            return state.applyLegalDeplacement(move, kept);
        }
    }
    public isLegal(move: SixMove, state: SixState): MGPFallible<SixLegalityInformation> {
        const landingLegality: MGPValidation = state.isIllegalLandingZone(move.landing, move.start);
        if (landingLegality.isFailure()) {
            return landingLegality.toOtherFallible();
        }
        if (state.turn < 40) {
            return this.isLegalDrop(move, state);
        } else {
            return SixRules.isLegalPhaseTwoMove(move, state);
        }
    }
    public static getLegalLandings(state: SixState): Coord[] {
        const neighbors: MGPSet<Coord> = new CoordSet();
        for (const piece of state.getPieceCoords()) {
            for (const dir of HexaDirection.factory.all) {
                const neighbor: Coord = piece.getNext(dir, 1);
                if (state.getPieceAt(neighbor) === PlayerOrNone.NONE) {
                    neighbors.add(neighbor);
                }
            }
        }
        return neighbors.toList();
    }
    public isLegalDrop(move: SixMove, state: SixState): MGPFallible<SixLegalityInformation> {
        if (move.isDrop() === false) {
            return MGPFallible.failure(SixFailure.NO_MOVEMENT_BEFORE_TURN_40());
        }
        return MGPFallible.success(new MGPSet(state.getPieceCoords()));
    }
    public static isLegalPhaseTwoMove(move: SixMove, state: SixState): MGPFallible<SixLegalityInformation> {
        if (move.isDrop()) {
            return MGPFallible.failure(SixFailure.CAN_NO_LONGER_DROP());
        }
        const pieceOwner: PlayerOrNone = state.getPieceAt(move.start.get());
        if (pieceOwner === PlayerOrNone.NONE) {
            return MGPFallible.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
        } else if (pieceOwner === state.getCurrentOpponent()) {
            return MGPFallible.failure(RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
        }
        const stateAfterMove: SixState = state.movePiece(move);
        const groupsAfterMove: MGPSet<MGPSet<Coord>> = stateAfterMove.getGroups();
        if (SixRules.isSplit(groupsAfterMove)) {
            const biggerGroups: MGPSet<MGPSet<Coord>> = this.getLargestGroups(groupsAfterMove);
            if (biggerGroups.size() === 1) {
                if (move.keep.isPresent()) {
                    return MGPFallible.failure(SixFailure.CANNOT_CHOOSE_TO_KEEP());
                } else {
                    return MGPFallible.success(biggerGroups.getAnyElement().get());
                }
            } else {
                return this.moveKeepBiggerGroup(move.keep, biggerGroups, stateAfterMove);
            }
        } else {
            return MGPFallible.success(new CoordSet());
        }
    }
    public static isSplit(groups: MGPSet<MGPSet<Coord>>): boolean {
        return groups.size() > 1;
    }
    public static getLargestGroups(groups: MGPSet<MGPSet<Coord>>): MGPSet<MGPSet<Coord>> {
        let biggerSize: number = 0;
        let biggerGroups: MGPSet<MGPSet<Coord>> = new MGPSet();
        for (const group of groups) {
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
    public static moveKeepBiggerGroup(keep: MGPOptional<Coord>,
                                      biggerGroups: MGPSet<MGPSet<Coord>>,
                                      state: SixState)
    : MGPFallible<SixLegalityInformation>
    {
        if (keep.isAbsent()) {
            return MGPFallible.failure(SixFailure.MUST_CUT());
        }
        if (state.getPieces().get(keep.get()).isAbsent()) {
            return MGPFallible.failure(SixFailure.CANNOT_KEEP_EMPTY_COORD());
        }
        const keptCoord: Coord = keep.get();
        for (const subGroup of biggerGroups) {
            if (subGroup.contains(keptCoord)) {
                return MGPFallible.success(subGroup);
            }
        }
        return MGPFallible.failure(SixFailure.MUST_CAPTURE_BIGGEST_GROUPS());
    }
    public getGameStatus(node: SixNode): GameStatus {
        const state: SixState = node.gameState;
        const LAST_PLAYER: Player = state.getCurrentOpponent();
        let shapeVictory: Coord[] = [];
        if (node.previousMove.isPresent()) {
            shapeVictory = this.getShapeVictory(node.previousMove.get(), state);
        }
        if (shapeVictory.length === 6) {
            return GameStatus.getVictory(LAST_PLAYER);
        }
        if (state.turn > 39) {
            const pieces: number[] = state.countPieces();
            const zeroPieces: number = pieces[0];
            const onePieces: number = pieces[1];
            if (zeroPieces < 6 && onePieces < 6) {
                if (zeroPieces < onePieces) {
                    return GameStatus.ONE_WON;
                } else if (onePieces < zeroPieces) {
                    return GameStatus.ZERO_WON;
                } else {
                    return GameStatus.DRAW;
                }
            } else if (zeroPieces < 6) {
                return GameStatus.getDefeat(Player.ZERO);
            } else if (onePieces < 6) {
                return GameStatus.getDefeat(Player.ONE);
            } else {
                return GameStatus.ONGOING;
            }
        }
        return GameStatus.ONGOING;
    }
    private startSearchingVictorySources(): void {
        this.currentVictorySource = {
            typeSource: 'LINE',
            index: -1,
        };
    }
    public getShapeVictory(lastMove: SixMove, state: SixState): Coord[] {
        this.startSearchingVictorySources();
        while (this.hasNextVictorySource()) {
            this.getNextVictorySource();
            const shapeVictory: Coord[] = this.searchVictoryOnly(this.currentVictorySource, lastMove, state);
            if (shapeVictory.length === 6) {
                return shapeVictory;
            }
        }
        return [];
    }
    private hasNextVictorySource(): boolean {
        return this.currentVictorySource.typeSource !== 'CIRCLE' ||
               this.currentVictorySource.index !== 5;
    }
    private getNextVictorySource(): SixVictorySource {
        const source: SixVictorySource = this.currentVictorySource;
        if (source.index === 5) {
            let newType: 'TRIANGLE_CORNER' | 'TRIANGLE_EDGE' | 'CIRCLE';
            switch (this.currentVictorySource.typeSource) {
                case 'LINE':
                    newType = 'TRIANGLE_CORNER';
                    break;
                case 'TRIANGLE_CORNER':
                    newType = 'TRIANGLE_EDGE';
                    break;
                default:
                    newType = 'CIRCLE';
                    break;
            }
            this.currentVictorySource = {
                typeSource: newType,
                index: 0,
            };
        } else {
            let increment: number = 1;
            if (this.currentVictorySource.typeSource === 'LINE') {
                increment = 2;
            }
            this.currentVictorySource = {
                typeSource: this.currentVictorySource.typeSource,
                index: this.currentVictorySource.index + increment,
            };
        }
        return this.currentVictorySource;
    }
    private searchVictoryOnly(victorySource: SixVictorySource, move: SixMove, state: SixState): Coord[] {
        const lastDrop: Coord = move.landing;
        switch (victorySource.typeSource) {
            case 'LINE':
                return this.searchVictoryOnlyForLine(victorySource.index, lastDrop, state);
            case 'CIRCLE':
                return this.searchVictoryOnlyForCircle(victorySource.index, lastDrop, state);
            case 'TRIANGLE_CORNER':
                return this.searchVictoryOnlyForTriangleCorner(victorySource.index, lastDrop, state);
            default:
                return this.searchVictoryOnlyForTriangleEdge(victorySource.index, lastDrop, state);
        }
    }
    private searchVictoryOnlyForCircle(index: number, lastDrop: Coord, state: SixState): Coord[] {
        const LAST_PLAYER: Player = state.getCurrentOpponent();
        const initialDirection: HexaDirection = HexaDirection.factory.all[index];
        const victory: Coord[] = [lastDrop];
        let testCoord: Coord = lastDrop.getNext(initialDirection, 1);
        while (victory.length < 6) {
            const testedPiece: PlayerOrNone = state.getPieceAt(testCoord);
            if (testedPiece !== LAST_PLAYER) {
                return [];
            }
            const dirIndex: number = (index + victory.length) % 6;
            victory.push(testCoord);
            const dir: HexaDirection = HexaDirection.factory.all[dirIndex];
            testCoord = testCoord.getNext(dir, 1);
        }
        return victory;
    }
    private searchVictoryOnlyForLine(index: number, lastDrop: Coord, state: SixState): Coord[] {
        const LAST_PLAYER: Player = state.getCurrentOpponent();
        let dir: HexaDirection = HexaDirection.factory.all[index];
        let testCoord: Coord = lastDrop.getNext(dir, 1);
        const victory: Coord[] = [lastDrop];
        let twoDirectionCovered: boolean = false;
        while (victory.length < 6) {
            const testedPiece: PlayerOrNone = state.getPieceAt(testCoord);
            if (testedPiece === LAST_PLAYER) {
                victory.push(testCoord);
            } else {
                if (twoDirectionCovered) {
                    return [];
                } else {
                    twoDirectionCovered = true;
                    dir = dir.getOpposite();
                    testCoord = testCoord.getNext(dir, victory.length);
                }
            }
            testCoord = testCoord.getNext(dir, 1);
        }
        return victory;
    }
    private searchVictoryOnlyForTriangleCorner(index: number, lastDrop: Coord, state: SixState): Coord[] {
        const LAST_PLAYER: Player = state.getCurrentOpponent();
        let edgeDirection: HexaDirection = HexaDirection.factory.all[index];
        const victory: Coord[] = [lastDrop];
        let testCoord: Coord = lastDrop.getNext(edgeDirection, 1);
        while (victory.length < 6) {
            // Testing the corner
            const testedPiece: PlayerOrNone = state.getPieceAt(testCoord);
            if (testedPiece !== LAST_PLAYER) {
                return [];
            }
            if (victory.length % 2 === 0) {
                // reached a corner, let's turn
                const dirIndex: number = (index + victory.length) % 6;
                edgeDirection = HexaDirection.factory.all[dirIndex];
            }
            victory.push(testCoord);
            testCoord = testCoord.getNext(edgeDirection, 1);
        }
        return victory;
    }
    private searchVictoryOnlyForTriangleEdge(index: number, lastDrop: Coord, state: SixState): Coord[] {
        const LAST_PLAYER: Player = state.getCurrentOpponent();
        let edgeDirection: HexaDirection = HexaDirection.factory.all[index];
        const victory: Coord[] = [lastDrop];
        let testCoord: Coord = lastDrop.getNext(edgeDirection, 1);
        while (victory.length < 6) {
            // Testing the corner
            const testedPiece: PlayerOrNone = state.getPieceAt(testCoord);
            if (testedPiece !== LAST_PLAYER) {
                return [];
            }
            victory.push(testCoord);
            if (victory.length % 2 === 0) {
                // reached a corner, let's turn
                const dirIndex: number = (index + victory.length) % 6;
                edgeDirection = HexaDirection.factory.all[dirIndex];
            }
            testCoord = testCoord.getNext(edgeDirection, 1);
        }
        return victory;
    }
}
