import { Player } from '@everyboard/games';
import { GameNode } from '@everyboard/games';
import { Coord, CoordFailure } from '@everyboard/games';
import { CoordSet } from '@everyboard/games';
import { FourStatePiece } from '@everyboard/games';
import { GameStatus } from '@everyboard/games';
import { HexagonalUtils } from '@everyboard/games';
import { Rules } from '@everyboard/games';
import { EmptyRulesConfig } from '@everyboard/games';
import { RulesFailure } from '@everyboard/games';
import { TriangularCheckerBoard } from '@everyboard/games';
import { TriangularGameState } from '@everyboard/games';
import { ArrayUtils, MGPMap, MGPOptional, MGPValidation } from '@everyboard/lib';

import { Debug } from '../../utils/Debug';

import { SaharaFailure } from './SaharaFailure';
import { SaharaMove } from './SaharaMove';
import { SaharaState } from './SaharaState';

export class SaharaNode extends GameNode<SaharaMove, SaharaState> {}

@Debug.log
export class SaharaRules extends Rules<SaharaMove, SaharaState> {

    private static singleton: MGPOptional<SaharaRules> = MGPOptional.empty();

    public static get(): SaharaRules {
        if (SaharaRules.singleton.isAbsent()) {
            SaharaRules.singleton = MGPOptional.of(new SaharaRules());
        }
        return SaharaRules.singleton.get();
    }

    public override getInitialState(): SaharaState {
        const size: number = 3;
        const N: FourStatePiece = FourStatePiece.UNREACHABLE;
        const O: FourStatePiece = FourStatePiece.ZERO;
        const X: FourStatePiece = FourStatePiece.ONE;
        const _: FourStatePiece = FourStatePiece.EMPTY;

        const board: FourStatePiece[][] = HexagonalUtils.createBoard(size, N, _);
        const start: number = (size + 1) % 2;
        const xEnd: number = (4 * size) - (2 - start);
        const yEnd: number = (size * 2) - 1;
        const first: number = size - (size % 2);
        const second: number = first + 1;
        const third: number = first + (2 * size) - 1;
        const fourth: number = third + 1;

        board[0][first] = O;
        board[0][second] = X;
        board[0][third] = O;
        board[0][fourth] = X;

        board[first - start][start] = X;
        board[second - start][start] = O;
        board[first - start][xEnd] = O;
        board[second - start][xEnd] = X;

        board[yEnd][first] = O;
        board[yEnd][second] = X;
        board[yEnd][third] = O;
        board[yEnd][fourth] = X;
        return new SaharaState(board, 0);
    }

    public getStartingCoords(state: SaharaState, player: Player): Coord[] {
        const startingCoords: Coord[] = [];
        for (const coordAndContent of state.getCoordsAndContents()) {
            if (coordAndContent.content.is(player)) {
                startingCoords.push(coordAndContent.coord);
            }
        }
        return startingCoords;
    }

    public getBoardValueByPiece(state: SaharaState, player: Player): MGPMap<Coord, number> {
        const playersPiece: Coord[] = this.getStartingCoords(state, player);
        const playerFreedoms: MGPMap<Coord, number> = new MGPMap();
        for (const piece of playersPiece) {
            const freedoms: number =
                TriangularGameState.getEmptyNeighbors(state.board, piece, FourStatePiece.EMPTY).length;
            playerFreedoms.set(piece, freedoms);
        }
        return playerFreedoms;
    }

    /**
     * @param state the evaluated state
     * @param player the player for which returned values apply
     * @returns a sorted table of the freedom of player's pieces
     */
    public getBoardValuesFor(state: SaharaState, player: Player): number[] {
        const playerFreedomsMap: MGPMap<Coord, number> = this.getBoardValueByPiece(state, player);
        const playerFreedomsValue: number[] = playerFreedomsMap.getValueList();
        ArrayUtils.sortByDescending(playerFreedomsValue, (value: number) => -value);
        return playerFreedomsValue;
    }

    public override applyLegalMove(move: SaharaMove,
                                   state: SaharaState,
                                   _config: EmptyRulesConfig,
                                   _info: void)
    : SaharaState
    {
        const board: FourStatePiece[][] = state.getCopiedBoard();
        board[move.getEnd().y][move.getEnd().x] = board[move.getStart().y][move.getStart().x];
        board[move.getStart().y][move.getStart().x] = FourStatePiece.EMPTY;
        const resultingState: SaharaState = new SaharaState(board, state.turn + 1);
        return resultingState;
    }

