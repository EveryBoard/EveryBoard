import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';

export abstract class Arrow<T extends Direction> {

    public transformation: string;
    public startCenter: Coord;
    public landingCenter: Coord;

    public constructor(public start: Coord,
                       public landing: Coord,
                       public dir: T,
                       public getCenterAt: (c: Coord) => Coord)
    {
        const pointedCenter: Coord = this.getCenterAt(landing);
        const centerCoord: string = pointedCenter.x + ' ' + pointedCenter.y;
        const angle: number = this.getAngle(dir) + 150;
        const rotation: string = 'rotate(' + angle + ' ' + centerCoord + ')';
        const translation: string = 'translate(' + centerCoord + ')';
        this.transformation = rotation + ' ' + translation;
        this.startCenter = this.getCenterAt(this.start);
        this.landingCenter = this.getCenterAt(this.landing);
    }

    public abstract getAngle(dir: Direction): number;

}
