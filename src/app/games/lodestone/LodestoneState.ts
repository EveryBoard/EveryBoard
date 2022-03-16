import { LodestoneDirection, LodestonePiece, LodestonePieceLodestone, LodestonePieceNone, LodestonePiecePlayer } from 'src/app/games/lodestone/LodestonePiece';
import { Coord } from 'src/app/jscaip/Coord';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { Player } from 'src/app/jscaip/Player';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';
import { assert } from 'src/app/utils/assert';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export class LodestonePressurePlate {
    public static EMPTY_5: LodestonePressurePlate = new LodestonePressurePlate(5, []);
    public static EMPTY_3: LodestonePressurePlate = new LodestonePressurePlate(3, []);
    public constructor(public readonly width: 3 | 5,
                       public readonly pieces: readonly LodestonePiecePlayer[]) {
    }
    public addCaptured(player: Player, howMany: number): MGPOptional<LodestonePressurePlate> {
        if (this.pieces.length + howMany >= this.width) {
            // The pressure plate is full, it therefore crumbles the floor.
            if (this.width === 5) {
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
}

export type LodestonePressurePlates = {
    top: MGPOptional<LodestonePressurePlate>,
    bottom: MGPOptional<LodestonePressurePlate>,
    left: MGPOptional<LodestonePressurePlate>
    right: MGPOptional<LodestonePressurePlate>,
}

export type LodestoneInfos = [MGPOptional<Coord>, MGPOptional<Coord>]

export class LodestoneState extends GameStateWithTable<LodestonePiece> {

    public static readonly WIDTH: number = 8;

    public static readonly HEIGHT: number = 8;

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
                       public readonly lodestones: LodestoneInfos,
                       public readonly pressurePlates: LodestonePressurePlates) {
        super(board, turn);
    }
    public numberOfPieces(): [number, number] {
        const playerPieces: [number, number] = [0, 0];
        for (let y: number = 0; y < LodestoneState.HEIGHT; y++) {
            for (let x: number = 0; x < LodestoneState.WIDTH; x++) {
                const piece: LodestonePiece = this.getPieceAtXY(x, y);
                if (piece.isPlayerPiece()) {
                    playerPieces[piece.owner.value] += 1;
                }
            }
        }
        return playerPieces;
    }
    public nextLodestoneDirection(player: Player): MGPOptional<LodestoneDirection> {
        if (this.lodestones[player.value].isAbsent()) {
            return MGPOptional.empty();
        } else {
            const piece: LodestonePiece = this.getPieceAt(this.lodestones[player.value].get());
            assert(piece.isLodestone(), 'Must have a lodestone at the specified position');
            const lodestone: LodestonePieceLodestone = piece as LodestonePieceLodestone;
            const currentDirection: LodestoneDirection = lodestone.direction;
            switch (currentDirection) {
                case 'push': return MGPOptional.of('pull');
                case 'pull': return MGPOptional.of('push');
            }
        }
    }
}
