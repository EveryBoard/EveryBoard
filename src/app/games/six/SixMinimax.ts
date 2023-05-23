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
import { AlignementMinimax, BoardInfo } from 'src/app/jscaip/AlignementMinimax';
import { SixVictorySource, SixNode, SixRules, SixLegalityInformation } from './SixRules';
import { BoardValue } from 'src/app/jscaip/BoardValue';
import { CoordSet } from 'src/app/utils/OptimizedSet';

export class SixBoardValue extends BoardValue {

    public constructor(value: number,
                       public readonly preVictory: MGPOptional<Coord>) {
        super(value);
    }
}

export class SixMinimax extends AlignementMinimax<SixMove,
                                                  SixState,
                                                  SixLegalityInformation,
                                                  SixVictorySource,
                                                  SixBoardValue>
{

    private static singleton: MGPOptional<SixMinimax> = MGPOptional.empty();

    public VERBOSE: boolean = false;

    public static get(): SixMinimax {
        if (SixMinimax.singleton.isAbsent()) {
            const rules: SixRules = SixRules.get();
            SixMinimax.singleton = MGPOptional.of(new SixMinimax(rules, 'SixMinimax'));
        }
        return SixMinimax.singleton.get();
    }
    private currentVictorySource: SixVictorySource;

    public getListMoves(node: SixNode): SixMove[] {
        const minimax: SixMinimax = SixMinimax.get();
        const unheritance: SixBoardValue = node.getOwnValue(minimax);
        if (unheritance.preVictory.isPresent()) {
            if (node.gameState.turn < 40) {
                console.log('creating forced drop')
                return this.createForcedDrop(unheritance);
            } else {
                return this.createForcedMovement(node, unheritance);
            }
        }
        const legalLandings: Coord[] = SixRules.getLegalLandings(node.gameState);
        if (node.gameState.turn < 40) {
            return this.getListDrop(legalLandings);
        } else {
            return this.getMovement(node.gameState, legalLandings);
        }
    }
    private getMovement(state: SixState, legalLandings: Coord[]): SixMove[] {
        const safelyMovablePieceOrFirstOne: MGPSet<Coord> = this.getSafelyMovablePieceOrFirstOne(state);
        return this.getMovementFrom(state, safelyMovablePieceOrFirstOne, legalLandings);
    }
    private createForcedDrop(unheritance: SixBoardValue): SixMove[] {
        display(this.VERBOSE, { called: 'SixMinimax.createForceDrop', unheritance });
        const forcedMove: SixMove[] = [];
        const move: SixMove = SixMove.fromDrop(unheritance.preVictory.get());
        forcedMove.push(move);
        return forcedMove;
    }
    private createForcedMovement(node: SixNode, unheritance: SixBoardValue): SixMove[] {
        display(this.VERBOSE, { called: 'SixRules.createForcedDeplacement', node });
        const possiblesStarts: MGPSet<Coord> = this.getSafelyMovablePieceOrFirstOne(node.gameState);
        const legalLandings: Coord[] = [unheritance.preVictory.get()];
        return this.getMovementFrom(node.gameState, possiblesStarts, legalLandings);
    }
    private getMovementFrom(state: SixState, starts: MGPSet<Coord>, landings: Coord[]): SixMove[] {
        const deplacements: SixMove[] = [];
        for (const start of starts) {
            for (const landing of landings) {
                const move: SixMove = SixMove.fromMovement(start, landing);
                if (state.isCoordConnected(landing, MGPOptional.of(start))) {
                    const stateAfterMove: SixState = state.movePiece(move);
                    const groupsAfterMove: MGPSet<MGPSet<Coord>> = stateAfterMove.getGroups();
                    if (SixRules.isSplit(groupsAfterMove)) {
                        const largestGroups: MGPSet<MGPSet<Coord>> = SixRules.getLargestGroups(groupsAfterMove);
                        if (largestGroups.size() === 1) {
                            deplacements.push(SixMove.fromMovement(start, landing));
                        } else {
                            for (const group of largestGroups) {
                                const subGroup: Coord = group.getAnyElement().get();
                                const cut: SixMove = SixMove.fromCut(start, landing, subGroup);
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

        const fakeDropMove: SixMove = SixMove.fromDrop(playerPiece);
        this.startSearchingVictorySources();
        while (this.hasNextVictorySource()) {
            this.currentVictorySource = this.getNextVictorySource();
            const boardInfo: BoardInfo = this.searchVictoryOnly(this.currentVictorySource,
                                                                fakeDropMove,
                                                                hypotheticalState);
            if (boardInfo.status === SCORE.VICTORY) {
                return true;
            }
        }
        return false;
    }
    public getListDrop(legalLandings: Coord[]): SixMove[] {
        const drops: SixMove[] = [];
        for (const landing of legalLandings) {
            const drop: SixMove = SixMove.fromDrop(landing);
            drops.push(drop);
        }
        return drops;
    }
    public getBoardValue(node: SixNode): SixBoardValue {
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
            console.log('victoire at', node.gameState.turn)
            return new SixBoardValue(victoryValue, MGPOptional.empty());
        }
        if (state.turn > 39) {
            const pieces: number[] = state.countPieces();
            const zeroPieces: number = pieces[0];
            const onePieces: number = pieces[1];
            if (zeroPieces < 6 && onePieces < 6) {
                if (zeroPieces < onePieces) {
                    return new SixBoardValue(Player.ONE.getVictoryValue(), MGPOptional.empty());
                } else if (onePieces < zeroPieces) {
                    return new SixBoardValue(Player.ZERO.getVictoryValue(), MGPOptional.empty());
                } else {
                    return new SixBoardValue(0, MGPOptional.empty()); // DRAW
                }
            } else if (zeroPieces < 6) {
                return new SixBoardValue(Player.ZERO.getDefeatValue(), MGPOptional.empty());
            } else if (onePieces < 6) {
                return new SixBoardValue(Player.ONE.getDefeatValue(), MGPOptional.empty());
            } else {
                return new SixBoardValue(zeroPieces - onePieces, shapeInfo.preVictory);
            }
        }
        if (shapeInfo.status === SCORE.PRE_VICTORY) {
            console.log('pre-victoire at', node.gameState.turn)
            return new SixBoardValue(LAST_PLAYER.getPreVictory(), shapeInfo.preVictory);
        }
        console.log('neutre at', node.gameState.turn)
        return new SixBoardValue(shapeInfo.sum * LAST_PLAYER.getScoreModifier(), shapeInfo.preVictory);
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
