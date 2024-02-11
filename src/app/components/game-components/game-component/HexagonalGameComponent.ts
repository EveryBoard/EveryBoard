import { Component } from '@angular/core';
import { Coord } from 'src/app/jscaip/Coord';
import { GameState } from 'src/app/jscaip/GameState';
import { HexaLayout } from 'src/app/jscaip/HexaLayout';
import { Move } from 'src/app/jscaip/Move';
import { SuperRules } from 'src/app/jscaip/Rules';
import { Table } from 'src/app/utils/ArrayUtils';
import { GameComponent } from './GameComponent';
import { EmptyRulesConfig, RulesConfig } from 'src/app/jscaip/RulesConfigUtil';

@Component({ template: '' })
export abstract class HexagonalGameComponent<R extends SuperRules<M, S, C, L>,
                                             M extends Move,
                                             S extends GameState,
                                             P,
                                             C extends RulesConfig = EmptyRulesConfig,
                                             L = void>
    extends GameComponent<R, M, S, C, L>
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

    public getHexaCenterTranslation(coord: Coord): string {
        return this.getHexaCenterTranslationAtXY(coord.x, coord.y);
    }

    public getHexaCenterTranslationAtXY(x: number, y: number): string {
        const centerAtXY: Coord = this.getCenterAtXY(x, y);
        return `translate(${ centerAtXY.x }, ${ centerAtXY.y })`;
    }

}
