import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root',
})
export class MessageDisplayer {

    constructor(private snackBar: MatSnackBar) {
    }
    public infoMessage(msg: string): void {
        this.message(msg, 'snackbar-info');
    }
    public gameMessage(msg: string): void {
        this.message(msg, 'snackbar-game');
    }
    private message(msg: string, cssClass: string): void {
        this.snackBar.open(msg, 'Ok', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: cssClass,
        });
    }
}
