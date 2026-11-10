import { ComparableObject } from '@everyboard/lib';

export class Line implements ComparableObject {

    public constructor(
        public readonly x1: number,
        public readonly y1: number,
        public readonly x2: number,
        public readonly y2: number,
    ) {}

    public equals(other: Line): boolean {
        return (other instanceof Line) &&
            this.x1 === other.x1 &&
            this.x2 === other.x2 &&
            this.y1 === other.y1 &&
            this.y2 === other.y2;
    }


}
