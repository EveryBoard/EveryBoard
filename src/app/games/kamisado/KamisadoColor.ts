import { Utils } from 'src/app/utils/utils';

export class KamisadoColor {
    public static readonly ANY: KamisadoColor = new KamisadoColor(0, 'any', '#000');
    public static readonly ORANGE: KamisadoColor = new KamisadoColor(1, 'orange', '#d67421');
    public static readonly BLUE : KamisadoColor = new KamisadoColor(2, 'blue', '#006bac');
    public static readonly PURPLE: KamisadoColor = new KamisadoColor(3, 'purple', '#6f3787');
    public static readonly PINK : KamisadoColor = new KamisadoColor(4, 'pink', '#d2719e');
    public static readonly YELLOW: KamisadoColor = new KamisadoColor(5, 'yellow', '#e2c200');
    public static readonly RED : KamisadoColor = new KamisadoColor(6, 'red', '#d23339');
    public static readonly GREEN : KamisadoColor = new KamisadoColor(7, 'green', '#009157');
    public static readonly BROWN : KamisadoColor = new KamisadoColor(8, 'brown', '#562500');

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
            default:
                Utils.expectToBe(value, 8, 'Invalid value ' + value + ' for KamisadoColor');
                return KamisadoColor.BROWN;
        }
    }
    private constructor(public readonly value: number, public readonly name: string, public readonly rgb: string) {
    }
}
