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
    public static LODESTONES: Record<0 | 1, Record<LodestoneDirection, Record<'diagonal' | 'orthogonal', LodestonePieceLodestone>>> = {
        0: {
            'push': {
                'diagonal': new LodestonePieceLodestone(Player.ZERO, 'push', true),
                'orthogonal': new LodestonePieceLodestone(Player.ZERO, 'push', false),
            },
            'pull': {
                'diagonal': new LodestonePieceLodestone(Player.ZERO, 'pull', true),
                'orthogonal': new LodestonePieceLodestone(Player.ZERO, 'pull', false),
            },
        },
        1: {
            'push': {
                'diagonal': new LodestonePieceLodestone(Player.ONE, 'push', true),
                'orthogonal': new LodestonePieceLodestone(Player.ONE, 'push', false),
            },
            'pull': {
                'diagonal': new LodestonePieceLodestone(Player.ONE, 'pull', true),
                'orthogonal': new LodestonePieceLodestone(Player.ONE, 'pull', false),
            },
        },
    };

    private constructor(public readonly owner: Player,
                        public readonly direction: LodestoneDirection,
                        public readonly diagonal: boolean) {
    }
    public static of(player: Player, direction: LodestoneDirection, diagonal: boolean): LodestonePieceLodestone {
        return LodestonePieceLodestone.LODESTONES[player.value][direction][diagonal ? 'diagonal' : 'orthogonal'];
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
    public equals(other: LodestonePiece): boolean {
        return this === other;
    }
}

export type LodestonePiece = LodestonePiecePlayer | LodestonePieceLodestone | LodestonePieceNone
