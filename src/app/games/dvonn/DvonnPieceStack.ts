import { Player } from 'src/app/jscaip/Player';
import { NumberEncoder } from 'src/app/jscaip/Encoder';

export class DvonnPieceStack {

    public static sizeEncoder: NumberEncoder<number> = NumberEncoder.numberEncoder(49);

    public static encoder: NumberEncoder<DvonnPieceStack> = NumberEncoder.tuple(
        [NumberEncoder.booleanEncoder, Player.numberEncoder, DvonnPieceStack.sizeEncoder],
        (stack: DvonnPieceStack): [boolean, Player, number] => [stack.source, stack.owner, stack.size],
        (fields: [boolean, Player, number]): DvonnPieceStack => {
            return new DvonnPieceStack(fields[1], fields[2], fields[0]);
        })
    public static MAX_SIZE: number = 49; // The maximal possible size for a stack
    public static EMPTY: DvonnPieceStack = new DvonnPieceStack(Player.NONE, 0, false);
    public static NONE: DvonnPieceStack = new DvonnPieceStack(Player.NONE, -1, false);
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
        return DvonnPieceStack.encoder.encodeNumber(this);
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
