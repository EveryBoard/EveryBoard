import { GoState, GoPiece, Phase } from './GoState';
import { GoMove } from './GoMove';
import { display } from 'src/app/utils/utils';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { GoLegalityInformation, GoNode, GoRules } from './GoRules';
import { GoGroupDatas } from './GoGroupsDatas';
import { Coord } from 'src/app/jscaip/Coord';
import { GameStatus } from 'src/app/jscaip/Rules';
import { MGPFallible } from 'src/app/utils/MGPFallible';

export class GoMinimax extends Minimax<GoMove, GoState, GoLegalityInformation> {

    public getListMoves(node: GoNode): GoMove[] {
        const LOCAL_VERBOSE: boolean = false;
        display(GoRules.VERBOSE || LOCAL_VERBOSE, 'GoRules.getListMoves');

        const currentState: GoState = node.gameState;
        const playingMoves: GoMove[] = this.getPlayingMovesList(currentState);
        if (currentState.phase === Phase.PLAYING ||
            currentState.phase === Phase.PASSED) {
            playingMoves.push(GoMove.PASS);
            return playingMoves;
        } else {
            display(GoRules.VERBOSE || LOCAL_VERBOSE, 'GoRules.getListMoves in counting phase');
            const markingMoves: GoMove[] = this.getCountingMovesList(currentState);
            if (markingMoves.length === 0) {
                return [GoMove.ACCEPT];
            } else {
                return markingMoves;
            }
        }
    }
    public getPlayingMovesList(state: GoState): GoMove[] {
        const choices: GoMove[] = [];
        let newMove: GoMove;

        for (let y: number = 0; y < state.board.length; y++) {
            for (let x: number = 0; x < state.board[0].length; x++) {
                newMove = new GoMove(x, y);
                if (state.getPieceAt(newMove.coord) === GoPiece.EMPTY) {
                    const legality: MGPFallible<GoLegalityInformation> = GoRules.isLegal(newMove, state);
                    if (legality.isSuccess()) {
                        choices.push(newMove);
                    }
                }
            }
        }
        return choices;
    }
    public getCountingMovesList(currentState: GoState): GoMove[] {
        const choices: GoMove[] = [];

        // 1. put all to dead
        // 2. find all mono-wrapped empty group
        // 3. set alive their unique wrapper
        // 4. list the remaining "entry points" of dead group
        // 5. remove the entry points which on the true actual board are link to an already dead group
        // 6. return that list of alive group that AI consider dead

        const correctBoard: GoPiece[][] = this.getCorrectBoard(currentState).getCopiedBoard();

        const groupsData: GoGroupDatas[] =
            GoRules.getGroupsDatasWhere(correctBoard, (pawn: GoPiece) => pawn !== GoPiece.EMPTY);

        for (const group of groupsData) {
            const coord: Coord = group.getCoords()[0];
            const correctContent: GoPiece = correctBoard[coord.y][coord.x];
            const actualContent: GoPiece = currentState.getPieceAt(coord);
            if (actualContent !== correctContent) {
                const move: GoMove = new GoMove(coord.x, coord.y);
                choices.push(move);
                return choices;
            }
        }
        return choices;
    }
    public getCorrectBoard(currentState: GoState): GoState {
        const markAsDead: (pawn: GoPiece) => GoPiece = (pawn: GoPiece) => {
            if (pawn === GoPiece.BLACK) return GoPiece.DEAD_BLACK;
            if (pawn === GoPiece.WHITE) return GoPiece.DEAD_WHITE;
            if (pawn.isTerritory()) {
                return GoPiece.EMPTY;
            } else {
                return pawn;
            }
        };
        const allDeadBoard: GoPiece[][] = this.mapBoard(currentState.getCopiedBoard(),
                                                        markAsDead);
        const allDeadState: GoState = new GoState(allDeadBoard,
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
    public setAliveUniqueWrapper(allDeadState: GoState,
                                 monoWrappedEmptyGroups: GoGroupDatas[])
    : GoState
    {
        let resultingState: GoState = allDeadState.copy();
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
        const state: GoState = node.gameState;
        const gameStatus: GameStatus = GoRules.getGameStatus(node);
        if (gameStatus.isEndGame) {
            return new NodeUnheritance(gameStatus.toBoardValue());
        }
        const LOCAL_VERBOSE: boolean = false;

        display(GoRules.VERBOSE || LOCAL_VERBOSE, 'GoRules.getBoardValue');

        const goState: GoState = GoRules.markTerritoryAndCount(state);

        const goScore: number[] = goState.getCapturedCopy();
        const goKilled: number[] = this.getDeadStones(goState);
        return new NodeUnheritance((goScore[1] + (2 * goKilled[0])) - (goScore[0] + (2 * goKilled[1])));
    }
    public getDeadStones(state: GoState): number[] {
        const killed: number[] = [0, 0];
        for (let y: number = 0; y < state.board.length; y++) {
            for (let x: number = 0; x < state.board[0].length; x++) {
                const piece: GoPiece = state.getPieceAtXY(x, y);
                if (piece.type === 'dead') {
                    killed[piece.player.value] = killed[piece.player.value] + 1;
                }
            }
        }
        return killed;
    }
}
