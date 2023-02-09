import { AfterContentChecked, Component, Input } from '@angular/core';
import { BaseGameComponent } from 'src/app/components/game-components/game-component/GameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { HexaLayout } from 'src/app/jscaip/HexaLayout';
import { HivePiece, HivePieceStack } from './HivePiece';

@Component({
    selector: '[app-hive-piece]',
    templateUrl: './hive-piece.component.svg',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class HivePieceComponent extends BaseGameComponent implements AfterContentChecked {

    @Input() stack: HivePieceStack;
    @Input() pieceHeight: number;
    @Input() coord: Coord;
    @Input() hexaLayout: HexaLayout;
    @Input() sideView: boolean;
    @Input() indicator: boolean;

    public pieceClass: string[] = [];
    public hexaPoints: string = '';
    public isoPointsLight: string = '';
    public isoPointsDark: string = '';
    public isoPointsStroke: string = '';
    public hexaCenter: Coord = new Coord(0, 0);
    public sideViewFactor: number = 1;

    public ngAfterContentChecked() {
        // This needs to be done after every content check,
        // otherwise modifcations to selected will not be properly propagated
        this.pieceClass = this.stack.pieces.map((piece: HivePiece) => this.getPlayerClass(piece.owner));
        this.hexaPoints = this.hexaLayout.getHexaPointsAt(this.coord);
        this.hexaCenter = this.hexaLayout.getCenterAt(this.coord);
        const isoPoints: [Coord[], Coord[], Coord[]] = this.hexaLayout.getIsoPoints(this.coord, this.pieceHeight);
        const isoPointsSVG: string[] = isoPoints.map((coords: Coord[]) =>
            coords.map((coord: Coord) => coord.toSVGCoord()).join(' '));
        this.isoPointsLight = isoPointsSVG[0];
        this.isoPointsDark = isoPointsSVG[1];
        this.isoPointsStroke = isoPointsSVG[2];
        this.sideViewFactor = this.sideView ? 6 : 1;
    }
}
