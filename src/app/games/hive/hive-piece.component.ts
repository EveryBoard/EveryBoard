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

    public pieceClass: string[] = [];
    public hexaPoints: string = '';
    public isoPointsLight: string = '';
    public isoPointsDark: string = '';
    public hexaCenter: Coord = new Coord(0, 0);

    public ngAfterContentChecked() {
        // This needs to be done after every content check,
        // otherwise modifcations to selected will not be properly propagated
        this.pieceClass = this.stack.pieces.map((piece: HivePiece) => this.getPlayerClass(piece.owner));
        this.hexaPoints = this.hexaLayout.getHexaCoordsAt(this.coord);
        this.hexaCenter = this.hexaLayout.getCenterAt(this.coord);
        const isoPoints: [Coord[], Coord[]] = this.hexaLayout.getIsoPoints(this.coord, this.pieceHeight);
        this.isoPointsLight = isoPoints[0].map((coord: Coord) => coord.toSVGCoord()).join(' ');
        this.isoPointsDark = isoPoints[1].map((coord: Coord) => coord.toSVGCoord()).join(' ');
    }
}
