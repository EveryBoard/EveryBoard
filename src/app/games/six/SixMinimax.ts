import { Coord } from 'src/app/jscaip/Coord';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPSet } from 'src/app/utils/MGPSet';
import { SixState } from './SixState';
import { SixMove } from './SixMove';
import { SCORE } from 'src/app/jscaip/SCORE';
import { display } from 'src/app/utils/utils';
import { assert } from 'src/app/utils/assert';
import { SixVictorySource, SixNode, SixRules, SixLegalityInformation } from './SixRules';
import { MoveGenerator } from 'src/app/jscaip/MGPNode';
import { BoardValue } from 'src/app/jscaip/BoardValue';
import { Heuristic, Minimax } from 'src/app/jscaip/Minimax';
import { CoordSet } from 'src/app/utils/OptimizedSet';

export class SixMoveGenerator extends MoveGenerator<SixMove, SixState> {
    public getListMoves(node: SixNode): SixMove[] {
        const legalLandings: Coord[] = SixRules.getLegalLandings(node.gameState);
        if (node.gameState.turn < 40) {
            return this.getListDrops(legalLandings);
        } else {
            return this.getMovements(node.gameState, legalLandings);
        }
    }
    protected getMovements(state: SixState, legalLandings: Coord[]): SixMove[] {
        const allPieces: MGPMap<Player, MGPSet<Coord>> = state.getPieces().reverse();
        const currentPlayer: Player = state.getCurrentPlayer();
        const playerPieces: MGPSet<Coord> = allPieces.get(currentPlayer).get();
        return this.getMovementsFrom(state, playerPieces, legalLandings);
    }
    protected getMovementsFrom(state: SixState, starts: MGPSet<Coord>, landings: Coord[]): SixMove[] {
        const deplacements: SixMove[] = [];
        for (const start of starts) {
            for (const landing of landings) {
                const move: SixMove = SixMove.ofMovement(start, landing);
                if (state.isCoordConnected(landing, MGPOptional.of(start))) {
                    const stateAfterMove: SixState = state.movePiece(move);
                    const groupsAfterMove: MGPSet<MGPSet<Coord>> = stateAfterMove.getGroups();
                    if (SixRules.isSplit(groupsAfterMove)) {
                        const largestGroups: MGPSet<MGPSet<Coord>> = SixRules.getLargestGroups(groupsAfterMove);
                        if (largestGroups.size() === 1) {
                            deplacements.push(SixMove.ofMovement(start, landing));
                        } else {
                            for (const group of largestGroups) {
                                const subGroup: Coord = group.getAnyElement().get();
                                const cut: SixMove = SixMove.ofCut(start, landing, subGroup);
                                deplacements.push(cut);
                            }
                        }
                    } else {
                        deplacements.push(move);
                    }
                }
            }
        }
        return deplacements;
    }
    private getListDrops(legalLandings: Coord[]): SixMove[] {
        const drops: SixMove[] = [];
        for (const landing of legalLandings) {
            const drop: SixMove = SixMove.ofDrop(landing);
            drops.push(drop);
        }
        return drops;
    }
}

export class SixReducedMoveGenerator extends SixMoveGenerator {

    private readonly heuristic: SixHeuristic = new SixHeuristic();

