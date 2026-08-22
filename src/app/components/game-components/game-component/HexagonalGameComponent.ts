import { Coord } from '@everyboard/games';
import { HexaLayout } from '@everyboard/games';
import { Move } from '@everyboard/games';
import { SuperRules } from '@everyboard/games';
import { EmptyRulesConfig, RulesConfig } from '@everyboard/games';
import { Table } from '@everyboard/games';
import { GameState } from '@everyboard/games';

import { GameComponent } from './GameComponent';

export abstract class HexagonalGameComponent<R extends SuperRules<M, S, C, L>,
                                             M extends Move,
                                             S extends GameState,
                                             P,
                                             C extends RulesConfig = EmptyRulesConfig,
                                             L = void>
    extends GameComponent<R, M, S, C, L>
{

    public constructor(urlName: string) {
        super(urlName);
    }

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

    public getHexaCenterTranslationAt(coord: Coord): string {
        return this.getHexaCenterTranslationAtXY(coord.x, coord.y);
    }

    public getHexaCenterTranslationAtXY(x: number, y: number): string {
        const centerAtXY: Coord = this.getCenterAtXY(x, y);
        return this.getSVGTranslationAt(centerAtXY);
    }

}
