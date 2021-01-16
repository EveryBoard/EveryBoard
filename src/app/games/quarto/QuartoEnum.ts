export enum QuartoEnum {
    AAAA = 0, AAAB = 1, AABA = 2, AABB = 3,
    ABAA = 4, ABAB = 5, ABBA = 6, ABBB = 7,
    BAAA = 8, BAAB = 9, BABA = 10, BABB = 11,
    BBAA = 12, BBAB = 13, BBBA = 14, BBBB = 15,
    UNOCCUPIED = 16,
}
export namespace QuartoEnum {
    export function values(): QuartoEnum[] {
        return [
            QuartoEnum.AAAA,
            QuartoEnum.AAAB,
            QuartoEnum.AABA,
            QuartoEnum.AABB,
            QuartoEnum.ABAA,
            QuartoEnum.ABAB,
            QuartoEnum.ABBA,
            QuartoEnum.ABBB,
            QuartoEnum.BAAA,
            QuartoEnum.BAAB,
            QuartoEnum.BABA,
            QuartoEnum.BABB,
            QuartoEnum.BBAA,
            QuartoEnum.BBAB,
            QuartoEnum.BBBA,
            QuartoEnum.BBBB];
    }
}
