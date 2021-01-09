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

    private validExtensions: Coord[] = [];

    private phalanxValidLandings: Coord[] = [];

    public lastPiece: Coord = new Coord(-15, -1);

    private phalanxDirection: Direction;

    private phalanxMiddles: Coord[] = [];

    private moveds: Coord[] = [];

    private captureds: Coord[] = [];

    public updateBoard(): void {
        console.log("updateBoard")
        this.firstPiece = new Coord(-15, -1);
        this.lastPiece = new Coord(-15, -1);
        if (this.rules.node.move) {
            this.showPreviousMove();
        }
        this.board = this.rules.node.gamePartSlice.getCopiedBoard();
    }
    private showPreviousMove() {
        const move: EpaminondasMove = this.rules.node.move;
        let moved: Coord = move.coord;
        this.moveds = [moved];
        for(let i: number = 1; i < (move.stepSize + move.movedPieces); i++) {
            moved = moved.getNext(move.direction, 1);
            console.log({ wasMoved: moved })
            this.moveds.push(moved);
        }

        this.captureds = [];
        const PREVIOUS_ENNEMY: number = this.rules.node.mother.gamePartSlice.getCurrentEnnemy().value;
        while (moved.isInRange(14, 12) &&
               this.rules.node.mother.gamePartSlice.getBoardAt(moved) === PREVIOUS_ENNEMY)
        {
            console.log({ wasCaptured: moved })
            this.captureds.push(moved);
            moved = moved.getNext(move.direction, 1);
        }

        console.log({ showPreviousMove: { moveds: this.moveds, captureds: this.captureds }})
    }
    public decodeMove(encodedMove: number): EpaminondasMove {
        return EpaminondasMove.decode(encodedMove);
    }
    public encodeMove(move: EpaminondasMove): number {
        return EpaminondasMove.encode(move);
    }
    public async onClick(x: number, y: number) {
        console.log({ aFirst: this.firstPiece, bSecond: this.lastPiece });
        if (this.firstPiece.x === -15) {
            return this.firstClick(x, y);
        } else if (this.lastPiece.x === -15) {
            return this.secondClick(x, y);
        } else {
            return this.thirdClick(x, y);
        }
    }
    private firstClick(x: number, y: number) {
        console.log("first click on (" + x + ", " + y + ")");
        this.hidePreviousMove();
        const ENNEMY: number = this.rules.node.gamePartSlice.getCurrentEnnemy().value;
        const PLAYER: number = this.rules.node.gamePartSlice.getCurrentPlayer().value;
        switch (this.board[y][x]) {
            case PLAYER:
                this.firstPiece = new Coord(x, y);
                this.validExtensions = this.getValidExtensions(PLAYER);
                this.phalanxValidLandings = this.getPhalanxValidLandings();
                break;
            case ENNEMY:
                return this.cancelMove("Cette pièce appartient à l'ennemi, vous devez sélectionner une de vos pièces.");
            case Player.NONE.value:
                return this.cancelMove("Cette case est vide, vous devez sélectionner une de vos pièces.")
        }
    }
    private hidePreviousMove() {
        this.captureds = [];
        this.moveds = [];
    }
    private getValidExtensions(PLAYER: number): Coord[] {
        if (this.lastPiece.x === -15) {
            return this.getFirstPieceExtensions(PLAYER);
        } else {
            return this.getPhalanxValidExtensions(PLAYER);
        }
    }
    private getFirstPieceExtensions(PLAYER: number): Coord[] {
        const extensions: Coord[] = [];
        for (const direction of Direction.DIRECTIONS) {
            let c: Coord = this.firstPiece.getNext(direction, 1);
            while (c.isInRange(14, 12) &&
                   this.board[c.y][c.x] === PLAYER)
            {
                extensions.push(c);
                c = c.getNext(direction, 1);
            }
        }
        return extensions;
    }
    private getPhalanxValidExtensions(PLAYER: number): Coord[] {
        let direction: Direction = Direction.fromMove(this.firstPiece, this.lastPiece);
        let forward: Coord = this.lastPiece.getNext(direction, 1);
        let extensionForward: Coord[] = this.getExtensionsToward(forward, direction, PLAYER);

        direction = direction.getOpposite();
        let backWard: Coord = this.firstPiece.getNext(direction, 1);
        let extensionsBackward: Coord[] = this.getExtensionsToward(backWard, direction, PLAYER);
        return extensionForward.concat(extensionsBackward);
    }
    private getExtensionsToward(coord: Coord, direction: Direction, PLAYER: number): Coord[] {
        const extensions: Coord[] = [];
        while (coord.isInRange(14, 12) &&
               this.board[coord.y][coord.x] === PLAYER)
        {
            extensions.push(coord);
            coord = coord.getNext(direction, 1);
        }
        return extensions;
    }
    private getPhalanxValidLandings(): Coord[] {
        if (this.lastPiece.x === -15) {
            return this.getNeighbooringEmptyCases();
        } else {
            const dx: number = Math.abs(this.firstPiece.x - this.lastPiece.x);
            const dy: number = Math.abs(this.firstPiece.y - this.lastPiece.y);
            const phalanxSize: number = Math.max(dx, dy) + 1;
            console.log({ phalanxSize })

            let direction: Direction = Direction.fromMove(this.firstPiece, this.lastPiece);
            let landingForward: Coord = this.lastPiece.getNext(direction, 1);
            const landingsForward: Coord[] = this.getLandingsToward(landingForward, direction, phalanxSize);

            direction = direction.getOpposite();
            let landingBackward: Coord = this.firstPiece.getNext(direction, 1);
            const landingsBackward: Coord[] = this.getLandingsToward(landingBackward, direction, phalanxSize);
            console.log({ canLand: landingsBackward.concat(landingsForward) });
            return landingsBackward.concat(landingsForward);
        }
    }
    private getNeighbooringEmptyCases(): Coord[] {
        const neighboors: Coord[] = [];
        for (const direction of Direction.DIRECTIONS) {
            const coord: Coord = this.firstPiece.getNext(direction, 1);
            if (coord.isInRange(14, 12) &&
                this.board[coord.y][coord.x] === Player.NONE.value)
            {
                neighboors.push(coord);
            }
        }
        return neighboors;
    }
    private getLandingsToward(landing: Coord, direction: Direction, phalanxSize: number): Coord[] {
        console.log({ getLandingsToward: { landing, direction, phalanxSize }})
        const PLAYER: number = this.rules.node.gamePartSlice.getCurrentPlayer().value;
        const ENNEMY: number = this.rules.node.gamePartSlice.getCurrentEnnemy().value;
        const landings: Coord[] = [];
        while (landing.isInRange(14, 12) &&
               landings.length < phalanxSize &&
               this.board[landing.y][landing.x] !== PLAYER)
        {
            if (this.board[landing.y][landing.x] === ENNEMY) {
                if (this.getPhalanxLength(landing, direction, ENNEMY) < phalanxSize) {
                    landings.push(landing);
                }
                return landings;
            } else {
                landings.push(landing);
                landing = landing.getNext(direction, 1);
            }
        }
        return landings;
    }
    private getPhalanxLength(firstPiece: Coord, direction: Direction, owner: number): number {
        let length: number = 0;
        while (firstPiece.isInRange(14, 12) &&
               this.board[firstPiece.y][firstPiece.x] === owner)
        {
            length++;
            firstPiece = firstPiece.getNext(direction, 1);
        }
        return length;
    }
    public cancelMove(reason?: string): MGPValidation {
        this.firstPiece = new Coord(-15, -1);
        this.validExtensions = [];
        this.phalanxValidLandings = [];
        this.lastPiece = new Coord(-15, -1);
        this.phalanxMiddles = [];
        this.hidePreviousMove();
        if (reason) {
            console.log("Move Canceled Because: " + reason);
            this.message(reason);
            return MGPValidation.failure(reason);
        } else {
            return MGPValidation.SUCCESS;
        }
    }
    private secondClick(x: number, y: number) {
        console.log("second click on (" + x + ", " + y + ")");
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
                console.log({ board: this.board });
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
                    this.validExtensions = this.getValidExtensions(PLAYER);
                    this.phalanxValidLandings = this.getPhalanxValidLandings();
                    this.phalanxMiddles = this.firstPiece.getCoordsToward(this.lastPiece);
                    this.phalanxDirection = direction;
                    return;
                }
        }
    }
    private thirdClick(x: number, y: number) {
        console.log("third click on (" + x + ", " + y + ")");
        const PLAYER: number = this.rules.node.gamePartSlice.getCurrentPlayer().value;
        const clicked: Coord = new Coord(x, y);
        if (clicked.equals(this.firstPiece)) {
            return this.moveFirstPiece(PLAYER);
        }
        if (!clicked.isAlignedWith(this.firstPiece)) {
            return this.cancelMove("This case is not align with the phalanx direction.");
        }
        let phalanxDirection: Direction = Direction.fromMove(this.firstPiece, this.lastPiece);
        const phalanxLanding: Direction = Direction.fromMove(this.firstPiece, clicked);
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
                this.validExtensions = this.getValidExtensions(PLAYER);
                this.phalanxValidLandings = this.getPhalanxValidLandings();
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
    private moveFirstPiece(PLAYER: number) {
        console.log("third click on first piece");
        this.firstPiece = this.firstPiece.getNext(this.phalanxDirection, 1);
        if (this.firstPiece.equals(this.lastPiece)) {
            console.log("they were neighboors");
            this.lastPiece = new Coord(-15, -1);
            this.validExtensions = this.getFirstPieceExtensions(PLAYER);
            this.phalanxDirection = null;
            this.phalanxMiddles = [];
        } else {
            console.log("they wer far enof");
            this.phalanxMiddles = this.phalanxMiddles.slice(1);
            this.validExtensions = this.getPhalanxValidExtensions(PLAYER);
        }

        this.phalanxValidLandings = this.getPhalanxValidLandings();
    }
    public tryMove(move: EpaminondasMove): Promise<MGPValidation> {
        console.log({ tryingMove: move })
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
        const clicked: Coord = new Coord(x, y);
        if (this.captureds.some((c: Coord) => c.equals(clicked))) {
            return this.CAPTURED_FILL;
        } else if (this.moveds.some((c: Coord) => c.equals(clicked))) {
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
        } else {
            const clicked: Coord = new Coord(x, y);
            return this.phalanxValidLandings.some((c: Coord) => c.equals(clicked)) ||
                   this.validExtensions.some((c: Coord) => c.equals(clicked));
        }
    }
    private isUserTurn(): boolean {
        // TODO: must check if user is no observer, if it's not AI turn, should be nice to have that in common for all wrapper
        return true;
    }
}