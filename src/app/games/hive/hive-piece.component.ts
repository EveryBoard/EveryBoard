import { AfterContentChecked, Component, Input } from '@angular/core';
import { BaseGameComponent } from 'src/app/components/game-components/game-component/GameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { HexaLayout } from 'src/app/jscaip/HexaLayout';
import { HivePiece } from './HivePiece';

@Component({
    selector: '[app-hive-piece]',
    templateUrl: './hive-piece.component.svg',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class HivePieceComponent extends BaseGameComponent implements AfterContentChecked {

    @Input() piece: HivePiece;
    @Input() x: number;
    @Input() y: number;
    @Input() hexaLayout: HexaLayout;
    @Input() level: number;
    @Input() pieceHeight: number;

    public hexaPoints: string = '';
    public pieceClass: string = '';
    public isoPointsLight: string = '';
    public isoPointsDark: string = '';
    public isoPointsStroke: string = '';
    public levelTransform: string = '';
    public hexaCenter: Coord = new Coord(0, 0);

    public ngAfterContentChecked() {
        // This needs to be done after every content check,
        // otherwise modifcations to selected will not be properly propagated
        const coord: Coord = new Coord(this.x, this.y);
        this.pieceClass = this.getPlayerClass(this.piece.owner);
        this.hexaPoints = this.hexaLayout.getHexaPointsAt(coord);
        this.hexaCenter = this.hexaLayout.getCenterAt(coord);
        const isoPoints: [Coord[], Coord[], Coord[]] = this.hexaLayout.getIsoPoints(coord, this.pieceHeight);
        const isoPointsSVG: string[] = isoPoints.map((coords: Coord[]) =>
            coords.map((coord: Coord) => coord.toSVGCoord()).join(' '));
        this.isoPointsLight = isoPointsSVG[0];
        this.isoPointsDark = isoPointsSVG[1];
        this.isoPointsStroke = isoPointsSVG[2];
        this.levelTransform = `translate(0 -${(this.level+1) * this.pieceHeight})`;
    }
}
