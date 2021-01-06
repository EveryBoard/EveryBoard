import { Component } from "@angular/core";
import { MGPValidation } from "src/app/collectionlib/mgpvalidation/MGPValidation";
import { EpaminondasLegalityStatus } from "src/app/games/epaminondas/epaminondaslegalitystatus";
import { EpaminondasMove } from "src/app/games/epaminondas/epaminondasmove/EpaminondasMove";
import { EpaminondasPartSlice } from "src/app/games/epaminondas/epaminondaspartslice/EpaminondasPartSlice";
import { EpaminondasRules } from "src/app/games/epaminondas/epaminondasrules/EpaminondasRules";
import { Coord } from "src/app/jscaip/coord/Coord";
import { Direction } from "src/app/jscaip/DIRECTION";
import { Player } from "src/app/jscaip/Player";
import { AbstractGameComponent } from "../AbstractGameComponent";

@Component({
    selector: 'app-epaminondas',
    templateUrl: './epaminondas.component.html'
})
export class EpaminondasComponent extends AbstractGameComponent<EpaminondasMove, EpaminondasPartSlice, EpaminondasLegalityStatus> {

    public NONE: number = Player.NONE.value;
    public CAPTURED_FILL: string = "red";
    public MOVED_FILL: string = "gray";
    public NORMAL_FILL: string = "lightgray";
    public CLICKABLE_STYLE: any = {
        stroke: "yellow",
    };
    public rules: EpaminondasRules = new EpaminondasRules(EpaminondasPartSlice);

    public firstPiece: Coord = new Coord(-15, -1);

    private phalanxMiddles: Coord[] = [];

    public lastPiece: Coord = new Coord(-15, -1);

    private phalanxValidLandings: Coord[] = [];

