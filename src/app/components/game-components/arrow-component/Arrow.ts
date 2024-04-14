import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';

export class Arrow<T extends Direction> {

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

}
