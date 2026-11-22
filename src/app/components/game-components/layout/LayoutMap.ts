import { Coord, FlatHexaOrientation } from '@everyboard/games';
import { TopologyID } from '@everyboard/games';
import { MGPMap } from '@everyboard/lib';

import { SPACE_SIZE } from '../base-game-component/BaseGameComponent';

import { HexaLayout } from './HexaLayout';
import { Layout } from './Layout';
import { SquareLayout } from './SquareLayout';
import { TriangularLayout } from './TriangularLayout';

export class LayoutMap {

    private static readonly layoutMap: MGPMap<TopologyID, Layout> = new MGPMap([
        {
            key: 'HEXAGONAL',
            value: new HexaLayout(
                SPACE_SIZE * 0.6,
                new Coord(0, 0),
                FlatHexaOrientation.INSTANCE,
            ),
        }, {
            key: 'SQUARE (4)',
            value: new SquareLayout(SPACE_SIZE),
        }, {
            key: 'SQUARE (8)',
            value: new SquareLayout(SPACE_SIZE),
        }, {
            key: 'TRIANGULAR',
            value: new TriangularLayout(SPACE_SIZE * 1.2),
        },
    ]);

    public static getLayout(topologyId: TopologyID): Layout {
        return LayoutMap.layoutMap.get(topologyId).get();
    }
}