    public updateBoard(): void {
        this.firstPiece = new Coord(-15, -1);
        this.lastPiece = new Coord(-15, -1);
        this.board = this.rules.node.gamePartSlice.getCopiedBoard();
    }
    public decodeMove(encodedMove: number): EpaminondasMove {
        return EpaminondasMove.decode(encodedMove);
    }
    public encodeMove(move: EpaminondasMove): number {
        return EpaminondasMove.encode(move);
    }
    public async onClick(x: number, y: number) {
        if (this.firstPiece.x === -15) {
            return this.firstClick(x, y);
        } else if (this.lastPiece.x === -15) {
            return this.secondClick(x, y);
        } else {
            return this.thirdClick(x, y);
        }
    }
    private firstClick(x: number, y: number) {
        const ENNEMY: number = this.rules.node.gamePartSlice.getCurrentEnnemy().value;
        const PLAYER: number = this.rules.node.gamePartSlice.getCurrentPlayer().value;
        switch (this.board[y][x]) {
            case PLAYER:
                this.firstPiece = new Coord(x, y);
                break;
            case ENNEMY:
                return this.cancelMove("Cette pièce appartient à l'ennemi, vous devez sélectionner une de vos pièces.");
            case Player.NONE.value:
                return this.cancelMove("Cette case est vide, vous devez sélectionner une de vos pièces.")
        }
    }
    private secondClick(x: number, y: number) {
        const clicked: Coord = new Coord(x, y);
        if (clicked.equals(this.firstPiece)) {
            return this.cancelMove();
        }
        const ENNEMY: number = this.rules.node.gamePartSlice.getCurrentEnnemy().value;
        const PLAYER: number = this.rules.node.gamePartSlice.getCurrentPlayer().value;
        if (!clicked.isAlignedWith(this.firstPiece)) {
            return this.cancelMove("Cette case n'est pas alignée avec la pièce sélectionnée.");
        }
        const distance: number = clicked.getDistance(this.firstPiece);
        const direction: Direction = this.firstPiece.getDirectionToward(clicked);
        switch (this.board[y][x]) {
            case Player.NONE.value:
                if (distance === 1) {
                    const move: EpaminondasMove = new EpaminondasMove(this.firstPiece.x, this.firstPiece.y, 1, 1, direction);
                    return this.tryMove(move);
                } else {
                    return this.cancelMove("Une pièce seule ne peut se déplacer que d'une case.");
                }
            case ENNEMY:
                return this.cancelMove("Cette pièces est celle d'un ennemi et n'est pas à côté de la première, vous devez choisir une deuxième pièce pour votre phalange ou une case voisine d'une pièce isolée.");
            case PLAYER:
                const incompleteMove: EpaminondasMove = new EpaminondasMove(this.firstPiece.x,
                                                                            this.firstPiece.y,
                                                                            distance,
                                                                            1,
                                                                            direction);
                const slice: EpaminondasPartSlice = this.rules.node.gamePartSlice;
                const phalanxValidity: MGPValidation = this.rules.getPhalanxValidity(slice, incompleteMove);
                if (phalanxValidity.isFailure()) {
                    return this.cancelMove(phalanxValidity.reason);
                } else {
                    this.lastPiece = clicked;
                    this.phalanxMiddles = this.firstPiece.getCoordsToward(this.lastPiece);
                    return;
                }
        }
    }
    private thirdClick(x: number, y: number) {
        const clicked: Coord = new Coord(x, y);
        const PLAYER: number = this.rules.node.gamePartSlice.getCurrentPlayer().value;
        if (!clicked.isAlignedWith(this.firstPiece)) {
            return this.cancelMove("This case is not align with the phalanx direction.");
        }
        const phalanxDx: number = this.lastPiece.x - this.firstPiece.x;
        const phalanxDy: number = this.lastPiece.y - this.firstPiece.y;
        let phalanxDirection: Direction = Direction.fromDelta(phalanxDx, phalanxDy);

        const landingDx: number = x - this.firstPiece.x;
        const landingDy: number = y - this.firstPiece.y;
        const phalanxLanding: Direction = Direction.fromDelta(landingDx, landingDy);
        if (phalanxDirection === phalanxLanding.getOpposite()) {
            const firstPiece: Coord = this.firstPiece;
            this.firstPiece = this.lastPiece;
            this.lastPiece = firstPiece;
            phalanxDirection = phalanxLanding;
        }
        if (phalanxDirection !== phalanxLanding) {
            return this.cancelMove("This case is not align with the phalanx direction.");
        }
        const phalanxSize: number = this.firstPiece.getDistance(this.lastPiece) + 1;
        const stepSize: number = this.lastPiece.getDistance(clicked);
        if (this.board[y][x] === PLAYER) {
            const incompleteMove: EpaminondasMove = new EpaminondasMove(this.firstPiece.x,
                                                                        this.firstPiece.y,
                                                                        phalanxSize,
                                                                        stepSize,
                                                                        phalanxDirection);
            const phalanxValidity: MGPValidation = this.rules.getPhalanxValidity(this.rules.node.gamePartSlice,
                                                                                 incompleteMove);
            if (phalanxValidity.isFailure()) {
                return this.cancelMove(phalanxValidity.reason);
            } else {
                this.lastPiece = clicked;
                this.phalanxMiddles = this.firstPiece.getCoordsToward(this.lastPiece);
                return;
            }
        } else {
            if (stepSize > phalanxSize) {
                return this.cancelMove("Mais c'est trop loin ça ba-tar (phalanxSize: " + phalanxSize + ", stepSize: " + stepSize + ")");
            }
            const move: EpaminondasMove = new EpaminondasMove(this.firstPiece.x,
                                                              this.firstPiece.y,
                                                              phalanxSize,
                                                              stepSize,
                                                              phalanxDirection);
            return this.tryMove(move);
        }
    }
    public cancelMove(reason?: string): MGPValidation {
        this.firstPiece = new Coord(-15, -1);
        this.lastPiece = new Coord(-15, -1);
        if (reason) {
            this.message(reason);
            return MGPValidation.failure(reason);
        } else {
            return MGPValidation.SUCCESS;
        }
    }
    public tryMove(move: EpaminondasMove): Promise<MGPValidation> {
        const slice: EpaminondasPartSlice = this.rules.node.gamePartSlice;
        this.cancelMove();
        return this.chooseMove(move, slice, null, null);
    }
    public getPieceStyle(x: number, y: number): any {
        const fill: string = this.getPlayerColor(this.board[y][x]);
        const stroke: string = this.getPieceStroke(x, y);
        return { fill, stroke };
    }
    private getPlayerColor(player: number): string {
        switch (player) {
            case Player.NONE.value: return "grey"; // TODO: if not needed, remove or throw
            case Player.ONE.value: return "#ffc34d";
            case Player.ZERO.value: return "#994d00";
        }
    }
    private getPieceStroke(x: number, y: number): string {
        // Show pieces belonging to the phalanx to move
        const coord: Coord = new Coord(x, y);
        if (this.firstPiece.x === -15 && this.lastPiece.x === -15)
            return null;
        if (this.firstPiece.equals(coord) ||
            this.lastPiece.equals(coord) ||
            this.phalanxMiddles.some((c: Coord) => c.equals(coord)))
        {
            return "yellow";
        } else {
            return null;
        }
    }
    public getRectFill(x: number, y: number): string {
        if (this.rules.node.mother == null) {
            return this.NORMAL_FILL;
        }
        const oldSlice: EpaminondasPartSlice = this.rules.node.mother.gamePartSlice;
        const currentSlice: EpaminondasPartSlice = this.rules.node.gamePartSlice;
        const ENNEMY: number = oldSlice.getCurrentEnnemy().value;
        const wasEnnemy: boolean = oldSlice.getBoardByXY(x, y) === ENNEMY;
        const isNotEnnemy: boolean = currentSlice.getBoardByXY(x, y) !== ENNEMY;
        if (wasEnnemy && isNotEnnemy) {
            return this.CAPTURED_FILL;
        }
        const PLAYER: number = oldSlice.getCurrentPlayer().value;
        const wasPlayer: boolean = oldSlice.getBoardByXY(x, y) === PLAYER;
        const isEmpty: boolean = currentSlice.getBoardByXY(x, y) === this.NONE;
        if (wasPlayer && isEmpty) {
            return this.MOVED_FILL;
        } else {
            return this.NORMAL_FILL;
        }
    }
    public getRectStyle(x: number, y: number): any {
        if (this.isClickable(x, y)) {
            return this.CLICKABLE_STYLE;
        } else {
            return null;
        }
    }
    public isClickable(x: number, y: number): boolean {
        // Show if the piece can be clicked
        if (this.firstPiece.x === -15) {
            const slice: EpaminondasPartSlice = this.rules.node.gamePartSlice;
            const PLAYER: number = slice.getCurrentPlayer().value;
            return (this.board[y][x] === PLAYER &&
                    this.isUserTurn());
        } else if (this.lastPiece.x === -15) {
            const dx: number = this.firstPiece.x - x;
            const dy: number = this.firstPiece.y - y;
            if (-1 <= dx && dx <= 1 &&
                -1 <= dy && dy <= 1)
            {
                return true;
            } else {
                return false; // NOPE
            }
        } else {
            return false; // NOPE
        }
    }
    private isUserTurn(): boolean {
        // TODO: must check if user is no observer, if it's not AI turn, should be nice to have that in common for all wrapper
        return true;
    }
}