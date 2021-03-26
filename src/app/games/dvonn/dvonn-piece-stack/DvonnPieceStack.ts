import { Player } from 'src/app/jscaip/player/Player';
import { Encoder } from 'src/app/jscaip/encoder';

export class DvonnPieceStack {
    public static sizeEncoder: Encoder<number> = Encoder.numberEncoder(49);
    public static encoder: Encoder<DvonnPieceStack> = new class extends Encoder<DvonnPieceStack> {
        public maxValue(): number {
            return (DvonnPieceStack.sizeEncoder.maxValue() *
                Player.encoder.shift() * Player.encoder.maxValue() *
                Encoder.booleanEncoder.shift() * Encoder.booleanEncoder.maxValue());
        }
        public encode(stack: DvonnPieceStack): number {
            return ((DvonnPieceStack.sizeEncoder.encode(stack.size) *
                Player.encoder.shift() + Player.encoder.encode(stack.owner)) *
                Encoder.booleanEncoder.shift() + Encoder.booleanEncoder.encode(stack.source));
        }
        public decode(encoded: number): DvonnPieceStack {
            const sourceN: number = encoded % Encoder.booleanEncoder.shift();
            encoded = (encoded - sourceN) / Encoder.booleanEncoder.shift();
            const playerN: number = encoded % Player.encoder.shift();
            encoded = (encoded - playerN) / Player.encoder.shift();
            const size: number = encoded;
            return new DvonnPieceStack(Player.of(playerN), size, Encoder.booleanEncoder.decode(sourceN));
        }
    }
    public static MAX_SIZE: number = 49; // The maximal possible size for a stack
    public static EMPTY: DvonnPieceStack = new DvonnPieceStack(Player.NONE, 0, false);
    public static PLAYER_ZERO: DvonnPieceStack = new DvonnPieceStack(Player.ZERO, 1, false);
    public static PLAYER_ONE: DvonnPieceStack = new DvonnPieceStack(Player.ONE, 1, false);
    public static SOURCE: DvonnPieceStack = new DvonnPieceStack(Player.NONE, 1, true);

    public static append(stack1: DvonnPieceStack, stack2: DvonnPieceStack): DvonnPieceStack {
        return new DvonnPieceStack(stack1.owner, stack1.size + stack2.size, stack1.source || stack2.source);
    }

    constructor(public readonly owner: Player,
                public readonly size: number,
                public readonly source: boolean) {
    }
    public getValue(): number {
        return DvonnPieceStack.encoder.encode(this);
    }
    public getOwner(): Player {
        return this.owner;
    }
    public belongsTo(player: Player): boolean {
        return this.owner === player;
    }
    public containsSource(): boolean {
        return this.source;
    }
    public isEmpty(): boolean {
        return this.size === 0;
    }
    public getSize(): number {
        return this.size;
    }
    public toString(): string {
        return 'DvonnPieceStack(' + this.owner.toString() + ', ' + this.size + ', ' + this.source + ')';
    }
}
