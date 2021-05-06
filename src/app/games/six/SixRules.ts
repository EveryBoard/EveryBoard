import { Coord } from 'src/app/jscaip/Coord';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { MGPMap } from 'src/app/utils/mgp-map/MGPMap';
import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';
import { MGPSet } from 'src/app/utils/mgp-set/MGPSet';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';
import { SixGameState } from './SixGameState';
import { SixMove } from './SixMove';
import { SixLegalityStatus } from './SixLegalityStatus';
import { SixFailure } from './SixFailure';
import { SCORE } from 'src/app/jscaip/SCORE';
import { assert, display } from 'src/app/utils/utils/utils';
import { AlignementMinimax, BoardInfo } from 'src/app/jscaip/AlignementMinimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';

export interface SixNodeUnheritance extends NodeUnheritance {

    value: number;

    preVictory?: Coord;
}
export class SixNode extends MGPNode<SixRules, SixMove, SixGameState, SixLegalityStatus, SixNodeUnheritance> {
}
interface SixVictorySource {
    typeSource: 'LINE' | 'TRIANGLE_CORNER' | 'TRIANGLE_EDGE' | 'CIRCLE',
    index: number,
}
export class SixRules extends AlignementMinimax<SixMove,
                                                SixGameState,
                                                SixLegalityStatus,
                                                SixVictorySource> {

    public VERBOSE: boolean = false;

    private currentVictorySource: SixVictorySource;

    public getListMoves(node: SixNode): MGPMap<SixMove, SixGameState> {
        if (node.unheritance && node.unheritance.preVictory) {
            if (node.gamePartSlice.turn < 40) {
                return this.createForcedDrop(node);
            } else {
                return this.createForcedDeplacement(node);
            }
        }
        const legalLandings: Coord[] = this.getLegalLandings(node.gamePartSlice);
        if (node.gamePartSlice.turn < 40) {
            return this.getListDrop(node.gamePartSlice, legalLandings);
        } else {
            return this.getListDeplacement(node.gamePartSlice, legalLandings);
        }
    }
    private createForcedDrop(node: SixNode): MGPMap<SixMove, SixGameState> {
        display(this.VERBOSE, { called: 'SixRules.createForceDrop', node });
        const forcedMove: MGPMap<SixMove, SixGameState> = new MGPMap();
        const move: SixMove = SixMove.fromDrop(node.unheritance.preVictory);
        const status: SixLegalityStatus = { legal: MGPValidation.SUCCESS, kept: null };
        const state: SixGameState = this.applyLegalMove(move, node.gamePartSlice, status);
        forcedMove.put(move, state);
        return forcedMove;
    }
    private createForcedDeplacement(node: SixNode): MGPMap<SixMove, SixGameState> {
        display(this.VERBOSE, { called: 'SixRules.createForcedDeplacement', node });
        const possiblesStarts: MGPSet<Coord> = this.getSafelyMovablePieceOrFirstOne(node);
        const legalLandings: Coord[] = [node.unheritance.preVictory];
        return this.getDeplacementFrom(node.gamePartSlice, possiblesStarts, legalLandings);
    }
    private getDeplacementFrom(state: SixGameState,
                               starts: MGPSet<Coord>,
                               landings: Coord[])
    : MGPMap<SixMove, SixGameState>
    {
        const deplacements: MGPMap<SixMove, SixGameState> = new MGPMap();
        for (let i: number = 0; i < starts.size(); i++) {
            const start: Coord = starts.get(i);
            for (const landing of landings) {
                const move: SixMove = SixMove.fromDeplacement(start, landing);
                if (state.isCoordConnected(landing, start)) {
                    const legality: SixLegalityStatus = this.isPhaseTwoMove(move, state);
                    if (legality.legal.isSuccess()) { // TODO: cuttingMove
                        const resultingState: SixGameState =
                            this.applyLegalMove(move, state, legality);
                        deplacements.put(move, resultingState);
                    }
                }
            }
        }
        return deplacements;
    }
    private getSafelyMovablePieceOrFirstOne(node: SixNode): MGPSet<Coord> {
        const state: SixGameState = node.gamePartSlice;
        const allPieces: MGPMap<Player, MGPSet<Coord>> = state.pieces.groupByValue();
        const currentPlayer: Player = state.getCurrentPlayer();
        const playerPieces: MGPSet<Coord> = allPieces.get(currentPlayer).get();
        const firstPiece: Coord = playerPieces.get(0);

        const safePieces: Coord[] = [];
        for (let i: number = 0; i < playerPieces.size(); i++) {
            const playerPiece: Coord = playerPieces.get(i);
            if (this.isPieceBlockingAVictory(state, playerPiece) === false) {
                safePieces.push(playerPiece);
            }
        }
        if (safePieces.length === 0) {
            return new MGPSet<Coord>([firstPiece]);
        } else {
            return new MGPSet<Coord>(safePieces);
        }
    }
    private isPieceBlockingAVictory(state: SixGameState, playerPiece: Coord): boolean {
        const hypotheticalState: SixGameState = state.switchPiece(playerPiece);

        const fakeDropMove: SixMove = SixMove.fromDrop(playerPiece);
        this.startSearchingVictorySources();
        while (this.hasNextVictorySource()) {
            this.currentVictorySource = this.getNextVictorySource();
            const boardInfo: BoardInfo =
                this.searchVictoryOnly(this.currentVictorySource, fakeDropMove, hypotheticalState);
            if (boardInfo.status === SCORE.VICTORY) {
                return true;
            }
        }
        return false;
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
        const CURRENT_PLAYER: Player = state.getCurrentPlayer();
        const start: MGPSet<Coord> = state.pieces.groupByValue().get(CURRENT_PLAYER).get();
        return this.getDeplacementFrom(state, start, legalLandings);
    }
    public getBoardValue(move: SixMove, slice: SixGameState): { value: number, preVictory?: Coord } {
        // const lastDrop: Coord = move.landing.getNext(slice.offset, 1);
        const LAST_PLAYER: Player = slice.getCurrentEnnemy();
        const victoryValue: number = LAST_PLAYER.getVictoryValue();
        // const shapeInfo: BoardInfo = this.getShapeInfo(lastDrop, slice);
        const shapeInfo: BoardInfo = this.calculateBoardValue(move, slice);
        let preVictory: Coord | null;
        if (shapeInfo.status === SCORE.DEFAULT) {
            preVictory = shapeInfo.preVictory.getOrNull();
        }
        if (shapeInfo.status === SCORE.VICTORY) {
            return { value: victoryValue, preVictory: null };
        }
        if (slice.turn > 39) {
            const pieces: number[] = slice.countPieces();
            const zeroPieces: number = pieces[0];
            const onePieces: number = pieces[1];
            if (zeroPieces < 6 && onePieces < 6) {
                if (zeroPieces < onePieces) {
                    return { value: Player.ONE.getVictoryValue() };
                } else if (onePieces < zeroPieces) {
                    return { value: Player.ZERO.getVictoryValue() };
                } else {
                    return { value: 0 }; // DRAW
                }
            } else if (zeroPieces < 6) {
                return { value: Player.ZERO.getDefeatValue() };
            } else if (onePieces < 6) {
                return { value: Player.ONE.getDefeatValue() };
            } else {
                return {
                    value: zeroPieces - onePieces,
                    preVictory,
                };
            }
        }
        if (shapeInfo.status === SCORE.PRE_VICTORY) {
            return {
                value: LAST_PLAYER.getPreVictory(),
                preVictory,
            };
        }
        return {
            value: shapeInfo.sum * LAST_PLAYER.getScoreModifier(),
            preVictory,
        };
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
    public searchVictoryOnly(victorySource: SixVictorySource, move: SixMove, state: SixGameState): BoardInfo {
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
    public searchVictoryOnlyForCircle(index: number, lastDrop: Coord, state: SixGameState): BoardInfo {
        display(this.VERBOSE,
                { called: 'SixRules.searchVictoryOnlyForCircle', index, lastDrop, state });
        const LAST_PLAYER: Player = state.getCurrentEnnemy();
        const initialDirection: HexaDirection = HexaDirection.factory.all[index];
        const testedCoords: Coord[] = [lastDrop];
        let testCoord: Coord = lastDrop.getNext(initialDirection, 1);
        while (testedCoords.length < 6) {
            const testedPiece: Player = state.getPieceAt(testCoord);
            if (testedPiece !== LAST_PLAYER) {
                return {
                    status: SCORE.PRE_VICTORY,
                    preVictory: null, sum: null, victory: null,
                };
            }
            const dirIndex: number = (index + testedCoords.length) % 6;
            testedCoords.push(testCoord);
            const dir: HexaDirection = HexaDirection.factory.all[dirIndex];
            testCoord = testCoord.getNext(dir, 1);
        }
        return {
            status: SCORE.VICTORY,
            victory: testedCoords,
            preVictory: null, sum: null,
        };
    }
    public searchVictoryOnlyForLine(index: number, lastDrop: Coord, state: SixGameState): BoardInfo {
        const LAST_PLAYER: Player = state.getCurrentEnnemy();
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
                    return {
                        status: SCORE.PRE_VICTORY,
                        preVictory: null, sum: null, victory: null,
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
            victory,
            preVictory: null, sum: null,
        };
    }
    public searchVictoryOnlyForTriangleCorner(index: number, lastDrop: Coord, state: SixGameState): BoardInfo {
        display(this.VERBOSE,
                { called: 'SixRules.searchVictoryTriangleCornerOnly', index, lastDrop, state });
        const LAST_PLAYER: Player = state.getCurrentEnnemy();
        let edgeDirection: HexaDirection = HexaDirection.factory.all[index];
        const testedCoords: Coord[] = [lastDrop];
        let testCoord: Coord = lastDrop.getNext(edgeDirection, 1);
        while (testedCoords.length < 6) {
            // Testing the corner
            const testedPiece: Player = state.getPieceAt(testCoord);
            if (testedPiece !== LAST_PLAYER) {
                return {
                    status: SCORE.PRE_VICTORY,
                    preVictory: null, sum: null, victory: null,
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
            victory: testedCoords,
            preVictory: null, sum: null,
        };
    }
    public searchVictoryOnlyForTriangleEdge(index: number, lastDrop: Coord, state: SixGameState): BoardInfo {
        display(this.VERBOSE,
                { called: 'SixRules.searchVictoryTriangleEdgeOnly', index, lastDrop, state });
        const LAST_PLAYER: Player = state.getCurrentEnnemy();
        let edgeDirection: HexaDirection = HexaDirection.factory.all[index];
        const testedCoords: Coord[] = [lastDrop];
        let testCoord: Coord = lastDrop.getNext(edgeDirection, 1);
        while (testedCoords.length < 6) {
            // Testing the corner
            const testedPiece: Player = state.getPieceAt(testCoord);
            if (testedPiece !== LAST_PLAYER) {
                return {
                    status: SCORE.PRE_VICTORY,
                    preVictory: null, sum: null, victory: null,
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
            victory: testedCoords,
            preVictory: null, sum: null,
        };
    }
    public getBoardInfo(victorySource: SixVictorySource,
                        move: SixMove,
                        state: SixGameState,
                        boardInfo: BoardInfo)
                        : BoardInfo
    {
        display(this.VERBOSE,
                { called: 'SixRules.getBoardInfo', victorySource, move, state, boardInfo });
        const lastDrop: Coord = move.landing.getNext(state.offset, 1);
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
    public getBoardInfoForCircle(index: number, lastDrop: Coord, state: SixGameState, boardInfo: BoardInfo): BoardInfo {
        display(this.VERBOSE,
                { called: 'SixRules.getBoardInfoForCircle', index, lastDrop, state, boardInfo });
        const LAST_ENNEMY: Player = state.getCurrentPlayer();
        const initialDirection: HexaDirection = HexaDirection.factory.all[index];
        const testedCoords: Coord[] = [lastDrop];
        let testCoord: Coord = lastDrop.getNext(initialDirection, 1);
        let subSum: number = 0;
        let lastEmpty: Coord;
        while (testedCoords.length < 6) {
            const testedPiece: Player = state.getPieceAt(testCoord);
            if (testedPiece === LAST_ENNEMY) {
                return boardInfo; // nothing to add here
            }
            const dirIndex: number = (index + testedCoords.length) % 6;
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
        return this.getBoardInfoResult(subSum, lastEmpty, testedCoords, boardInfo);
    }
    public getBoardInfoResult(subSum: number,
                              lastEmpty: Coord,
                              testedCoords: Coord[],
                              boardInfo:BoardInfo)
                              : BoardInfo {
        let preVictory: MGPOptional<Coord> = boardInfo.preVictory;
        if (subSum === 4.16) {
            display(this.VERBOSE, '5+1 found !');
            // We found 5 pieces aligned and one space, so that space is a preVictory coord
            if (preVictory.isPresent() &&
                preVictory.get().equals(lastEmpty) === false)
            {
                return {
                    status: SCORE.PRE_VICTORY,
                    victory: null, preVictory: null, sum: null,
                };
            } else {
                preVictory = MGPOptional.of(lastEmpty);
            }
        } else if (subSum === 5) {
            return {
                status: SCORE.VICTORY,
                victory: testedCoords,
                preVictory: null,
                sum: null,
            };
        }
        return {
            status: boardInfo.status,
            preVictory,
            sum: boardInfo.sum + subSum,
            victory: null,
        };
    }
    public getBoardInfoForLine(index: number, lastDrop: Coord, state: SixGameState, boardInfo: BoardInfo): BoardInfo {
        display(this.VERBOSE,
                { called: 'SixRules.getBoardInfoForLine', index, lastDrop, state, boardInfo });
        const dir: HexaDirection = HexaDirection.factory.all[index];
        let testedCoord: Coord = lastDrop.getPrevious(dir, 5);
        let testedCoords: Coord[] = [];
        let encountered: number[] = [];
        let lastEmpty: Coord;
        for (let i: number = 0; i < 6; i++) {
            const empty: Coord = this.updateEncounterAndReturnLastEmpty(state, testedCoord, encountered);
            if (empty) {
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
            const subSum: number = encountered.reduce((a: number, b: number) => a+b);
            if (subSum === 6) {
                return {
                    status: SCORE.VICTORY,
                    victory: testedCoords,
                    preVictory: null, sum: null,
                };
            } else if (subSum === 5.16 &&
                       status === SCORE.DEFAULT)
            {
                if (preVictory.isPresent()) {
                    assert(preVictory.get().equals(lastEmpty) === false,
                           'Impossible to have point aligned with differents line to a same point'),
                    status = SCORE.PRE_VICTORY;
                } else {
                    preVictory = MGPOptional.of(lastEmpty);
                }
            }
            finalSubSum = Math.max(finalSubSum, subSum);
            testedCoords = testedCoords.slice(1, 6);
            testedCoords.push(testedCoord);
            encountered = encountered.slice(1, 6);
            const newEmpty: Coord = this.updateEncounterAndReturnLastEmpty(state, testedCoord, encountered);
            if (newEmpty) {
                lastEmpty = newEmpty;
            }
            nbTested++;
            testedCoord = testedCoord.getNext(dir, 1);
        }
        const newBoardInfo: BoardInfo = {
            status,
            victory: testedCoords,
            preVictory,
            sum: finalSubSum,
        };
        return this.getBoardInfoResult(finalSubSum, lastEmpty, testedCoords, newBoardInfo);
    }
    private updateEncounterAndReturnLastEmpty(state: SixGameState,
                                              testedCoord: Coord,
                                              encountered: number[])
                                              : Coord
    {
        const LAST_ENNEMY: Player = state.getCurrentPlayer();
        switch (state.getPieceAt(testedCoord)) {
            case LAST_ENNEMY:
                encountered.push(-7);
                // just enough to make sum negative when ennemy encountered
                break;
            case Player.NONE:
                encountered.push(0.16);
                return testedCoord;
            default:
                encountered.push(1);
                break;
        }
    }
    public getBoardInfoForTriangleCorner(index: number,
                                         lastDrop: Coord,
                                         state: SixGameState,
                                         boardInfo: BoardInfo)
                                         : BoardInfo
    {
        display(this.VERBOSE,
                { called: 'SixRules.getBoardInfoForTriangleCorner', index, lastDrop, state, boardInfo });
        const LAST_ENNEMY: Player = state.getCurrentPlayer();
        let edgeDirection: HexaDirection = HexaDirection.factory.all[index];
        const testedCoords: Coord[] = [lastDrop];
        let testCoord: Coord = lastDrop.getNext(edgeDirection, 1);
        let subSum: number = 0;
        let lastEmpty: Coord;
        while (testedCoords.length < 6) {
            // Testing the corner
            const testedPiece: Player = state.getPieceAt(testCoord);
            if (testedPiece === LAST_ENNEMY) {
                return boardInfo;
            }
            if (testedPiece === Player.NONE) {
                subSum += 0.16; // rougly 1/6
                lastEmpty = testCoord;
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
                                       state: SixGameState,
                                       boardInfo: BoardInfo)
                                       : BoardInfo
    {

        display(this.VERBOSE, { called: 'SixRules.getBoardInfoForTriangleEdge', index, lastDrop, state, boardInfo });
        const LAST_ENNEMY: Player = state.getCurrentPlayer();
        let edgeDirection: HexaDirection = HexaDirection.factory.all[index];
        const testedCoords: Coord[] = [lastDrop];
        let testCoord: Coord = lastDrop.getNext(edgeDirection, 1);
        let subSum: number = 0;
        let lastEmpty: Coord;
        while (testedCoords.length < 6) {
            // Testing the corner
            const testedPiece: Player = state.getPieceAt(testCoord);
            if (testedPiece === LAST_ENNEMY) {
                return boardInfo;
            }
            if (testedPiece === Player.NONE) {
                subSum += 0.16; // rougly 1/6
                lastEmpty = testCoord;
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
    public applyLegalMove(move: SixMove,
                          state: SixGameState,
                          status: SixLegalityStatus)
    : SixGameState
    {
        if (state.turn < 40) {
            return state.applyLegalDrop(move.landing);
        } else {
            const kept: MGPSet<Coord> = status.kept;
            return state.applyLegalDeplacement(move, kept);
        }
    }
    public isLegal(move: SixMove, slice: SixGameState): SixLegalityStatus {
        display(this.VERBOSE, { called: 'SixRules.isLegal', move, slice });
        const landingLegality: MGPValidation = slice.isIllegalLandingZone(move.landing, move.start.getOrNull());
        if (landingLegality.isFailure()) {
            return { legal: landingLegality, kept: null };
        }
        if (slice.turn < 40) {
            return this.isLegalDrop(move, slice);
        } else {
            return this.isPhaseTwoMove(move, slice);
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
    public isPhaseTwoMove(move: SixMove, state: SixGameState): SixLegalityStatus {
        if (move.isDrop()) {
            return { legal: MGPValidation.failure('Can no longer drop after 40th turn!'), kept: null };
        }
        switch (state.getPieceAt(move.start.get())) {
            case Player.NONE:
                return { legal: MGPValidation.failure('Cannot move empty coord!'), kept: null };
            case state.getCurrentEnnemy():
                return { legal: MGPValidation.failure('Cannot move ennemy piece!'), kept: null };
        }
        const piecesAfterDeplacement: MGPMap<Coord, Player> = SixGameState.deplacePiece(state, move);
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
                               pieces: MGPMap<Coord, Player>): SixLegalityStatus {
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
