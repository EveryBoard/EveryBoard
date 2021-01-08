export class GameComponentUtils {

    public static getTriangleCoordinate(x: number, y: number, lx: number, ly: number): string {
        const x0: number = (100*x) + (lx*33);
        const y0: number = (100*y) + (ly*33);
        const x1: number = x0;
        const y1: number = y0;
        const x2: number = x0 + 32;
        const y2: number = y0 + 16;
        const x3: number = x0;
        const y3: number = y0 + 32;
        return x1 + ' ' + y1 + ' ' + x2 + ' ' + y2 + ' ' +
               x3 + ' ' + y3 + ' ' + x1 + ' ' + y1;
    }
}