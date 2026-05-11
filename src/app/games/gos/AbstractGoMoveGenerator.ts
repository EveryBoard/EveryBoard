import { MGPFallible } from '@everyboard/lib';

import { MoveGenerator } from '../../jscaip/AI/AI';
import { GroupDataFactory } from '../../jscaip/BoardData';
import { Coord } from '../../jscaip/Coord';
import { Debug } from '../../utils/Debug';

import { GoLegalityInformation, GoNode, AbstractGoRules, AbstractGoConfig } from './AbstractGoRules';
import { GoGroupData } from './GoGroupsData';
import { GoMove } from './GoMove';
import { GoPiece } from './GoPiece';
import { GoState } from './GoState';

@Debug.log
export class AbstractGoMoveGenerator<C extends AbstractGoConfig> extends MoveGenerator<GoMove, GoState, C> {

    public constructor(private readonly rules: AbstractGoRules<C>) {
        super();
    }

    public override getListMoves(node: GoNode, config: C): GoMove[] {
        const currentState: GoState = node.gameState;
        const playingMoves: GoMove[] = this.getPlayingMovesList(currentState, config);
        if (currentState.phase.isPlaying() || currentState.phase.isPassed()) {
            playingMoves.push(GoMove.PASS);
            return playingMoves;
        } else {
            const markingMoves: GoMove[] = this.getCountingMovesList(currentState, config);
            if (markingMoves.length === 0) {
                return [GoMove.ACCEPT];
            } else {
                return markingMoves;
            }
        }
    }

    public getPlayingMovesList(state: GoState, config: C): GoMove[] {
        const choices: GoMove[] = [];
        for (const coordAndContent of state.getCoordsAndContents()) {
            const coord: Coord = coordAndContent.coord;
            const content: GoPiece = coordAndContent.content;
            const newMove: GoMove = new GoMove(coord.x, coord.y);
            if (content === GoPiece.EMPTY) {
                const legality: MGPFallible<GoLegalityInformation> = this.rules.isLegal(newMove, state, config);
                if (legality.isSuccess()) {
                    choices.push(newMove);
                }
            }
        }
        return choices;
    }

    public getCountingMovesList(currentState: GoState, config: MGPOptional<C>): GoMove[] {
        const choices: GoMove[] = [];

        // 1. put all to dead
        // 2. find all mono-wrapped empty group
        // 3. set alive their unique wrapper
        // 4. list the remaining "entry points" of dead group
        // 5. remove the entry points which on the true actual board are link to an already dead group
        // 6. return that list of alive group that AI consider dead

        const correctBoard: GoPiece[][] = this.getCorrectBoard(currentState, config).getCopiedBoard();

        const zoom: number = this.rules.getZoom(config);
        const groupDataFactory: GroupDataFactory<GoPiece, GoGroupData> = this.rules.getGoGroupDataFactory(zoom);
        const groupsData: GoGroupData[] =
            groupDataFactory.getGroupsDataWhere(
                correctBoard,
                (piece: GoPiece) => piece !== GoPiece.EMPTY && piece !== GoPiece.UNREACHABLE);

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

    public getCorrectBoard(currentState: GoState, config: MGPOptional<C>): GoState {
        const markAsDead: (piece: GoPiece) => GoPiece = (piece: GoPiece) => {
            if (piece === GoPiece.DARK) return GoPiece.DEAD_DARK;
            if (piece === GoPiece.LIGHT) return GoPiece.DEAD_LIGHT;
            if (piece.isTerritory()) {
                return GoPiece.EMPTY;
            } else {
                return piece;
            }
        };
        const allDeadBoard: GoPiece[][] = this.mapBoard(currentState.getCopiedBoard(), markAsDead);
        const allDeadState: GoState = new GoState(allDeadBoard,
                                                  currentState.getCapturedCopy(),
                                                  currentState.turn,
                                                  currentState.koCoord,
                                                  currentState.phase,
        );
        const territoryLikeGroups: GoGroupData[] = this.rules.getTerritoryLikeGroup(allDeadState);

        return this.setAliveUniqueWrapper(allDeadState, territoryLikeGroups);
    }

    public mapBoard(board: GoPiece[][], mapper: (piece: GoPiece) => GoPiece): GoPiece[][] {
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
                                 monoWrappedEmptyGroups: GoGroupData[],
    ): GoState
    {
        let resultingState: GoState = allDeadState.copy();
        let aliveCoords: Coord[];
        for (const monoWrappedEmptyGroup of monoWrappedEmptyGroups) {
            aliveCoords = monoWrappedEmptyGroup.deadDarkCoords.concat(monoWrappedEmptyGroup.deadLightCoords);
            for (const aliveCoord of aliveCoords) {
                if (resultingState.isDead(aliveCoord)) {
                    resultingState = this.rules.switchAliveness(aliveCoord, resultingState, 1);
                }
            }
        }
        return resultingState;
    }

}
