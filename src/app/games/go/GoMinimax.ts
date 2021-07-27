import { GoPartSlice, GoPiece, Phase } from './GoPartSlice';
import { GoMove } from './GoMove';
import { GoLegalityStatus } from './GoLegalityStatus';
import { display } from 'src/app/utils/utils';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { GoNode, GoRules } from './GoRules';
import { GoGroupDatas } from './GoGroupsDatas';
import { Coord } from 'src/app/jscaip/Coord';


export class GoMinimax extends Minimax<GoMove, GoPartSlice, GoLegalityStatus> {

    public getListMoves(node: GoNode): GoMove[] {
        const LOCAL_VERBOSE: boolean = false;
        display(GoRules.VERBOSE || LOCAL_VERBOSE, 'GoRules.getListMoves');

        const currentSlice: GoPartSlice = node.gamePartSlice;
        const playingMoves: GoMove[] = this.getPlayingMovesList(currentSlice);
        if (currentSlice.phase === Phase.PLAYING ||
            currentSlice.phase === Phase.PASSED) {
            playingMoves.push(GoMove.PASS);
            return playingMoves;
        } else {
            display(GoRules.VERBOSE || LOCAL_VERBOSE, 'GoRules.getListMoves in counting phase');
            const markingMoves: GoMove[] = this.getCountingMovesList(currentSlice);
            if (markingMoves.length === 0) {
                return [GoMove.ACCEPT];
            } else {
                return markingMoves;
            }
        }
    }
    public getPlayingMovesList(state: GoPartSlice): GoMove[] {
        const choices: GoMove[] = [];
        let newMove: GoMove;

        for (let y: number = 0; y < state.board.length; y++) {
            for (let x: number = 0; x < state.board[0].length; x++) {
                newMove = new GoMove(x, y);
                if (state.getBoardAtGoPiece(newMove.coord) === GoPiece.EMPTY) {
                    const legality: GoLegalityStatus = GoRules.isLegal(newMove, state);
                    if (legality.legal.isSuccess()) {
                        choices.push(newMove);
                    }
                }
            }
        }
        return choices;
    }
    public getCountingMovesList(currentState: GoPartSlice): GoMove[] {
        const choices: GoMove[] = [];

        // 1. put all to dead
        // 2. find all mono-wrapped empty group
        // 3. set alive their unique wrapper
        // 4. list the remaining "entry points" of dead group
        // 5. remove the entry points which on the true actual board are link to an already dead group
        // 6. return that list of alive group that AI consider dead

        const correctBoard: GoPiece[][] = this.getCorrectBoard(currentState).getCopiedBoardGoPiece();

        const groupsData: GoGroupDatas[] =
            GoRules.getGroupsDatasWhere(correctBoard, (pawn: GoPiece) => pawn !== GoPiece.EMPTY);

        for (const group of groupsData) {
            const coord: Coord = group.getCoords()[0];
            const correctContent: GoPiece = correctBoard[coord.y][coord.x];
            const actualContent: GoPiece = currentState.getBoardAtGoPiece(coord);
            if (actualContent !== correctContent) {
                const move: GoMove = new GoMove(coord.x, coord.y);
                choices.push(move);
                return choices;
            }
        }
        return choices;
    }
    public getCorrectBoard(currentState: GoPartSlice): GoPartSlice {
        const markAsDead: (pawn: GoPiece) => GoPiece = (pawn: GoPiece) => {
            if (pawn === GoPiece.BLACK) return GoPiece.DEAD_BLACK;
            if (pawn === GoPiece.WHITE) return GoPiece.DEAD_WHITE;
            if (pawn.isTerritory()) {
                return GoPiece.EMPTY;
            } else {
                return pawn;
            }
        };
        const allDeadBoard: GoPiece[][] = this.mapBoard(currentState.getCopiedBoardGoPiece(),
                                                        markAsDead);
        const allDeadState: GoPartSlice = new GoPartSlice(allDeadBoard,
                                                          currentState.getCapturedCopy(),
                                                          currentState.turn,
                                                          currentState.koCoord,
                                                          currentState.phase);
        const territoryLikeGroups: GoGroupDatas[] = GoRules.getTerritoryLikeGroup(allDeadState);

        return this.setAliveUniqueWrapper(allDeadState, territoryLikeGroups);
    }
    public mapBoard(board: GoPiece[][], mapper: (pawn: GoPiece) => GoPiece): GoPiece[][] {
        for (let y: number = 0; y < board.length; y++) {
            for (let x: number = 0; x < board[0].length; x++) {
                board[y][x] = mapper(board[y][x]);
            }
        }
        return board;
    }
    public setAliveUniqueWrapper(allDeadState: GoPartSlice,
                                 monoWrappedEmptyGroups: GoGroupDatas[])
    : GoPartSlice
    {
        let resultingState: GoPartSlice = allDeadState.copy();
        let aliveCoords: Coord[];
        for (const monoWrappedEmptyGroup of monoWrappedEmptyGroups) {
            aliveCoords = monoWrappedEmptyGroup.deadBlackCoords.concat(monoWrappedEmptyGroup.deadWhiteCoords);
            for (const aliveCoord of aliveCoords) {
                if (resultingState.isDead(aliveCoord)) {
                    resultingState = GoRules.switchAliveness(aliveCoord, resultingState);
                }
            }
        }
        return resultingState;
    }
    public getBoardValue(node: GoNode): NodeUnheritance {
        const state: GoPartSlice = node.gamePartSlice;
        const LOCAL_VERBOSE: boolean = false;

        display(GoRules.VERBOSE || LOCAL_VERBOSE, 'GoRules.getBoardValue');

        const goPartSlice: GoPartSlice = GoRules.markTerritoryAndCount(state);

        const goScore: number[] = goPartSlice.getCapturedCopy();
        const goKilled: number[] = GoRules.getDeadStones(goPartSlice);
        return new NodeUnheritance((goScore[1] + (2 * goKilled[0])) - (goScore[0] + (2 * goKilled[1])));
    }
}
