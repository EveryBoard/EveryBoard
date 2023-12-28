import { Coord } from './Coord';

export class GobanUtils {

    public static getHoshis(width: number, height: number): Coord[] {
        const hoshis: Coord[] = [];
        const horizontalMiddle: number = GobanUtils.getHorizontalCenter(width);
        const verticalMiddle: number = GobanUtils.getVerticalCenter(height);
        const left: number = GobanUtils.getHorizontalLeft(width);
        const up: number = GobanUtils.getVerticalUp(height);
        const right: number = GobanUtils.getHorizontalRight(width);
        const down: number = GobanUtils.getVerticalDown(height);
        if (12 < height && height % 2 === 1 ) {
            hoshis.push(
                new Coord(left, verticalMiddle),
                new Coord(right, verticalMiddle),
            );
        }
        if (12 < width && width % 2 === 1 ) {
            hoshis.push(
                new Coord(horizontalMiddle, up),
                new Coord(horizontalMiddle, down),
            );
        }
        if (width % 2 === 1 && height % 2 === 1) {
            hoshis.push(
                new Coord(horizontalMiddle, verticalMiddle),
            );
        }
        hoshis.push(
            new Coord(left, up),
            new Coord(left, down),
            new Coord(right, up),
            new Coord(right, down),
        );
        return hoshis;
    }

    public static getHorizontalLeft(width: number): number {
        return width < 12 ? 2 : 3;
    }

    public static getHorizontalCenter(width: number): number {
        return Math.floor(width / 2);
    }

    public static getHorizontalRight(width: number): number {
        const left: number = GobanUtils.getHorizontalLeft(width);
        return width - (left + 1);
    }

    public static getVerticalUp(height: number): number {
        return height < 12 ? 2 : 3;
    }

    public static getVerticalCenter(height: number): number {
        return Math.floor(height / 2);
    }

    public static getVerticalDown(height: number): number {
        const up: number = GobanUtils.getVerticalUp(height);
        return height - (up + 1);
    }

}
