import { GoState, GoPiece, Phase } from './GoState';
import { GoMove } from './GoMove';
import { Debug } from 'src/app/utils/utils';
import { GoConfig, GoLegalityInformation, GoNode, GoRules } from './GoRules';
import { GoGroupDatas } from './GoGroupsDatas';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MoveGenerator } from 'src/app/jscaip/AI';
import { MGPOptional } from 'src/app/utils/MGPOptional';

@Debug.log
export class GoMoveGenerator extends MoveGenerator<GoMove, GoState, GoConfig> {

    public override getListMoves(node: GoNode, _config: MGPOptional<GoConfig>): GoMove[] {

        const currentState: GoState = node.gameState;
        const playingMoves: GoMove[] = this.getPlayingMovesList(currentState);
        if (currentState.phase === Phase.PLAYING ||
            currentState.phase === Phase.PASSED) {
            playingMoves.push(GoMove.PASS);
            return playingMoves;
        } else {
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

        for (const coordAndContent of state.getCoordsAndContents()) {
            const coord: Coord = coordAndContent.coord;
            const content: GoPiece = coordAndContent.content;
            newMove = new GoMove(coord.x, coord.y);
            if (content === GoPiece.EMPTY) {
                const legality: MGPFallible<GoLegalityInformation> = GoRules.isLegal(newMove, state);
                if (legality.isSuccess()) {
                    choices.push(newMove);
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
            if (pawn === GoPiece.DARK) return GoPiece.DEAD_DARK;
            if (pawn === GoPiece.LIGHT) return GoPiece.DEAD_LIGHT;
            if (pawn.isTerritory()) {
                return GoPiece.EMPTY;
            } else {
                return pawn;
            }
        };
        const allDeadBoard: GoPiece[][] = this.mapBoard(currentState.getCopiedBoard(), markAsDead);
        const allDeadState: GoState = new GoState(allDeadBoard,
                                                  currentState.getCapturedCopy(),
                                                  currentState.turn,
                                                  currentState.koCoord,
                                                  currentState.phase);
        const territoryLikeGroups: GoGroupDatas[] = GoRules.getTerritoryLikeGroup(allDeadState);

        return this.setAliveUniqueWrapper(allDeadState, territoryLikeGroups);
    }
    public mapBoard(board: GoPiece[][], mapper: (pawn: GoPiece) => GoPiece): GoPiece[][] {
        const newBoard: GoPiece[][] = [];
        for (let y: number = 0; y < board.length; y++) {
            newBoard[y] = [];
            for (let x: number = 0; x < board[0].length; x++) {
                newBoard[y][x] = mapper(board[y][x]);
            }
        }
        return newBoard;
    }
    public setAliveUniqueWrapper(allDeadState: GoState,
                                 monoWrappedEmptyGroups: GoGroupDatas[])
    : GoState
    {
        let resultingState: GoState = allDeadState.copy();
        let aliveCoords: Coord[];
        for (const monoWrappedEmptyGroup of monoWrappedEmptyGroups) {
            aliveCoords = monoWrappedEmptyGroup.deadDarkCoords.concat(monoWrappedEmptyGroup.deadLightCoords);
            for (const aliveCoord of aliveCoords) {
                if (resultingState.isDead(aliveCoord)) {
                    resultingState = GoRules.switchAliveness(aliveCoord, resultingState);
                }
            }
        }
        return resultingState;
    }
}
