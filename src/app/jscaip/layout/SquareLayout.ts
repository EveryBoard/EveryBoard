import { Coord } from '../Coord';

import { Layout } from './Layout';

export class SquareLayout implements Layout {

    public constructor(
        public readonly size: number,
    ) {
    }

    public getTranslationAt(coord: Coord): string {
        return `translate(${ coord.x * this.size }, ${ coord.y * this.size})`;
    }

    public getPolygonAt(_: Coord): string {
        return `0 0 0 ${ this.size } ${ this.size } ${ this.size } ${ this.size } 0`;
    }

}
