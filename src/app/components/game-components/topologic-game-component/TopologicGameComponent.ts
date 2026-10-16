
import { Coord } from '@everyboard/games';
import { Direction } from '@everyboard/games';
import { FlatHexaOrientation } from '@everyboard/games';
import { Move } from '@everyboard/games';
import { SuperRules } from '@everyboard/games';
import { EmptyRulesConfig, RulesConfig } from '@everyboard/games';
import { TopologicGameState } from '@everyboard/games';
import { HexagonalTopology } from '@everyboard/games';
import { OrdinalSquareTopology } from '@everyboard/games';
import { OrthogonalSquareTopology } from '@everyboard/games';
import { Topology } from '@everyboard/games';
import { TriangularTopology } from '@everyboard/games';
import { Utils } from '@everyboard/lib';

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

    public computeViewBox(): ViewBox {
        const globalViewBox: ViewBox = ViewBox.fromCoords(
            this.state()
                .getAllCoords()
                .flatMap((abstractCoord: Coord) => {
                    const polygonCoords: Coord[] = this.getLayout().getPolygonCoordsAt(abstractCoord);
                    const translationCoord: Coord = this.getLayout().getTranslationCoordAt(abstractCoord);
                    return polygonCoords.map((polygonCoord: Coord) => polygonCoord.getNext(translationCoord));
                }),
        );
        return globalViewBox.expandAll(this.STROKE_WIDTH / 2);
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
        const state: TopologicGameState<P> = this.state();
        const topology: Topology<Direction> = state.getTopology();
        if (topology instanceof OrdinalSquareTopology ||
            topology instanceof OrthogonalSquareTopology
        ) {
            return this.squareLayout;
        } else if (topology instanceof TriangularTopology) {
            return this.triangularLayout;
        } else {
            Utils.expectToBe(topology instanceof HexagonalTopology, true);
            return this.hexagonalLayout;
        }
    }

}
