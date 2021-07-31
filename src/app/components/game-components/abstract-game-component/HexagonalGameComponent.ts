import { Component } from '@angular/core';
import { Coord } from 'src/app/jscaip/Coord';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { HexaLayout } from 'src/app/jscaip/HexaLayout';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { Move } from 'src/app/jscaip/Move';
import { AbstractGameComponent } from './AbstractGameComponent';

@Component({ template: '' })
export abstract class HexagonalGameComponent<M extends Move,
                                             S extends GamePartSlice,
                                             L extends LegalityStatus = LegalityStatus>
    extends AbstractGameComponent<M, S, L>
{

    public abstract hexaLayout: HexaLayout;

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
