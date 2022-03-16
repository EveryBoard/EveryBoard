import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { LodestoneFailure } from './LodestoneFailure';
import { LodestoneCaptures, LodestoneMove } from './LodestoneMove';
import { LodestoneDirection, LodestonePiece, LodestonePieceLodestone, LodestonePieceNone } from './LodestonePiece';
import { LodestoneState, LodestoneInfos, LodestonePressurePlates, LodestonePressurePlate } from './LodestoneState';

export class LodestoneNode extends MGPNode<LodestoneRules, LodestoneMove, LodestoneState> { }

export class LodestoneRules extends Rules<LodestoneMove, LodestoneState> {

    private static singleton: MGPOptional<LodestoneRules> = MGPOptional.empty();
    public static get(): LodestoneRules {
        if (LodestoneRules.singleton.isAbsent()) {
            LodestoneRules.singleton = MGPOptional.of(new LodestoneRules());
        }
        return LodestoneRules.singleton.get();
    }

    private constructor() {
        super(LodestoneState);
    }
    public applyLegalMove(move: LodestoneMove, state: LodestoneState, _info: void): LodestoneState {
        const currentPlayer: Player = state.getCurrentPlayer();
        const opponent: Player = currentPlayer.getOpponent();
        let board: LodestonePiece[][];
        let captures: Coord[];
        switch (move.direction) {
            case 'pull':
                [board, captures] = this.applyPull(move.coord, state);
                break;
            case 'push': throw new Error('NYI');
        }
        const lodestones: LodestoneInfos = [state.lodestones[0], state.lodestones[1]];
        lodestones[currentPlayer.value] = MGPOptional.of(move.coord);
        board[move.coord.y][move.coord.x] = new LodestonePieceLodestone(currentPlayer, move.direction);
        const pressurePlates: LodestonePressurePlates =
            this.updatePressurePlates(state.pressurePlates, opponent, move.captures);
        return new LodestoneState(board, state.turn + 1, lodestones, pressurePlates);

    }
    private updatePressurePlates(pressurePlates: LodestonePressurePlates, opponent: Player, captures: LodestoneCaptures)
    : LodestonePressurePlates
    {
        return {
            top: this.updatePressurePlate(pressurePlates.top, opponent, captures.top),
            bottom: this.updatePressurePlate(pressurePlates.bottom, opponent, captures.bottom),
            left: this.updatePressurePlate(pressurePlates.left, opponent, captures.left),
            right: this.updatePressurePlate(pressurePlates.right, opponent, captures.right),
        };
    }
    private updatePressurePlate(pressurePlate: MGPOptional<LodestonePressurePlate>, opponent: Player, captured: number)
    : MGPOptional<LodestonePressurePlate>
    {
        if (pressurePlate.isPresent()) {
            return pressurePlate.get().addCaptured(opponent, captured);
        } else {
            return pressurePlate;
        }
    }
    private applyPull(start: Coord, state: LodestoneState): [LodestonePiece[][], Coord[]] {
        const currentPlayer: Player = state.getCurrentPlayer();
        const opponent: Player = currentPlayer.getOpponent();
        const board: LodestonePiece[][] = ArrayUtils.copyBiArray(state.board);
        const captures: Coord[] = [];
        for (const direction of [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT]) {
            for (let coord: Coord = start.getNext(direction); // eslint-disable-next-line indent
                 state.isOnBoard(coord); // eslint-disable-next-line indent
                 coord = coord.getNext(direction)) {
                const pieceOnTarget: LodestonePiece = board[coord.y][coord.x];
                const next: Coord = coord.getNext(direction);
                if (state.isOnBoard(next)) {
                    const pieceToMove: LodestonePiece = board[next.y][next.x];
                    if (pieceToMove.isPlayerPiece() && pieceToMove.owner === currentPlayer) {
                        // We move player piece of the next coord to the current coord
                        // hence in the opposite of direction
                        if (pieceOnTarget.isEmpty()) {
                            // Moving to an empty square
                            board[coord.y][coord.x] = pieceToMove;
                            board[next.y][next.x] = LodestonePieceNone.EMPTY;
                        } else if (pieceOnTarget.isPlayerPiece() && pieceOnTarget.owner === opponent) {
                            // Capturing a player piece
                            captures.push(coord);
                            board[coord.y][coord.x] = pieceToMove;
                            board[next.y][next.x] = LodestonePieceNone.EMPTY;
                        }
                    }
                }
            }
        }
        return [board, captures];
    }
    public isLegal(move: LodestoneMove, state: LodestoneState): MGPFallible<void> {
        const targetContent: LodestonePiece = state.getPieceAt(move.coord);
        if (targetContent.isPlayerPiece()) {
            return MGPFallible.failure(RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE());
        }
        const player: Player = state.getCurrentPlayer();
        if (targetContent.isLodestone() && targetContent.owner !== player) {
            return MGPFallible.failure(RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE());
        }
        const nextLodestoneDirection: MGPOptional<LodestoneDirection> = state.nextLodestoneDirection(player);
        const validLodestoneDirection: boolean =
            nextLodestoneDirection.isAbsent() || nextLodestoneDirection.equalsValue(move.direction);
        if (validLodestoneDirection === false) {
            return MGPFallible.failure(LodestoneFailure.MUST_FLIP_LODESTONE());
        }
        return MGPFallible.success(undefined);
    }
    public getGameStatus(node: LodestoneNode): GameStatus {
        const state: LodestoneState = node.gameState;
        const pieces: [number, number] = state.numberOfPieces();
        if (pieces[0] === 0 && pieces[1] === 0) {
            return GameStatus.DRAW;
        } else if (pieces[0] === 0) {
            return GameStatus.ONE_WON;
        } else if (pieces[1] === 0) {
            return GameStatus.ZERO_WON;
        } else {
            return GameStatus.ONGOING;
        }
    }
}
