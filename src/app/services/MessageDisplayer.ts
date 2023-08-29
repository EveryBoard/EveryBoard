import { Injectable } from '@angular/core';
import { toast, ToastType } from 'bulma-toast';

@Injectable({
    providedIn: 'root',
})
export class MessageDisplayer {

    public infoMessage(message: string): void {
        this.message(message, 'is-info');
    }
    public gameMessage(message: string): void {
        this.message(message, 'is-warning');
    }
    public criticalMessage(message: string): void {
        this.message(message, 'is-danger');
    }
    private message(message: string, cssClass: ToastType): void {
        const duration: number = this.getDuration(message);
        this.toast(message, cssClass, duration);
    }
    private toast(message: string, cssClass: ToastType, duration: number): void {
        toast({
            message,
            duration,
            type: cssClass,
            position: 'top-center',
            closeOnClick: true,
            dismissible: true,
        });
    }
    /**
     * Returns the duration during which the message should be displayed.
     * It is at least 3 seconds, and increases with the length of the message.
     */
    private getDuration(message: string): number {
        const words: number = message.split(' ').length;
        const belowAverageReadingSpeed: number = 150; // Average reading speed is around 200 words per minute
        const readingTime: number = words * 60 * 1000/ belowAverageReadingSpeed;
        return Math.max(readingTime, 3000);
    }
}
