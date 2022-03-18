import { Player } from 'src/app/jscaip/Player';

export type LodestoneDirection = 'push' | 'pull'

export class LodestonePieceNone {
    public static UNREACHABLE: LodestonePieceNone = new LodestonePieceNone(true);
    public static EMPTY: LodestonePieceNone = new LodestonePieceNone(false);
    private constructor(private readonly unreachable: boolean) {
    }
    public isLodestone(): this is LodestonePieceLodestone {
        return false;
    }
    public isPlayerPiece(): this is LodestonePiecePlayer {
        return false;
    }
    public isEmpty(): this is LodestonePieceNone {
        return true;
    }
    public isUnreachable(): boolean {
        return this.unreachable;
    }
    public equals(other: LodestonePiece): boolean {
        return this === other;
    }
}

export class LodestonePiecePlayer {
    public static ZERO: LodestonePiecePlayer = new LodestonePiecePlayer(Player.ZERO);
    public static ONE: LodestonePiecePlayer = new LodestonePiecePlayer(Player.ONE);
    public static of(player: Player): LodestonePiecePlayer {
        if (player === Player.ZERO) {
            return LodestonePiecePlayer.ZERO;
        } else {
            return LodestonePiecePlayer.ONE;
        }
    }
    private constructor(public readonly owner: Player) {
    }
    public isLodestone(): this is LodestonePieceLodestone {
        return false;
    }
    public isPlayerPiece(): this is LodestonePiecePlayer {
        return true;
    }
    public isEmpty(): this is LodestonePieceNone {
        return false;
    }
    public isUnreachable(): boolean {
        return false;
    }
    public equals(other: LodestonePiece): boolean {
        return this === other;
    }
}

export class LodestonePieceLodestone {
    public constructor(public readonly owner: Player,
                       public readonly direction: LodestoneDirection) {
    }
    public isLodestone(): this is LodestonePieceLodestone {
        return true;
    }
    public isPlayerPiece(): this is LodestonePiecePlayer {
        return false;
    }
    public isEmpty(): this is LodestonePieceNone {
        return false;
    }
    public isUnreachable(): boolean {
        return false;
    }
    public flip(): LodestonePieceLodestone {
        const reverseDirection: LodestoneDirection = this.direction === 'push' ? 'pull' : 'push';
        return new LodestonePieceLodestone(this.owner, reverseDirection);
    }
    public equals(other: LodestonePiece): boolean {
        if (this === other) return true;
        if (other.isLodestone()) {
            if (this.owner !== other.owner) return false;
            if (this.direction !== other.direction) return false;
            return true;
        } else {
            return false;
        }
    }
}

export type LodestonePiece = LodestonePiecePlayer | LodestonePieceLodestone | LodestonePieceNone
