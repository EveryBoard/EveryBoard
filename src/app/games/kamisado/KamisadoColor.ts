import { Comparable } from "src/app/collectionlib/Comparable";

export class KamisadoColor implements Comparable {
    public static readonly ANY: KamisadoColor = new KamisadoColor(0, "any");
    public static readonly ORANGE: KamisadoColor = new KamisadoColor(1, "orange");
    public static readonly BLUE  : KamisadoColor = new KamisadoColor(2, "blue");
    public static readonly PURPLE: KamisadoColor = new KamisadoColor(3, "purple");
    public static readonly PINK  : KamisadoColor = new KamisadoColor(4, "pink");
    public static readonly YELLOW: KamisadoColor = new KamisadoColor(5, "yellow");
    public static readonly RED   : KamisadoColor = new KamisadoColor(6, "red");
    public static readonly GREEN : KamisadoColor = new KamisadoColor(7, "green");
    public static readonly BROWN : KamisadoColor = new KamisadoColor(8, "brown");

    public static of(value: number): KamisadoColor {
        switch (value) {
            case 0: return KamisadoColor.ANY;
            case 1: return KamisadoColor.ORANGE;
            case 2: return KamisadoColor.BLUE;
            case 3: return KamisadoColor.PURPLE;
            case 4: return KamisadoColor.PINK;
            case 5: return KamisadoColor.YELLOW;
            case 6: return KamisadoColor.RED;
            case 7: return KamisadoColor.GREEN;
            case 8: return KamisadoColor.BROWN;
            default: throw new Error("Invalid value " + value + " for EncapsulePiece")
        }
    }
    private constructor(public readonly value: number, public readonly name: string) {
    }
    public equals(color: KamisadoColor): boolean {
        return color.value === this.value;
    }
    public toString(): string {
        return this.name;
    }
}
