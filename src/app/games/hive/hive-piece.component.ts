import { AfterContentChecked, Component, Input } from '@angular/core';
import { Coord } from 'src/app/jscaip/Coord';
import { HexaLayout } from 'src/app/jscaip/HexaLayout';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { Utils } from 'src/app/utils/utils';
import { HivePiece } from './HivePiece';

@Component({
    selector: '[app-hive-piece]',
    templateUrl: './hive-piece.component.svg',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class HivePieceComponent implements AfterContentChecked {

    @Input() piece: HivePiece;
    @Input() coord: Coord;
    @Input() hexaLayout: HexaLayout;
    @Input() numberOfPieces: number;
    @Input() selected: boolean;

    public pieceClasses: string[] = [];
    public hexaPoints: string = '';
    public isoPointsLight: string = '';
    public isoPointsDark: string = '';
    public hexaCenter: Coord = new Coord(0, 0);
    public readonly PIECE_HEIGHT: number = 10;

    public ngAfterContentChecked() {
        // This needs to be done after every content check,
        // otherwise modifcations to selected will not be properly propagated
        this.pieceClasses = [this.getPlayerClass(this.piece.owner)];
        this.hexaPoints = this.hexaLayout.getHexaCoordsAt(this.coord);
        this.hexaCenter = this.hexaLayout.getCenterAt(this.coord);
        const isoPoints: [Coord[], Coord[]] = this.hexaLayout.getIsoPoints(this.coord, this.PIECE_HEIGHT);
        this.isoPointsLight = isoPoints[0].map((coord: Coord) => coord.toSVGCoord()).join(' ');
        this.isoPointsDark = isoPoints[1].map((coord: Coord) => coord.toSVGCoord()).join(' ');
    }

    // TODO: this is a duplicate from GameComponent. Put this in common somehow (static method on GameComponent, or have a BaseComponent containing such method, inherited by all other components, including HivePieceComponent?)
    public getPlayerClass(player: PlayerOrNone): string {
        switch (player) {
            case Player.ZERO: return 'player0-fill';
            case Player.ONE: return 'player1-fill';
            default:
                Utils.expectToBe(player, PlayerOrNone.NONE);
                return '';
        }
    }
}
