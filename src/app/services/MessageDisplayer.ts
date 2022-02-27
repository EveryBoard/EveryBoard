import { Injectable } from '@angular/core';
import { toast, ToastType } from 'bulma-toast';

@Injectable({
    providedIn: 'root',
})
export class MessageDisplayer {

    public infoMessage(msg: string): void {
        this.message(msg, 'is-info');
    }
    public gameMessage(msg: string): void {
        this.message(msg, 'is-warning');
    }
    public criticalMessage(msg: string): void {
        this.message(msg, 'is-danger');
    }
    private message(msg: string, cssClass: ToastType): void {
        toast({
            message: msg,
            duration: 3000,
            position: 'top-center',
            closeOnClick: true,
            type: cssClass,
            dismissible: true,
        });
    }
}