    protected override getMovements(state: SixState, legalLandings: Coord[]): SixMove[] {
        const safelyMovablePieceOrFirstOne: MGPSet<Coord> = this.getSafelyMovablePieceOrFirstOne(state);
        return this.getMovementsFrom(state, safelyMovablePieceOrFirstOne, legalLandings);
    }
    private getSafelyMovablePieceOrFirstOne(state: SixState): MGPSet<Coord> {
        const allPieces: MGPMap<Player, MGPSet<Coord>> = state.getPieces().reverse();
        const currentPlayer: Player = state.getCurrentPlayer();
        const playerPieces: MGPSet<Coord> = allPieces.get(currentPlayer).get();
        const firstPiece: Coord = playerPieces.getAnyElement().get();

        const safePieces: Coord[] = [];
        for (const playerPiece of playerPieces) {
            if (this.isPieceBlockingAVictory(state, playerPiece) === false) {
                safePieces.push(playerPiece);
            }
        }
        if (safePieces.length === 0) {
            return new CoordSet([firstPiece]);
        } else {
            return new CoordSet(safePieces);
        }
    }
    private isPieceBlockingAVictory(state: SixState, playerPiece: Coord): boolean {
        const hypotheticalState: SixState = state.switchPiece(playerPiece);

        const fakeDropMove: SixMove = SixMove.ofDrop(playerPiece);
        this.heuristic.startSearchingVictorySources();
        while (this.heuristic.hasNextVictorySource()) {
            this.heuristic.currentVictorySource = this.heuristic.getNextVictorySource();
            const boardInfo: BoardInfo = this.heuristic.searchVictoryOnly(this.heuristic.currentVictorySource,
                                                                          fakeDropMove,
                                                                          hypotheticalState);
            if (boardInfo.status === SCORE.VICTORY) {
                return true;
            }
        }
        return false;
    }
}

export interface BoardInfo {
    status: SCORE,
    victory: MGPOptional<Coord[]>,
    preVictory: MGPOptional<Coord>,
    sum: number,
}

export class SixHeuristic extends Heuristic<SixMove, SixState> {

    public VERBOSE: boolean = false;

    public currentVictorySource: SixVictorySource;