    public override isLegal(move: SaharaMove, state: SaharaState): MGPValidation {
        const coordsValidity: MGPValidation = this.getCoordsValidity(move, state);
        if (coordsValidity.isFailure()) {
            return coordsValidity;
        }
        const movedPawn: FourStatePiece = state.getPieceAt(move.getStart());
        if (movedPawn.is(state.getCurrentPlayer()) === false) {
            return MGPValidation.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
        }
        const landingSpace: FourStatePiece = state.getPieceAt(move.getEnd());
        if (landingSpace !== FourStatePiece.EMPTY) {
            return MGPValidation.failure(RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
        }
        const commonNeighbor: MGPOptional<Coord> =
            TriangularCheckerBoard.getCommonNeighbor(move.getStart(), move.getEnd());
        if (commonNeighbor.isPresent()) {
            if (state.getPieceAt(commonNeighbor.get()) === FourStatePiece.EMPTY) {
                return MGPValidation.SUCCESS;
            } else {
                return MGPValidation.failure(SaharaFailure.CAN_ONLY_REBOUND_ON_EMPTY_SPACE());
            }
        } else {
            return MGPValidation.SUCCESS;
        }
    }

    private getCoordsValidity(move: SaharaMove, state: SaharaState): MGPValidation {
        if (state.isNotOnBoard(move.getStart())) {
            return MGPValidation.failure(CoordFailure.OUT_OF_RANGE(move.getStart()));
        } else if (state.isNotOnBoard(move.getEnd())) {
            return MGPValidation.failure(CoordFailure.OUT_OF_RANGE(move.getEnd()));
        } else {
            return MGPValidation.SUCCESS;
        }
    }

    public override getGameStatus(node: SaharaNode): GameStatus {
        const board: SaharaState = node.gameState;
        const zeroFreedoms: number[] = this.getBoardValuesFor(board, Player.ZERO);
        const oneFreedoms: number[] = this.getBoardValuesFor(board, Player.ONE);
        return this.getGameStatusFromFreedoms(zeroFreedoms, oneFreedoms);
    }

    private getLandingCoordsMatching(coord: Coord, state: SaharaState, premise: (c: Coord) => boolean): Coord[] {
        const landings: CoordSet =
            new CoordSet(TriangularCheckerBoard.getNeighbors(coord).filter(premise));
        if (TriangularCheckerBoard.isSpaceDark(coord)) {
            return landings.toList();
        } else {
            let farLandings: CoordSet = new CoordSet(landings.toList()); // Deep copy
            const emptyNeighbors: CoordSet = landings.filter(
                (c: Coord) => state.getPieceAt(c).equals(FourStatePiece.EMPTY),
            );
            for (const neighbor of emptyNeighbors) {
                const secondStepNeighbors: Coord[] =
                    TriangularCheckerBoard.getNeighbors(neighbor).filter(premise);
                for (const secondStepNeighbor of secondStepNeighbors) {
                    farLandings = farLandings.addElement(secondStepNeighbor);
                }
            }
            return farLandings.toList();
        }
    }

    public getLegalLandingCoords(state: SaharaState, coord: Coord): Coord[] {
        const isOnBoardAndEmpty: (c: Coord) => boolean = (c: Coord) => {
            return state.hasPieceAt(c, FourStatePiece.EMPTY);
        };
        return this.getLandingCoordsMatching(coord, state, isOnBoardAndEmpty);
    }

    public getValidLandingCoords(state: SaharaState, coord: Coord): Coord[] {
        const isOnBoardAndReachable: (c: Coord) => boolean = (c: Coord) => {
            return state.isOnBoard(c) &&
                   state.getPieceAt(c).equals(FourStatePiece.UNREACHABLE) === false;
        };
        return this.getLandingCoordsMatching(coord, state, isOnBoardAndReachable);
    }

    public getGameStatusFromFreedoms(zeroFreedoms: number[], oneFreedoms: number[]): GameStatus {
        if (zeroFreedoms[0] === 0) {
            return GameStatus.ONE_WON;
        } else if (oneFreedoms[0] === 0) {
            return GameStatus.ZERO_WON;
        }
        return GameStatus.ONGOING;
    }

}
