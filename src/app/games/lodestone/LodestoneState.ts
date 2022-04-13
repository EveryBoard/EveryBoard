import { LodestoneDirection, LodestonePiece, LodestonePieceNone, LodestonePiecePlayer } from 'src/app/games/lodestone/LodestonePiece';
import { Coord } from 'src/app/jscaip/Coord';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { Player } from 'src/app/jscaip/Player';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';
import { assert } from 'src/app/utils/assert';
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
            return 3 + this.width - this.pieces.length;
        } else {
            return 3 - this.pieces.length;
        }
    }
    public addCaptured(player: Player, howMany: number): MGPOptional<LodestonePressurePlate> {
        if (this.pieces.length + howMany >= this.width) {
            // The pressure plate is full, it therefore crumbles the floor.
            if (this.width === 5) {
                // Put the rest of the pieces on the next pressure plate
                return LodestonePressurePlate.EMPTY_3.addCaptured(player, howMany + this.pieces.length - 5);
            } else {
                // This was the last plate level
                assert(this.pieces.length + howMany === 3, 'should never put more pieces than the plate can support');
                return MGPOptional.empty();
            }
        } else {
            const newPieces: LodestonePiecePlayer[] = ArrayUtils.copyImmutableArray(this.pieces);
            for (let i: number = 0; i < howMany; i++) {
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

export type LodestoneLodestones = [MGPOptional<Coord>, MGPOptional<Coord>]

export class LodestoneState extends GameStateWithTable<LodestonePiece> {

    public static readonly SIZE: number = 8;

    public static getInitialState(): LodestoneState {
        const _: LodestonePiece = LodestonePieceNone.EMPTY;
        const A: LodestonePiece = LodestonePiecePlayer.ZERO;
        const B: LodestonePiece = LodestonePiecePlayer.ONE;
        const board: Table<LodestonePiece> = [
            [_, _, A, B, A, B, _, _],
            [_, A, B, A, B, A, B, _],
            [A, B, A, B, A, B, A, B],
            [B, A, B, _, _, A, B, A],
            [A, B, A, _, _, B, A, B],
            [B, A, B, A, B, A, B, A],
            [_, B, A, B, A, B, A, _],
            [_, _, B, A, B, A, _, _],
        ];
        return new LodestoneState(board,
                                  0,
                                  [MGPOptional.empty(), MGPOptional.empty()],
                                  {
                                      top: MGPOptional.of(LodestonePressurePlate.EMPTY_5),
                                      bottom: MGPOptional.of(LodestonePressurePlate.EMPTY_5),
                                      left: MGPOptional.of(LodestonePressurePlate.EMPTY_5),
                                      right: MGPOptional.of(LodestonePressurePlate.EMPTY_5),
                                  });
    }

    public constructor(board: Table<LodestonePiece>,
                       turn: number,
                       public readonly lodestones: LodestoneLodestones,
                       public readonly pressurePlates: LodestonePressurePlates) {
        super(board, turn);
    }
    public withBoard(board: Table<LodestonePiece>): LodestoneState {
        return new LodestoneState(board, this.turn, this.lodestones, this.pressurePlates);
    }
    public withBoardAndPressurePlate(board: Table<LodestonePiece>,
                                     position: LodestonePressurePlatePosition,
                                     plate: MGPOptional<LodestonePressurePlate>)
    : LodestoneState {
        const pressurePlates: LodestonePressurePlates = { ...this.pressurePlates };
        pressurePlates[position] = plate;
        return new LodestoneState(board, this.turn, this.lodestones, pressurePlates);
    }
    public remainingSpaces(): number {
        const remaining: LodestoneCaptures = this.remainingSpacesDetailed();
        return remaining.top + remaining.bottom + remaining.left + remaining.right;
    }
    public remainingSpacesDetailed(): LodestoneCaptures {
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
                    playerPieces[piece.owner.value] += 1;
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
        if (this.lodestones[currentPlayer.value].isAbsent()) {
            return MGPOptional.empty();
        } else {
            const piece: LodestonePiece = this.getPieceAt(this.lodestones[currentPlayer.value].get());
            if (piece.isLodestone()) {
                const currentDirection: LodestoneDirection = piece.direction;
                switch (currentDirection) {
                    case 'push': return MGPOptional.of('pull');
                    case 'pull': return MGPOptional.of('push');
                }
            } else {
                assert(piece.isUnreachable(), 'Lodestone must have fallen from the board, so its location should be unreachable now');
                // This means that the lodestone fell of the board, next time it can be placed in any direction
                return MGPOptional.empty();
            }
        }
    }
}
