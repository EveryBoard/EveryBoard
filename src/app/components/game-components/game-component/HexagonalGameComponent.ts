import { Component } from '@angular/core';
import { Coord } from 'src/app/jscaip/Coord';
import { GameState } from 'src/app/jscaip/GameState';
import { HexaLayout } from 'src/app/jscaip/HexaLayout';
import { Move } from 'src/app/jscaip/Move';
import { Rules } from 'src/app/jscaip/Rules';
import { Table } from 'src/app/utils/ArrayUtils';
import { GameComponent } from './GameComponent';

@Component({ template: '' })
export abstract class HexagonalGameComponent<R extends Rules<M, S, L>,
                                             M extends Move,
                                             S extends GameState,
                                             P,
                                             L = void>
    extends GameComponent<R, M, S, L>
{

    public hexaLayout: HexaLayout;

    public hexaBoard: Table<P>;

    public getHexaCoordsBy(x: number, y: number): string {
        const coord: Coord = new Coord(x, y);
        return this.getHexaCoordsAt(coord);
    }
    public getHexaCoordsAt(coord: Coord): string {
        let desc: string = '';
        const coords: ReadonlyArray<Coord> = this.hexaLayout.getHexaCoordsAt(coord);
        for (const corner of coords) {
            desc += corner.x + ' ' + corner.y + ' ';
        }
        desc += coords[0].x + ' ' + coords[0].y;
        return desc;
    }
    public getCenterBy(x: number, y: number): Coord {
        const coord: Coord = new Coord(x, y);
        return this.getCenterAt(coord);
    }
    public getCenterAt(coord: Coord): Coord {
        return this.hexaLayout.getCenterAt(coord);
    }
}
