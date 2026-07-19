import { Coord } from '../Coord';

import { Layout } from './Layout';

export class TriangularLayout implements Layout {

    public constructor(
        public readonly size: number,
    ) {
    }

    public getTranslationAt(coord: Coord): string {
        return `translate(${ coord.x * this.size * 0.5 }, ${ coord.y * this.size})`;
    }

    private isDownward(c: Coord): boolean {
        return (c.x + c.y) % 2 === 1;
    }

    public getPolygonAt(coord: Coord): string {
        if (this.isDownward(coord)) {
            return `0 0 ${ this.size } 0 ${ this.size / 2} ${ this.size }`;
        } else {
            return `0 ${ this.size } ${ this.size } ${ this.size } ${ this.size / 2} 0`;
        }
    }

}
