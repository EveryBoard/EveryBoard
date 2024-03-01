import { Encoder } from 'src/app/utils/Encoder';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { ComparableObject } from 'src/app/utils/Comparable';
import { Utils } from 'src/app/utils/utils';
import { assert } from 'src/app/utils/assert';
import { PlayerMap } from 'src/app/jscaip/PlayerMap';

export class YinshPiece implements ComparableObject {

    public static encoder: Encoder<YinshPiece> =
        Encoder.tuple<YinshPiece, [PlayerOrNone, boolean]>(
            [PlayerOrNone.encoder, Encoder.identity<boolean>()],
            (piece: YinshPiece): [PlayerOrNone, boolean] => [piece.player, piece.isRing],
            (fields: [PlayerOrNone, boolean]): YinshPiece => YinshPiece.of(fields[0], fields[1]));

    public static UNREACHABLE: YinshPiece = new YinshPiece(PlayerOrNone.NONE, false);
    public static EMPTY: YinshPiece = new YinshPiece(PlayerOrNone.NONE, false);

    public static MARKER_ZERO: YinshPiece = new YinshPiece(Player.ZERO, false);
    public static MARKER_ONE: YinshPiece = new YinshPiece(Player.ONE, false);
    public static MARKERS: PlayerMap<YinshPiece> = PlayerMap.ofValues(YinshPiece.MARKER_ZERO, YinshPiece.MARKER_ONE);

    public static RING_ZERO: YinshPiece = new YinshPiece(Player.ZERO, true);
    public static RING_ONE: YinshPiece = new YinshPiece(Player.ONE, true);
    public static RINGS: PlayerMap<YinshPiece> = PlayerMap.ofValues(YinshPiece.RING_ZERO, YinshPiece.RING_ONE);

    public static of(playerOrNone: PlayerOrNone, isRing: boolean): YinshPiece {
        if (playerOrNone === PlayerOrNone.NONE) {
            return YinshPiece.EMPTY;
        } else {
            const player: Player = playerOrNone as Player;
            if (isRing) {
                return YinshPiece.RINGS.get(player);
            } else {
                return YinshPiece.MARKERS.get(player);
            }
        }
    }

    private constructor(public readonly player: PlayerOrNone, public readonly isRing: boolean) {}

    public equals(piece: YinshPiece): boolean {
        return this === piece;
    }

    public flip(): YinshPiece {
        assert(this.isRing === false, 'cannot flip a ring (it should never happen)');
        assert(this.player.isPlayer(), 'cannot flip a non-player piece');
        const player: Player = this.player as Player;
        return YinshPiece.of(player.getOpponent(), this.isRing);
    }

    public toString(): string {
        switch (this) {
            case YinshPiece.UNREACHABLE: return 'NONE';
            case YinshPiece.EMPTY: return 'EMPTY';
            case YinshPiece.MARKER_ZERO: return 'MARKER_ZERO';
            case YinshPiece.MARKER_ONE: return 'MARKER_ONE';
            case YinshPiece.RING_ZERO: return 'RING_ZERO';
            default:
                Utils.expectToBe(this, YinshPiece.RING_ONE);
                return 'RING_ONE';
        }
    }

    public isReachable(): boolean {
        return this !== YinshPiece.UNREACHABLE;
    }

    public isMarker(): boolean {
        return this === YinshPiece.MARKER_ZERO ||
               this === YinshPiece.MARKER_ONE;
    }

}
