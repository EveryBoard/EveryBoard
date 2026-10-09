import { ComparableObject } from '@everyboard/lib';
import { Coord } from '@everyboard/games';
import { Direction } from '@everyboard/games';

export class Arrow<T extends Direction> implements ComparableObject {

    public transformation: string;
    public startCenter: Coord;
    public landingCenter: Coord;

    public constructor(public readonly start: Coord,
                       public readonly landing: Coord,
                       public readonly dir: T,
                       public readonly getCenterAt: (c: Coord) => Coord)
    {
        const pointedCenter: Coord = this.getCenterAt(landing);
        const centerCoord: string = pointedCenter.x + ' ' + pointedCenter.y;
        const angle: number = dir.getAngle() + 150;
        const rotation: string = 'rotate(' + angle + ' ' + centerCoord + ')';
        const translation: string = 'translate(' + centerCoord + ')';
        this.transformation = rotation + ' ' + translation;
        this.startCenter = this.getCenterAt(this.start);
        this.landingCenter = this.getCenterAt(this.landing);
    }

    public equals(other: Arrow<T>): boolean {
        return other != null &&
            this.start.equals(other.start) &&
            this.landing.equals(other.landing) &&
            this.dir.equals(other.dir);
    }

}
