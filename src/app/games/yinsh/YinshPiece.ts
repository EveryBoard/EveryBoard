import { NumberEncoder } from 'src/app/jscaip/Encoder';
import { Player } from 'src/app/jscaip/Player';
import { ComparableObject } from 'src/app/utils/Comparable';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { assert } from 'src/app/utils/utils';

export class YinshPiece implements ComparableObject {
    public static encoder: NumberEncoder<YinshPiece> =
        NumberEncoder.ofCombination<YinshPiece, [Player, boolean, boolean]>(
            [Player.numberEncoder, NumberEncoder.booleanEncoder, NumberEncoder.booleanEncoder],
            (piece: YinshPiece): [Player, boolean, boolean] => [piece.player, piece.hasMarker, piece.hasRing],
            ([player, hasMarker, hasRing]: [Player, boolean, boolean]): YinshPiece => {
                const decoded: MGPOptional<YinshPiece> = YinshPiece.of(player, hasMarker, hasRing);
                assert(decoded.isPresent(), 'YinshPiece decode should never see an invalid piece');
                return decoded.get();
            },
        );

    public static EMPTY: YinshPiece = new YinshPiece(Player.NONE, false, false);

    public static MARKER_ZERO: YinshPiece = new YinshPiece(Player.ZERO, true, false);
    public static MARKER_ONE: YinshPiece = new YinshPiece(Player.ONE, true, false);
    public static MARKERS: [YinshPiece, YinshPiece] = [YinshPiece.MARKER_ZERO, YinshPiece.MARKER_ONE];

    public static RING_ZERO: YinshPiece = new YinshPiece(Player.ZERO, false, true);
    public static RING_ONE: YinshPiece = new YinshPiece(Player.ONE, false, true);
    public static RINGS: [YinshPiece, YinshPiece] = [YinshPiece.RING_ZERO, YinshPiece.RING_ONE];

    public static RINGMARKER_ZERO: YinshPiece = new YinshPiece(Player.ZERO, true, true);
    public static RINGMARKER_ONE: YinshPiece = new YinshPiece(Player.ONE, true, true);
    public static RINGMARKERS: [YinshPiece, YinshPiece] = [YinshPiece.RINGMARKER_ZERO, YinshPiece.RINGMARKER_ONE];

    public static of(player: Player, hasMarker: boolean, hasRing: boolean): MGPOptional<YinshPiece> {
        if (player === Player.ZERO) {
            if (hasMarker) {
                if (hasRing) return MGPOptional.of(YinshPiece.RINGMARKER_ZERO);
                else return MGPOptional.of(YinshPiece.MARKER_ZERO);
            } else {
                if (hasRing) return MGPOptional.of(YinshPiece.RING_ZERO);
                else return MGPOptional.empty();
            }
        } else if (player === Player.ONE) {
            if (hasMarker) {
                if (hasRing) return MGPOptional.of(YinshPiece.RINGMARKER_ONE);
                else return MGPOptional.of(YinshPiece.MARKER_ONE);
            } else {
                if (hasRing) return MGPOptional.of(YinshPiece.RING_ONE);
                else return MGPOptional.empty();
            }
        } else {
            return MGPOptional.empty();
        }
    }

    private constructor(public player: Player, public hasMarker: boolean, public hasRing: boolean) {
    }
    public equals(piece: YinshPiece): boolean {
        return this === piece;
    }
    public flip(): YinshPiece {
        assert(this.hasRing === false, 'cannot flip a piece that has a ring (it should never happen)');
        return YinshPiece.of(this.player.getOpponent(), this.hasMarker, this.hasRing).get();
    }
}
