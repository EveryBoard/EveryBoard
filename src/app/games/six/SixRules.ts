import { Coord } from 'src/app/jscaip/Coord';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { MGPMap, ReversibleMap } from 'src/app/utils/MGPMap';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPSet } from 'src/app/utils/MGPSet';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { SixState } from './SixState';
import { SixMove } from './SixMove';
import { SixFailure } from './SixFailure';
import { display } from 'src/app/utils/utils';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { SixNodeUnheritance } from './SixMinimax';

export type SixLegalityInformation = MGPSet<Coord>;

export class SixNode extends MGPNode<SixRules, SixMove, SixState, SixLegalityInformation, SixNodeUnheritance> {
}
export interface SixVictorySource {
    typeSource: 'LINE' | 'TRIANGLE_CORNER' | 'TRIANGLE_EDGE' | 'CIRCLE',
    index: number,
}

export class SixRules extends Rules<SixMove,
                                    SixState,
                                    SixLegalityInformation,
                                    SixNodeUnheritance>
{

    public VERBOSE: boolean = false;

    private currentVictorySource: SixVictorySource;

    public applyLegalMove(move: SixMove,
                          state: SixState,
                          kept: SixLegalityInformation)
    : SixState
    {
        if (state.turn < 40) {
            return state.applyLegalDrop(move.landing);
        } else {
            return state.applyLegalDeplacement(move, kept);
        }
    }
    public isLegal(move: SixMove, state: SixState): MGPFallible<SixLegalityInformation> {
        display(this.VERBOSE, { called: 'SixRules.isLegal', move, state });
        const landingLegality: MGPValidation = state.isIllegalLandingZone(move.landing, move.start);
        if (landingLegality.isFailure()) {
            return landingLegality.toFailedFallible();
        }
        if (state.turn < 40) {
            return this.isLegalDrop(move, state);
        } else {
            return SixRules.isLegalPhaseTwoMove(move, state);
        }
    }
    public static getLegalLandings(state: SixState): Coord[] {
        const neighboors: MGPSet<Coord> = new MGPSet();
        for (const piece of state.pieces.listKeys()) {
            for (const dir of HexaDirection.factory.all) {
                const neighboor: Coord = piece.getNext(dir, 1);
                if (state.getPieceAt(neighboor) === Player.NONE) {
                    neighboors.add(neighboor);
                }
            }
        }
        return neighboors.getCopy();
    }
    public isLegalDrop(move: SixMove, state: SixState): MGPFallible<SixLegalityInformation> {
        if (move.isDrop() === false) {
            return MGPFallible.failure('Cannot do deplacement before 42th turn!');
        }
        return MGPFallible.success(state.pieces.getKeySet());
    }
    public static isLegalPhaseTwoMove(move: SixMove, state: SixState): MGPFallible<SixLegalityInformation> {
        if (move.isDrop()) {
            return MGPFallible.failure('Can no longer drop after 40th turn!');
        }
        switch (state.getPieceAt(move.start.get())) {
            case Player.NONE:
                return MGPFallible.failure('Cannot move empty coord!');
            case state.getCurrentOpponent():
                return MGPFallible.failure(RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
        }
        const piecesAfterDeplacement: ReversibleMap<Coord, Player> = SixState.deplacePiece(state, move);
        const groupsAfterMove: MGPSet<MGPSet<Coord>> =
            SixState.getGroups(piecesAfterDeplacement, move.start.get());
        if (SixRules.isSplit(groupsAfterMove)) {
            const biggerGroups: MGPSet<MGPSet<Coord>> = this.getBiggerGroups(groupsAfterMove);
            if (biggerGroups.size() === 1) {
                if (move.keep.isPresent()) {
                    return MGPFallible.failure(SixFailure.CANNOT_CHOOSE_TO_KEEP());
                } else {
                    return MGPFallible.success(biggerGroups.get(0));
                }
            } else {
                return this.moveKeepBiggerGroup(move.keep, biggerGroups, piecesAfterDeplacement);
            }
        } else {
            return MGPFallible.success(new MGPSet());
        }
    }
    public static isSplit(groups: MGPSet<MGPSet<Coord>>): boolean {
        return groups.size() > 1;
    }
    public static getBiggerGroups(groups: MGPSet<MGPSet<Coord>>): MGPSet<MGPSet<Coord>> {
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
    public static moveKeepBiggerGroup(keep: MGPOptional<Coord>,
                                      biggerGroups: MGPSet<MGPSet<Coord>>,
                                      pieces: MGPMap<Coord, Player>)
    : MGPFallible<SixLegalityInformation>
    {
        if (keep.isAbsent()) {
            return MGPFallible.failure(SixFailure.MUST_CUT());
        }
        if (pieces.get(keep.get()).isAbsent()) {
            return MGPFallible.failure(SixFailure.CANNOT_KEEP_EMPTY_COORD());
        }
        const keptCoord: Coord = keep.get();
        for (let i: number = 0; i < biggerGroups.size(); i++) {
            const subGroup: MGPSet<Coord> = biggerGroups.get(i);
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
        if (node.move.isPresent()) {
            shapeVictory = this.getShapeVictory(node.move.get(), state);
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
        display(this.VERBOSE, 'SixRules.startSearchingVictorySources()');
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
        const lastDrop: Coord = move.landing.getNext(state.offset, 1);
        display(this.VERBOSE, { called: 'SixRules.searchVictoryOnly', victorySource, move, state });
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
        display(this.VERBOSE,
                { called: 'SixRules.searchVictoryOnlyForCircle', index, lastDrop, state });
        const LAST_PLAYER: Player = state.getCurrentOpponent();
        const initialDirection: HexaDirection = HexaDirection.factory.all[index];
        const victory: Coord[] = [lastDrop];
        let testCoord: Coord = lastDrop.getNext(initialDirection, 1);
        while (victory.length < 6) {
            const testedPiece: Player = state.getPieceAt(testCoord);
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
            const testedPiece: Player = state.getPieceAt(testCoord);
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
        display(this.VERBOSE,
                { called: 'SixRules.searchVictoryTriangleCornerOnly', index, lastDrop, state });
        const LAST_PLAYER: Player = state.getCurrentOpponent();
        let edgeDirection: HexaDirection = HexaDirection.factory.all[index];
        const victory: Coord[] = [lastDrop];
        let testCoord: Coord = lastDrop.getNext(edgeDirection, 1);
        while (victory.length < 6) {
            // Testing the corner
            const testedPiece: Player = state.getPieceAt(testCoord);
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
        display(this.VERBOSE,
                { called: 'SixRules.searchVictoryTriangleEdgeOnly', index, lastDrop, state });
        const LAST_PLAYER: Player = state.getCurrentOpponent();
        let edgeDirection: HexaDirection = HexaDirection.factory.all[index];
        const victory: Coord[] = [lastDrop];
        let testCoord: Coord = lastDrop.getNext(edgeDirection, 1);
        while (victory.length < 6) {
            // Testing the corner
            const testedPiece: Player = state.getPieceAt(testCoord);
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
