import { computed, Signal } from '@angular/core';

import { Coord } from '@everyboard/games';
import { BoardShape } from '@everyboard/games';
import { Direction } from '@everyboard/games';
import { Move } from '@everyboard/games';
import { SuperRules } from '@everyboard/games';
import { EmptyRulesConfig, RulesConfig } from '@everyboard/games';
import { TopologicGameState } from '@everyboard/games';
import { Topology } from '@everyboard/games';
import { MGPMap } from '@everyboard/lib';
import { Set } from '@everyboard/lib';

import { ViewBox } from '../GameComponentUtils';
import { GameComponent } from '../game-component/GameComponent';
import { Layout } from '../layout/Layout';
import { LayoutMap } from '../layout/LayoutMap';


export abstract class TopologicGameComponent<R extends SuperRules<M, S, C, L>,
                                             M extends Move,
                                             S extends TopologicGameState<P, Direction>,
                                             P extends NonNullable<unknown>,
                                             C extends RulesConfig = EmptyRulesConfig,
                                             L = void>
    extends GameComponent<R, M, S, C, L>
{

    protected readonly coordsAndContents: Signal<Set<{ coord: Coord; content: P }>> = computed(() => {
        return new Set(this.state().getCoordsAndContents());
    });

    protected readonly topologicTranslationMap: Signal<MGPMap<Coord, string>> = computed(() => {
        const map: MGPMap<Coord, string> = new MGPMap(
            this.boardShape()
                .getAllCoords()
                .map((coord: Coord) => {
                    return {
                        key: coord,
                        value: this.layout().getTranslationAt(coord),
                    };
                }),
        );
        map.makeImmutable();
        return map;
    });

    protected readonly topologicPolygonMap: Signal<MGPMap<Coord, string>> = computed(() => {
        const map: MGPMap<Coord, string> = new MGPMap(
            this.boardShape()
                .getAllCoords()
                .map((coord: Coord) => {
                    return {
                        key: coord,
                        value: this.layout().getPolygonAt(coord),
                    };
                }),
        );
        map.makeImmutable();
        return map;
    });

    protected readonly topologicCellIdMap: Signal<MGPMap<Coord, string>> = computed(() => {
        const map: MGPMap<Coord, string> = new MGPMap(
            this.boardShape()
                .getAllCoords()
                .map((coord: Coord) => {
                    return {
                        key: coord,
                        value: `${ coord.x }-${ coord.y }`,
                    };
                }),
        );
        map.makeImmutable();
        return map;
    });

    private readonly boardShape: Signal<BoardShape<Direction>> = computed(() => {
        return this.state().getBoardShape();
    });

    private readonly topology: Signal<Topology<Direction>> = computed(() => {
        return this.state().getTopology();
    });

    private readonly layout: Signal<Layout> = computed(() => {
        return LayoutMap.getLayout(this.topology().getId());
    });

    protected computeViewBox(): ViewBox {
        const globalViewBox: ViewBox = ViewBox.fromCoords(
            this.state()
                .getAllCoords()
                .flatMap((abstractCoord: Coord) => {
                    const polygonCoords: Coord[] = this.layout().getPolygonCoordsAt(abstractCoord);
                    const translationCoord: Coord = this.layout().getTranslationCoordAt(abstractCoord);
                    return polygonCoords.map((polygonCoord: Coord) => polygonCoord.getNext(translationCoord));
                }),
        );
        return globalViewBox.expandAll(this.STROKE_WIDTH / 2);
    }

}
