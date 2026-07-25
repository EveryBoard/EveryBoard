import { Component } from '@angular/core';

import { Utils } from '@everyboard/lib';

import { Coord } from '../../../jscaip/Coord';
import { FlatHexaOrientation } from '../../../jscaip/HexaOrientation';
import { Move } from '../../../jscaip/Move';
import { SuperRules } from '../../../jscaip/Rules';
import { EmptyRulesConfig, RulesConfig } from '../../../jscaip/RulesConfigUtil';
import { HexaLayout } from '../../../jscaip/layout/HexaLayout';
import { Layout } from '../../../jscaip/layout/Layout';
import { SquareLayout } from '../../../jscaip/layout/SquareLayout';
import { TriangularLayout } from '../../../jscaip/layout/TriangularLayout';
import { TopologicGameState } from '../../../jscaip/state/TopologicGameState';
import { HexagonalTopology } from '../../../jscaip/topology/HexagonalTopology';
import { SquareTopology } from '../../../jscaip/topology/SquareTopology';
import { Topology } from '../../../jscaip/topology/Topology';
import { TriangularTopology } from '../../../jscaip/topology/TriangularTopology';
import { ViewBox } from '../GameComponentUtils';
import { GameComponent } from '../game-component/GameComponent';

@Component({
    template: '',
})
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

    public getViewBox(): ViewBox {
        const globalViewBox: ViewBox = this.getViewBoxFrom(
            this.getState()
                .getAllCoords()
                .map((coord: Coord) => this.getLayout().getTranslationCoordAt(coord)),
        );
        const localViewBox: ViewBox = this.getViewBoxFrom(
            this.getLayout().getPolygonCoordsAt(new Coord(0, 0)),
        );
        return globalViewBox
            .expandRight(localViewBox.width)
            .expandBelow(localViewBox.height)
            .expandAll(this.STROKE_WIDTH / 2);
    }

    private getViewBoxFrom(coords: Coord[]): ViewBox {
        let minX: number = Number.MAX_VALUE;
        let minY: number = Number.MAX_VALUE;
        let maxX: number = Number.MIN_VALUE;
        let maxY: number = Number.MIN_VALUE;
        for (const coord of coords) {
            minX = Math.min(minX, coord.x);
            minY = Math.min(minY, coord.y);
            maxX = Math.max(maxX, coord.x);
            maxY = Math.max(maxY, coord.y);
        }
        return ViewBox.fromLimits(
            minX,
            maxX,
            minY,
            maxY,
        );
    }

    protected getTopologicTranslationAt(coord: Coord): string {
        const layout: Layout = this.getLayout();
        return layout.getTranslationAt(coord);
    }

    protected getTopologicPolygonAt(coord: Coord): string {
        const layout: Layout = this.getLayout();
        return layout.getPolygonAt(coord);
    }

    protected getTopologicCellId(coord: Coord): string {
        return `${ coord.x }-${ coord.y }`;
    }

    private getLayout(): Layout {
        const state: TopologicGameState<P> = this.getState();
        const topology: Topology = state.getTopology();
        if (topology instanceof SquareTopology) {
            return this.squareLayout;
        } else if (topology instanceof TriangularTopology) {
            return this.triangularLayout;
        } else {
            Utils.expectToBe(topology instanceof HexagonalTopology, true);
            return this.hexagonalLayout;
        }
    }

}
