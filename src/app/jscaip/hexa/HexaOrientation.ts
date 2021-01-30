
export class HexaOrientation {
    public static POINTY: HexaOrientation = new HexaOrientation(0.5, [Math.sqrt(3), Math.sqrt(3)/2, 0, 3/2], [Math.sqrt(3)/3, -1/3, 0, 2/3]);
    public static FLAT: HexaOrientation = new HexaOrientation(0, [3/2, 0, Math.sqrt(3) / 2, Math.sqrt(3)], [2/3, 0, -1/3, Math.sqrt(3)/3]);
    private constructor(public readonly startAngle: number,
                        public readonly conversionMatrix: [number, number, number, number],
                        public readonly inverseConversionMatrix: [number, number, number, number]) {
    }
}
