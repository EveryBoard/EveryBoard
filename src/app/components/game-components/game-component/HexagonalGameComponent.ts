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

    public getHexaPoints(): string {
        return this.hexaLayout.getHexaPoints();
    }

    public getCenterAtXY(x: number, y: number): Coord {
        const coord: Coord = new Coord(x, y);
        return this.getCenterAt(coord);
    }

    public getCenterAt(coord: Coord): Coord {
        return this.hexaLayout.getCenterAt(coord);
    }

    public getHexaCenterTranslate(coord: Coord): string {
        return this.getHexaCenterTranslateAtXY(coord.x, coord.y);
    }

    public getHexaCenterTranslateAtXY(x: number, y: number): string {
        const centerAtXY: Coord = this.getCenterAtXY(x, y);
        return `translate(${ centerAtXY.x }, ${ centerAtXY.y })`;
    }

}
