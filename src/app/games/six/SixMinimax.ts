import { Coord } from 'src/app/jscaip/Coord';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { Player } from 'src/app/jscaip/Player';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPSet } from 'src/app/utils/MGPSet';
import { SixState } from './SixState';
import { SixMove } from './SixMove';
import { SCORE } from 'src/app/jscaip/SCORE';
import { assert, display } from 'src/app/utils/utils';
import { AlignementMinimax, BoardInfo } from 'src/app/jscaip/AlignementMinimax';
import { SixVictorySource, SixNode, SixRules, SixLegalityInformation } from './SixRules';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { MGPFallible } from 'src/app/utils/MGPFallible';

export class SixNodeUnheritance extends NodeUnheritance {

    public equals(_o: SixNodeUnheritance): boolean {
        throw new Error('SixNodeUnheritance.equals not implemented.');
    }
    public toString(): string {
        const preVictory: string = this.preVictory.isPresent() ? this.preVictory.get().toString() : 'none';
        return 'value: ' + this.value + ', ' +
               'preVictory: ' + preVictory;
    }
    public constructor(public readonly value: number,
                       public readonly preVictory: MGPOptional<Coord>) {
        super(value);
    }
}

export class SixMinimax extends AlignementMinimax<SixMove,
                                                  SixState,
                                                  SixLegalityInformation,
                                                  SixVictorySource,
                                                  SixNodeUnheritance>
{

    private static INSTANCE: SixMinimax;

    public VERBOSE: boolean = false;

    public static getInstance(): SixMinimax {
        if (SixMinimax.INSTANCE == null) {
            const rules: SixRules = new SixRules(SixState);
            SixMinimax.INSTANCE = new SixMinimax(rules, 'SixMinimax');
        }
        return SixMinimax.INSTANCE;
    }
    private currentVictorySource: SixVictorySource;

    public getListMoves(node: SixNode): SixMove[] {
        const minimax: SixMinimax = SixMinimax.getInstance();
        const unheritance: SixNodeUnheritance = node.getOwnValue(minimax);
        if (unheritance.preVictory.isPresent()) {
            if (node.gameState.turn < 40) {
                return this.createForcedDrop(unheritance);
            } else {
                return this.createForcedDeplacement(node, unheritance);
            }
        }
        const legalLandings: Coord[] = SixRules.getLegalLandings(node.gameState);
        if (node.gameState.turn < 40) {
            return this.getListDrop(node.gameState, legalLandings);
        } else {
            return this.getListDeplacement(node.gameState, legalLandings);
        }
    }
    private createForcedDrop(unheritance: SixNodeUnheritance): SixMove[] {
        display(this.VERBOSE, { called: 'SixMinimax.createForceDrop', unheritance });
        const forcedMove: SixMove[] = [];
        const move: SixMove = SixMove.fromDrop(unheritance.preVictory.get());
        forcedMove.push(move);
        return forcedMove;
    }
    private createForcedDeplacement(node: SixNode, unheritance: SixNodeUnheritance): SixMove[] {
        display(this.VERBOSE, { called: 'SixRules.createForcedDeplacement', node });
        const possiblesStarts: MGPSet<Coord> = this.getSafelyMovablePieceOrFirstOne(node);
        const legalLandings: Coord[] = [unheritance.preVictory.get()];
        return this.getDeplacementFrom(node.gameState, possiblesStarts, legalLandings);
    }
    private getDeplacementFrom(state: SixState,
                               starts: MGPSet<Coord>,
                               landings: Coord[])
    : SixMove[]
    {
        const deplacements: SixMove[] = [];
        for (let i: number = 0; i < starts.size(); i++) {
            const start: Coord = starts.get(i);
            for (const landing of landings) {
                const move: SixMove = SixMove.fromDeplacement(start, landing);
                if (state.isCoordConnected(landing, MGPOptional.of(start))) {
                    const legality: MGPFallible<SixLegalityInformation> = SixRules.isLegalPhaseTwoMove(move, state);
                    if (legality.isSuccess()) { // TODO: cuttingMove
                        deplacements.push(move);
                    }
                }
            }
        }
        return deplacements;
    }
    private getSafelyMovablePieceOrFirstOne(node: SixNode): MGPSet<Coord> {
        const state: SixState = node.gameState;
        const allPieces: MGPMap<Player, MGPSet<Coord>> = state.pieces.reverse();
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
    public getListDrop(_state: SixState, legalLandings: Coord[]): SixMove[] {
        const drops: SixMove[] = [];
        for (const landing of legalLandings) {
            const drop: SixMove = SixMove.fromDrop(landing);
            drops.push(drop);
        }
        return drops;
    }
    public getListDeplacement(state: SixState, legalLandings: Coord[]): SixMove[] {
        // get list pieces belonging to me
        // multiply list with legalLandings
        // check for each if a cut is needed
        const CURRENT_PLAYER: Player = state.getCurrentPlayer();
        const start: MGPSet<Coord> = state.pieces.reverse().get(CURRENT_PLAYER).get();
        return this.getDeplacementFrom(state, start, legalLandings);
    }
    public getBoardValue(node: SixNode): SixNodeUnheritance {
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
        let preVictory: MGPOptional<Coord> = MGPOptional.empty();
        if (shapeInfo.status === SCORE.DEFAULT) {
            if (shapeInfo.preVictory.isPresent()) {
                preVictory = MGPOptional.of(shapeInfo.preVictory.get());
            }
        }
        if (shapeInfo.status === SCORE.VICTORY) {
            return new SixNodeUnheritance(victoryValue, MGPOptional.empty());
        }
        if (state.turn > 39) {
            const pieces: number[] = state.countPieces();
            const zeroPieces: number = pieces[0];
            const onePieces: number = pieces[1];
            if (zeroPieces < 6 && onePieces < 6) {
                if (zeroPieces < onePieces) {
                    return new SixNodeUnheritance(Player.ONE.getVictoryValue(), MGPOptional.empty());
                } else if (onePieces < zeroPieces) {
                    return new SixNodeUnheritance(Player.ZERO.getVictoryValue(), MGPOptional.empty());
                } else {
                    return new SixNodeUnheritance(0, MGPOptional.empty()); // DRAW
                }
            } else if (zeroPieces < 6) {
                return new SixNodeUnheritance(Player.ZERO.getDefeatValue(), MGPOptional.empty());
            } else if (onePieces < 6) {
                return new SixNodeUnheritance(Player.ONE.getDefeatValue(), MGPOptional.empty());
            } else {
                return new SixNodeUnheritance(zeroPieces - onePieces, preVictory);
            }
        }
        if (shapeInfo.status === SCORE.PRE_VICTORY) {
            return new SixNodeUnheritance(LAST_PLAYER.getPreVictory(), preVictory);
        }
        return new SixNodeUnheritance(shapeInfo.sum * LAST_PLAYER.getScoreModifier(), preVictory);
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
    public searchVictoryOnlyForCircle(index: number, lastDrop: Coord, state: SixState): BoardInfo {
        display(this.VERBOSE,
                { called: 'SixRules.searchVictoryOnlyForCircle', index, lastDrop, state });
        const LAST_PLAYER: Player = state.getCurrentOpponent();
        const initialDirection: HexaDirection = HexaDirection.factory.all[index];
        const testedCoords: Coord[] = [lastDrop];
        let testCoord: Coord = lastDrop.getNext(initialDirection, 1);
        while (testedCoords.length < 6) {
            const testedPiece: Player = state.getPieceAt(testCoord);
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
            const testedPiece: Player = state.getPieceAt(testCoord);
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
            const testedPiece: Player = state.getPieceAt(testCoord);
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
            const testedPiece: Player = state.getPieceAt(testCoord);
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
            const testedPiece: Player = state.getPieceAt(testCoord);
            if (testedPiece === LAST_OPPONENT) {
                return boardInfo; // nothing to add here
            }
            const dirIndex: number = (index + testedCoords.length) % 6;
            testedCoords.push(testCoord);
            const dir: HexaDirection = HexaDirection.factory.all[dirIndex];
            if (testedPiece === Player.NONE) {
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
        display(this.VERBOSE,
                { called: 'SixRules.getBoardInfoForLine', index, lastDrop, state, boardInfo });
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
            case Player.NONE:
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
            const testedPiece: Player = state.getPieceAt(testCoord);
            if (testedPiece === LAST_OPPONENT) {
                return boardInfo;
            }
            if (testedPiece === Player.NONE) {
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
            const testedPiece: Player = state.getPieceAt(testCoord);
            if (testedPiece === LAST_OPPONENT) {
                return boardInfo;
            }
            if (testedPiece === Player.NONE) {
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
