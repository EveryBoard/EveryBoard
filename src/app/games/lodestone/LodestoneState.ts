import { LodestoneDirection, LodestonePiece, LodestonePieceLodestone, LodestonePieceNone, LodestonePiecePlayer } from 'src/app/games/lodestone/LodestonePiece';
import { Coord } from 'src/app/jscaip/Coord';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { Player } from 'src/app/jscaip/Player';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';
import { assert } from 'src/app/utils/assert';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { LodestoneCaptures } from './LodestoneMove';
export class LodestonePressurePlate {
    public static POSITIONS: LodestonePressurePlatePosition[] = ['top', 'bottom', 'left', 'right'];
    public static EMPTY_5: LodestonePressurePlate = new LodestonePressurePlate(5, []);
    public static EMPTY_3: LodestonePressurePlate = new LodestonePressurePlate(3, []);
    public constructor(public readonly width: 3 | 5,
                       private readonly pieces: readonly LodestonePiecePlayer[]) {
    }
    public remainingSpaces(): number {
        if (this.width === 5) {
            return 8 - this.pieces.length;
        } else {
            return 3 - this.pieces.length;
        }
    }
    public addCaptured(player: Player, quantity: number): MGPOptional<LodestonePressurePlate> {
        if (this.pieces.length + quantity >= this.width) {
            // The pressure plate is full, it therefore crumbles the floor.
            if (this.width === 5) {
                // Put the rest of the pieces on the next pressure plate
                return LodestonePressurePlate.EMPTY_3.addCaptured(player, quantity + this.pieces.length - 5);
            } else {
                // This was the last plate level
                assert(this.pieces.length + quantity === 3, 'should never put more pieces than the plate can support');
                return MGPOptional.empty();
            }
        } else {
            const newPieces: LodestonePiecePlayer[] = ArrayUtils.copy(this.pieces);
            for (let i: number = 0; i < quantity; i++) {
                newPieces.push(LodestonePiecePlayer.of(player));
            }
            return MGPOptional.of(new LodestonePressurePlate(this.width, newPieces));
        }
    }
    public getPieceAt(index: number): LodestonePiece {
        if (index < this.pieces.length) {
            return this.pieces[index];
        } else {
            return LodestonePieceNone.EMPTY;
        }
    }
}
export type LodestonePressurePlatePosition = 'top' | 'bottom' | 'left' | 'right';
export type LodestonePressurePlates = Record<LodestonePressurePlatePosition, MGPOptional<LodestonePressurePlate>>
export type LodestonePositions = MGPMap<Player, Coord>
export class LodestoneState extends GameStateWithTable<LodestonePiece> {
    public static readonly SIZE: number = 8;
    public static getInitialState(): LodestoneState {
        const _: LodestonePiece = LodestonePieceNone.EMPTY;
        const O: LodestonePiece = LodestonePiecePlayer.ZERO;
        const X: LodestonePiece = LodestonePiecePlayer.ONE;
        const board: Table<LodestonePiece> = [
            [_, _, O, X, O, X, _, _],
            [_, O, X, O, X, O, X, _],
            [O, X, O, X, O, X, O, X],
            [X, O, X, _, _, O, X, O],
            [O, X, O, _, _, X, O, X],
            [X, O, X, O, X, O, X, O],
            [_, X, O, X, O, X, O, _],
            [_, _, X, O, X, O, _, _],
        ];
        return new LodestoneState(board,
                                  0,
                                  new MGPMap(),
                                  {
                                      top: MGPOptional.of(LodestonePressurePlate.EMPTY_5),
                                      bottom: MGPOptional.of(LodestonePressurePlate.EMPTY_5),
                                      left: MGPOptional.of(LodestonePressurePlate.EMPTY_5),
                                      right: MGPOptional.of(LodestonePressurePlate.EMPTY_5),
                                  });
    }
    public constructor(board: Table<LodestonePiece>,
                       turn: number,
                       public readonly lodestones: LodestonePositions,
                       public readonly pressurePlates: LodestonePressurePlates) {
        super(board, turn);
    }
    public withBoard(board: Table<LodestonePiece>): LodestoneState {
        return new LodestoneState(board, this.turn, this.lodestones, this.pressurePlates);
    }
    public remainingSpaces(): number {
        const remaining: LodestoneCaptures = this.remainingSpacesDetails();
        return remaining.top + remaining.bottom + remaining.left + remaining.right;
    }
    public remainingSpacesDetails(): LodestoneCaptures {
        const remaining: LodestoneCaptures = { top: 0, bottom: 0, left: 0, right: 0 };
        for (const position of LodestonePressurePlate.POSITIONS) {
            const pressurePlate: MGPOptional<LodestonePressurePlate> = this.pressurePlates[position];
            if (pressurePlate.isPresent()) {
                remaining[position] = pressurePlate.get().remainingSpaces();
            }
        }
        return remaining;
    }
    public numberOfPieces(): [number, number] {
        const playerPieces: [number, number] = [0, 0];
        for (let y: number = 0; y < LodestoneState.SIZE; y++) {
            for (let x: number = 0; x < LodestoneState.SIZE; x++) {
                const piece: LodestonePiece = this.getPieceAtXY(x, y);
                if (piece.isPlayerPiece()) {
                    playerPieces[piece.owner.getValue()] += 1;
                }
            }
        }
        return playerPieces;
    }
    public getScores(): [number, number] {
        const remainingPieces: [number, number] = this.numberOfPieces();
        return [24 - remainingPieces[1], 24 - remainingPieces[0]];
    }
    public nextLodestoneDirection(): MGPOptional<LodestoneDirection> {
        const currentPlayer: Player = this.getCurrentPlayer();
        const lodestonePosition: MGPOptional<Coord> = this.lodestones.get(currentPlayer);
        if (lodestonePosition.isPresent()) {
            const piece: LodestonePiece = this.getPieceAt(lodestonePosition.get());
            assert(piece.isLodestone(), 'Piece must be lodestone (invariant from LodestoneState)' + lodestonePosition.get());
            const lodestone: LodestonePieceLodestone = piece as LodestonePieceLodestone;
            const currentDirection: LodestoneDirection = lodestone.direction;
            switch (currentDirection) {
                case 'push': return MGPOptional.of('pull');
                case 'pull': return MGPOptional.of('push');
            }
        } else {
            return MGPOptional.empty();
        }
    }
}