    public getBoardValue(node: SixNode): BoardValue {
        const move: MGPOptional<SixMove> = node.move;
        const state: SixState = node.gameState;
        const LAST_PLAYER: Player = state.getCurrentOpponent();
        const victoryValue: number = LAST_PLAYER.getVictoryValue();
        let shapeInfo: BoardInfo = {
            status: SCORE.DEFAULT,
            victory: MGPOptional.empty(),
            preVictory: MGPOptional.empty(),
            sum: 0,
        };
        if (move.isPresent()) {
            shapeInfo = this.calculateBoardValue(move.get(), state);
        }
        if (shapeInfo.status === SCORE.VICTORY) {
            return new BoardValue(victoryValue);
        }
        if (state.turn > 39) {
            const pieces: number[] = state.countPieces();
            const zeroPieces: number = pieces[0];
            const onePieces: number = pieces[1];
            if (zeroPieces < 6 && onePieces < 6) {
                if (zeroPieces < onePieces) {
                    return new BoardValue(Player.ONE.getVictoryValue());
                } else if (onePieces < zeroPieces) {
                    return new BoardValue(Player.ZERO.getVictoryValue());
                } else {
                    return new BoardValue(0); // Draw
                }
            } else if (zeroPieces < 6) {
                return new BoardValue(Player.ZERO.getDefeatValue());
            } else if (onePieces < 6) {
                return new BoardValue(Player.ONE.getDefeatValue());
            } else {
                return new BoardValue(zeroPieces - onePieces);
            }
        }
        if (shapeInfo.status === SCORE.PRE_VICTORY) {
            return new BoardValue(LAST_PLAYER.getPreVictory());
        }
        return new BoardValue(shapeInfo.sum * LAST_PLAYER.getScoreModifier());
    }
    public calculateBoardValue(move: SixMove, state: SixState): BoardInfo {
        this.startSearchingVictorySources();
        const boardInfo: BoardInfo = {
            status: SCORE.DEFAULT,
            victory: MGPOptional.empty(),
            preVictory: MGPOptional.empty(),
            sum: 0,
        };
        while (this.hasNextVictorySource()) {
            const victorySource: SixVictorySource = this.getNextVictorySource();
            let newBoardInfo: BoardInfo;
            if (boardInfo.status === SCORE.PRE_VICTORY) {
                newBoardInfo = this.searchVictoryOnly(victorySource, move, state);
            } else {
                newBoardInfo = this.getBoardInfo(victorySource, move, state, boardInfo);
            }
            if (newBoardInfo.status === SCORE.VICTORY) {
                return newBoardInfo;
            }
            boardInfo.status = newBoardInfo.status;
            boardInfo.sum = boardInfo.sum + newBoardInfo.sum;
            if (boardInfo.preVictory.isAbsent()) {
                boardInfo.preVictory = newBoardInfo.preVictory;
            }
        }
        return boardInfo;
    }
    public startSearchingVictorySources(): void {
        display(this.VERBOSE, 'SixRules.startSearchingVictorySources()');
        this.currentVictorySource = {
            typeSource: 'LINE',
            index: -1,
        };
    }
    public hasNextVictorySource(): boolean {
        return this.currentVictorySource.typeSource !== 'CIRCLE' ||
            this.currentVictorySource.index !== 5;
    }
    public getNextVictorySource(): SixVictorySource {
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
    public searchVictoryOnly(victorySource: SixVictorySource, move: SixMove, state: SixState): BoardInfo {
        const lastDrop: Coord = move.landing;
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
    public searchVictoryOnlyForCircle(index: number, lastDrop: Coord, state: SixState): BoardInfo {
        display(this.VERBOSE,
                { called: 'SixRules.searchVictoryOnlyForCircle', index, lastDrop, state });
        const LAST_PLAYER: Player = state.getCurrentOpponent();
        const initialDirection: HexaDirection = HexaDirection.factory.all[index];
        const testedCoords: Coord[] = [lastDrop];
        let testCoord: Coord = lastDrop.getNext(initialDirection, 1);
        while (testedCoords.length < 6) {
            const testedPiece: PlayerOrNone = state.getPieceAt(testCoord);
            if (testedPiece !== LAST_PLAYER) {
                return {
                    status: SCORE.PRE_VICTORY,
                    victory: MGPOptional.empty(),
                    preVictory: MGPOptional.empty(),
                    sum: 0,
                };
            }
            const dirIndex: number = (index + testedCoords.length) % 6;
            testedCoords.push(testCoord);
            const dir: HexaDirection = HexaDirection.factory.all[dirIndex];
            testCoord = testCoord.getNext(dir, 1);
        }
        return {
            status: SCORE.VICTORY,
            victory: MGPOptional.of(testedCoords),
            preVictory: MGPOptional.empty(),
            sum: 0,
        };
    }
    public searchVictoryOnlyForLine(index: number, lastDrop: Coord, state: SixState): BoardInfo {
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
                    return {
                        status: SCORE.PRE_VICTORY,
                        victory: MGPOptional.empty(),
                        preVictory: MGPOptional.empty(),
                        sum: 0,
                    };
                } else {
                    twoDirectionCovered = true;
                    dir = dir.getOpposite();
                    testCoord = testCoord.getNext(dir, victory.length - 1);
                }
            }
            testCoord = testCoord.getNext(dir, 1);
        }
        return {
            status: SCORE.VICTORY,
            victory: MGPOptional.of(victory),
            preVictory: MGPOptional.empty(),
            sum: 0,
        };
    }
    public searchVictoryOnlyForTriangleCorner(index: number, lastDrop: Coord, state: SixState): BoardInfo {
        display(this.VERBOSE,
                { called: 'SixRules.searchVictoryTriangleCornerOnly', index, lastDrop, state });
        const LAST_PLAYER: Player = state.getCurrentOpponent();
        let edgeDirection: HexaDirection = HexaDirection.factory.all[index];
        const testedCoords: Coord[] = [lastDrop];
        let testCoord: Coord = lastDrop.getNext(edgeDirection, 1);
        while (testedCoords.length < 6) {
            // Testing the corner
            const testedPiece: PlayerOrNone = state.getPieceAt(testCoord);
            if (testedPiece !== LAST_PLAYER) {
                return {
                    status: SCORE.PRE_VICTORY,
                    victory: MGPOptional.empty(),
                    preVictory: MGPOptional.empty(),
                    sum: 0,
                };
            }
            if (testedCoords.length % 2 === 0) {
                // reached a corner, let's turn
                const dirIndex: number = (index + testedCoords.length) % 6;
                edgeDirection = HexaDirection.factory.all[dirIndex];
            }
            testedCoords.push(testCoord);
            testCoord = testCoord.getNext(edgeDirection, 1);
        }
        return {
            status: SCORE.VICTORY,
            victory: MGPOptional.of(testedCoords),
            preVictory: MGPOptional.empty(),
            sum: 0,
        };
    }
    public searchVictoryOnlyForTriangleEdge(index: number, lastDrop: Coord, state: SixState): BoardInfo {
        display(this.VERBOSE,
                { called: 'SixRules.searchVictoryTriangleEdgeOnly', index, lastDrop, state });
        const LAST_PLAYER: Player = state.getCurrentOpponent();
        let edgeDirection: HexaDirection = HexaDirection.factory.all[index];
        const testedCoords: Coord[] = [lastDrop];
        let testCoord: Coord = lastDrop.getNext(edgeDirection, 1);
        while (testedCoords.length < 6) {
            // Testing the corner
            const testedPiece: PlayerOrNone = state.getPieceAt(testCoord);
            if (testedPiece !== LAST_PLAYER) {
                return {
                    status: SCORE.PRE_VICTORY,
                    victory: MGPOptional.empty(),
                    preVictory: MGPOptional.empty(),
                    sum: 0,
                };
            }
            testedCoords.push(testCoord);
            if (testedCoords.length % 2 === 0) {
                // reached a corner, let's turn
                const dirIndex: number = (index + testedCoords.length) % 6;
                edgeDirection = HexaDirection.factory.all[dirIndex];
            }
            testCoord = testCoord.getNext(edgeDirection, 1);
        }
        return {
            status: SCORE.VICTORY,
            victory: MGPOptional.of(testedCoords),
            preVictory: MGPOptional.empty(),
            sum: 0,
        };
    }
    public getBoardInfo(victorySource: SixVictorySource,
                        move: SixMove,
                        state: SixState,
                        boardInfo: BoardInfo)
    : BoardInfo
    {
        display(this.VERBOSE,
                { called: 'SixRules.getBoardInfo', victorySource, move, state, boardInfo });
        const lastDrop: Coord = move.landing;
        switch (victorySource.typeSource) {
            case 'CIRCLE':
                return this.getBoardInfoForCircle(victorySource.index, lastDrop, state, boardInfo);
            case 'LINE':
                return this.getBoardInfoForLine(victorySource.index, lastDrop, state, boardInfo);
            case 'TRIANGLE_CORNER':
                return this.getBoardInfoForTriangleCorner(victorySource.index, lastDrop, state, boardInfo);
            default:
                return this.getBoardInfoForTriangleEdge(victorySource.index, lastDrop, state, boardInfo);
        }
    }
    public getBoardInfoForCircle(index: number, lastDrop: Coord, state: SixState, boardInfo: BoardInfo): BoardInfo {
        display(this.VERBOSE,
                { called: 'SixMinimaw.getBoardInfoForCircle', index, lastDrop, state, boardInfo });
        const LAST_OPPONENT: Player = state.getCurrentPlayer();
        const initialDirection: HexaDirection = HexaDirection.factory.all[index];
        const testedCoords: Coord[] = [lastDrop];
        let testCoord: Coord = lastDrop.getNext(initialDirection, 1);
        let subSum: number = 0;
        let lastEmpty: MGPOptional<Coord> = MGPOptional.empty();
        while (testedCoords.length < 6) {
            const testedPiece: PlayerOrNone = state.getPieceAt(testCoord);
            if (testedPiece === LAST_OPPONENT) {
                return boardInfo; // nothing to add here
            }
            const dirIndex: number = (index + testedCoords.length) % 6;
            testedCoords.push(testCoord);
            const dir: HexaDirection = HexaDirection.factory.all[dirIndex];
            if (testedPiece === PlayerOrNone.NONE) {
                subSum += 0.16; // roughly 1/6
                lastEmpty = MGPOptional.of(testCoord);
            } else {
                subSum++;
            }
            testCoord = testCoord.getNext(dir, 1);
        }
        return this.getBoardInfoResult(subSum, lastEmpty, testedCoords, boardInfo);
    }
    public getBoardInfoResult(subSum: number,
                              lastEmpty: MGPOptional<Coord>,
                              testedCoords: Coord[],
                              boardInfo: BoardInfo)
    : BoardInfo
    {
        let preVictory: MGPOptional<Coord> = boardInfo.preVictory;
        if (subSum === 4.16) {
            display(this.VERBOSE, '5+1 found!');
            // We found 5 pieces aligned and one space, so that space is a preVictory coord
            if (preVictory.isPresent() && (preVictory.equals(lastEmpty) === false)) {
                return {
                    status: SCORE.PRE_VICTORY,
                    victory: MGPOptional.empty(),
                    preVictory: MGPOptional.empty(),
                    sum: 0,
                };
            } else {
                preVictory = lastEmpty;
            }
        } else if (subSum === 5) {
            return {
                status: SCORE.VICTORY,
                victory: MGPOptional.of(testedCoords),
                preVictory: MGPOptional.empty(),
                sum: 0,
            };
        }
        return {
            status: boardInfo.status,
            victory: MGPOptional.empty(),
            preVictory,
            sum: boardInfo.sum + subSum,
        };
    }
    public getBoardInfoForLine(index: number, lastDrop: Coord, state: SixState, boardInfo: BoardInfo): BoardInfo {
        display(this.VERBOSE, { called: 'SixRules.getBoardInfoForLine', index, lastDrop, state, boardInfo });
        const dir: HexaDirection = HexaDirection.factory.all[index];
        let testedCoord: Coord = lastDrop.getPrevious(dir, 5);
        let testedCoords: Coord[] = [];
        let encountered: number[] = [];
        let lastEmpty: MGPOptional<Coord> = MGPOptional.empty();
        for (let i: number = 0; i < 6; i++) {
            const empty: MGPOptional<Coord> = this.updateEncounterAndReturnLastEmpty(state, testedCoord, encountered);
            if (empty.isPresent()) {
                lastEmpty = empty;
            }
            testedCoords.push(testedCoord);
            testedCoord = testedCoord.getNext(dir, 1);
        }
        let status: SCORE = boardInfo.status;
        let preVictory: MGPOptional<Coord> = boardInfo.preVictory;
        let nbTested: number = 0;
        let finalSubSum: number = 0;
        while (nbTested < 6) {
            const subSum: number = encountered.reduce((a: number, b: number) => a + b);
            if (subSum === 6) {
                return {
                    status: SCORE.VICTORY,
                    victory: MGPOptional.of(testedCoords),
                    preVictory: MGPOptional.empty(),
                    sum: 0,
                };
            } else if (subSum === 5.16 &&
                status === SCORE.DEFAULT) {
                if (preVictory.isPresent()) {
                    assert(preVictory.equals(lastEmpty) === false,
                           'Impossible to have point aligned with differents line to a same point');
                    status = SCORE.PRE_VICTORY;
                } else {
                    preVictory = lastEmpty;
                }
            }
            finalSubSum = Math.max(finalSubSum, subSum);
            testedCoords = testedCoords.slice(1, 6);
            testedCoords.push(testedCoord);
            encountered = encountered.slice(1, 6);
            const newEmpty: MGPOptional<Coord> =
                this.updateEncounterAndReturnLastEmpty(state, testedCoord, encountered);
            if (newEmpty.isPresent()) {
                lastEmpty = newEmpty;
            }
            nbTested++;
            testedCoord = testedCoord.getNext(dir, 1);
        }
        const newBoardInfo: BoardInfo = {
            status,
            victory: MGPOptional.of(testedCoords),
            preVictory,
            sum: finalSubSum,
        };
        return this.getBoardInfoResult(finalSubSum, lastEmpty, testedCoords, newBoardInfo);
    }
    private updateEncounterAndReturnLastEmpty(state: SixState,
                                              testedCoord: Coord,
                                              encountered: number[]): MGPOptional<Coord> {
        const LAST_OPPONENT: Player = state.getCurrentPlayer();
        switch (state.getPieceAt(testedCoord)) {
            case LAST_OPPONENT:
                encountered.push(-7);
                // just enough to make sum negative when opponent encountered
                return MGPOptional.empty();
            case PlayerOrNone.NONE:
                encountered.push(0.16);
                return MGPOptional.of(testedCoord);
            default:
                encountered.push(1);
                return MGPOptional.empty();
        }
    }
    public getBoardInfoForTriangleCorner(index: number,
                                         lastDrop: Coord,
                                         state: SixState,
                                         boardInfo: BoardInfo)
    : BoardInfo
    {
        display(this.VERBOSE,
                { called: 'SixRules.getBoardInfoForTriangleCorner', index, lastDrop, state, boardInfo });
        const LAST_OPPONENT: Player = state.getCurrentPlayer();
        let edgeDirection: HexaDirection = HexaDirection.factory.all[index];
        const testedCoords: Coord[] = [lastDrop];
        let testCoord: Coord = lastDrop.getNext(edgeDirection, 1);
        let subSum: number = 0;
        let lastEmpty: MGPOptional<Coord> = MGPOptional.empty();
        while (testedCoords.length < 6) {
            // Testing the corner
            const testedPiece: PlayerOrNone = state.getPieceAt(testCoord);
            if (testedPiece === LAST_OPPONENT) {
                return boardInfo;
            }
            if (testedPiece === PlayerOrNone.NONE) {
                subSum += 0.16; // rougly 1/6
                lastEmpty = MGPOptional.of(testCoord);
            } else {
                subSum++;
            }
            if (testedCoords.length % 2 === 0) {
                // reached a corner, let's turn
                const dirIndex: number = (index + testedCoords.length) % 6;
                edgeDirection = HexaDirection.factory.all[dirIndex];
            }
            testedCoords.push(testCoord);
            testCoord = testCoord.getNext(edgeDirection, 1);
        }
        return this.getBoardInfoResult(subSum, lastEmpty, testedCoords, boardInfo);
    }
    public getBoardInfoForTriangleEdge(index: number,
                                       lastDrop: Coord,
                                       state: SixState,
                                       boardInfo: BoardInfo): BoardInfo {

        display(this.VERBOSE, { called: 'SixRules.getBoardInfoForTriangleEdge', index, lastDrop, state, boardInfo });
        const LAST_OPPONENT: Player = state.getCurrentPlayer();
        let edgeDirection: HexaDirection = HexaDirection.factory.all[index];
        const testedCoords: Coord[] = [lastDrop];
        let testCoord: Coord = lastDrop.getNext(edgeDirection, 1);
        let subSum: number = 0;
        let lastEmpty: MGPOptional<Coord> = MGPOptional.empty();
        while (testedCoords.length < 6) {
            // Testing the corner
            const testedPiece: PlayerOrNone = state.getPieceAt(testCoord);
            if (testedPiece === LAST_OPPONENT) {
                return boardInfo;
            }
            if (testedPiece === PlayerOrNone.NONE) {
                subSum += 0.16; // rougly 1/6
                lastEmpty = MGPOptional.of(testCoord);
            } else {
                subSum++;
            }
            testedCoords.push(testCoord);
            if (testedCoords.length % 2 === 0) {
                // reached a corner, let's turn
                const dirIndex: number = (index + testedCoords.length) % 6;
                edgeDirection = HexaDirection.factory.all[dirIndex];
            }
            testCoord = testCoord.getNext(edgeDirection, 1);
        }
        return this.getBoardInfoResult(subSum, lastEmpty, testedCoords, boardInfo);
    }
}

export class SixMinimax extends Minimax<SixMove, SixState, SixLegalityInformation> {

    public constructor() {
        super('Minimax', SixRules.get(), new SixHeuristic(), new SixReducedMoveGenerator());
    }
}
