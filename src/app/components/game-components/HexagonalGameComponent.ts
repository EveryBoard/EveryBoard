import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { HexaLayout } from 'src/app/jscaip/hexa/HexaLayout';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { Move } from 'src/app/jscaip/Move';
import { AbstractGameComponent } from '../wrapper-components/AbstractGameComponent';

@Component({ template: '' })
export abstract class HexagonalGameComponent<M extends Move,
                                             S extends GamePartSlice,
                                             L extends LegalityStatus>
    extends AbstractGameComponent<M, S, L>
{

    public PIECE_SIZE: number = 30;

    public abstract hexaLayout: HexaLayout;

    public constructor(snackBar: MatSnackBar) {
        super(snackBar);
    }
    public getHexaCoordinates(coord: Coord): string {
        let desc: string = '';
        const coords: ReadonlyArray<Coord> = this.hexaLayout.getHexaCoordinates(coord);
        for (const corner of coords) {
            desc += corner.x + ' ' + corner.y + ' ';
        }
        desc += coords[0].x + ' ' + coords[0].y;
        return desc;
    }
    public getCenter(coord: Coord): Coord {
        return this.hexaLayout.getCenter(coord);
    }
}
