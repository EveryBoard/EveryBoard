import { Component } from '@angular/core';

import { Coord } from '../../../jscaip/Coord';
import { FlatHexaOrientation, HexaOrientation } from '../../../jscaip/HexaOrientation';
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

    public getViewBox(): ViewBox {
        let minX: number = Number.MAX_VALUE;
        let minY: number = Number.MAX_VALUE;
        let maxX: number = Number.MIN_VALUE;
        let maxY: number = Number.MIN_VALUE;
        for (const coord of this.getState().getAllCoords()) {
            minX = Math.min(minX, coord.x);
            minY = Math.min(minY, coord.y);
            maxX = Math.max(maxX, coord.x);
            maxY = Math.max(maxY, coord.y);
        }
        return ViewBox.fromLimits(
            minX * this.SPACE_SIZE,
            maxX * this.SPACE_SIZE,
            minY * this.SPACE_SIZE,
            maxY * this.SPACE_SIZE,
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

    private getLayout(): Layout { // TODO: don't instanciate every call
        const state: TopologicGameState<P> = this.getState();
        const topology: Topology = state.getTopology();
        if (topology instanceof SquareTopology) {
            return new SquareLayout(this.SPACE_SIZE);
        } else if (topology instanceof TriangularTopology) {
            return new TriangularLayout(this.SPACE_SIZE * 1.2);
        } else if (topology instanceof HexagonalTopology) {
            const origin: Coord = new Coord(0, 0);
            const orientation: HexaOrientation = FlatHexaOrientation.INSTANCE;
            return new HexaLayout(this.SPACE_SIZE * 0.60, origin, orientation);
        } else {
            throw new Error('TODO FDC');
        }
    }

}
