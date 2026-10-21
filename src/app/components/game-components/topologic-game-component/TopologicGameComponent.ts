
import { computed, Signal } from '@angular/core';

import { Coord, Shape } from '@everyboard/games';
import { Direction } from '@everyboard/games';
import { FlatHexaOrientation } from '@everyboard/games';
import { Move } from '@everyboard/games';
import { SuperRules } from '@everyboard/games';
import { EmptyRulesConfig, RulesConfig } from '@everyboard/games';
import { TopologicGameState } from '@everyboard/games';
import { HexagonalTopology } from '@everyboard/games';
import { EightDirectionSquareTopology } from '@everyboard/games';
import { OrthogonalSquareTopology } from '@everyboard/games';
import { Topology } from '@everyboard/games';
import { TriangularTopology } from '@everyboard/games';
import { MGPMap, Utils } from '@everyboard/lib';

import { ViewBox } from '../GameComponentUtils';
import { GameComponent } from '../game-component/GameComponent';
import { HexaLayout } from '../layout/HexaLayout';
import { Layout } from '../layout/Layout';
import { SquareLayout } from '../layout/SquareLayout';
import { TriangularLayout } from '../layout/TriangularLayout';

export abstract class TopologicGameComponent<R extends SuperRules<M, S, C, L>,
                                             M extends Move,
                                             S extends TopologicGameState<P>,
                                             P extends NonNullable<unknown>,
                                             C extends RulesConfig = EmptyRulesConfig,
                                             L = void>
    extends GameComponent<R, M, S, C, L>
{
    private readonly squareLayout: SquareLayout = new SquareLayout(this.SPACE_SIZE);

    private readonly triangularLayout: TriangularLayout = new TriangularLayout(this.SPACE_SIZE * 1.2);

    private readonly hexagonalLayout: HexaLayout = new HexaLayout(
        this.SPACE_SIZE * 0.6,
        new Coord(0, 0),
        FlatHexaOrientation.INSTANCE,
    );

    protected readonly topologicTranslationMap: Signal<MGPMap<Coord, string>> = computed(() => {
        const map: MGPMap<Coord, string> = new MGPMap(
            this.shape()
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
            this.shape()
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
            this.shape()
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

    private readonly shape: Signal<Shape<Direction>> = computed(() => {
        return this.state().getShape();
    });

    private readonly topology: Signal<Topology<Direction>> = computed(() => {
        return this.state().getTopology();
    });

    private readonly layout: Signal<Layout> = computed(() => {
        const topology: Topology<Direction> = this.topology();
        if (topology instanceof EightDirectionSquareTopology ||
            topology instanceof OrthogonalSquareTopology
        ) {
            return this.squareLayout;
        } else if (topology instanceof TriangularTopology) {
            return this.triangularLayout;
        } else {
            Utils.expectToBe(topology instanceof HexagonalTopology, true);
            return this.hexagonalLayout;
        }
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
