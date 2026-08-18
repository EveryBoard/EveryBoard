import { Set } from '@everyboard/lib';

import { Coord } from './Coord';

export class GobanUtils {

    public static getHoshis(width: number, height: number): Coord[] {
        let hoshis: Set<Coord> = new Set<Coord>();
        const horizontalMiddle: number = GobanUtils.getHorizontalCenter(width);
        const verticalMiddle: number = GobanUtils.getVerticalCenter(height);
        const left: number = GobanUtils.getHorizontalLeft(width);
        const up: number = GobanUtils.getVerticalUp(height);
        const right: number = GobanUtils.getHorizontalRight(width);
        const down: number = GobanUtils.getVerticalDown(height);
        if (12 < height && height % 2 === 1 ) {
            hoshis = hoshis
                .addElement(new Coord(left, verticalMiddle))
                .addElement(new Coord(right, verticalMiddle));
        }
        if (12 < width && width % 2 === 1 ) {
            hoshis = hoshis
                .addElement(new Coord(horizontalMiddle, up))
                .addElement(new Coord(horizontalMiddle, down));
        }
        if (width % 2 === 1 && height % 2 === 1) {
            hoshis = hoshis.addElement(new Coord(horizontalMiddle, verticalMiddle));
        }
        hoshis = hoshis
            .addElement(new Coord(left, up))
            .addElement(new Coord(left, down))
            .addElement(new Coord(right, up))
            .addElement(new Coord(right, down));
        return hoshis.toList();
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
