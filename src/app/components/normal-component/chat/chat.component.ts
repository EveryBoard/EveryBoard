import { formatDate, NgIf, NgFor } from '@angular/common';
import { Component, ElementRef, OnInit, AfterViewChecked, OnDestroy, inject, viewChild, Signal } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faReply, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';

import { Message } from '../../../domain/Message';
import { ChatService } from '../../../services/ChatService';
import { Debug } from '../../../utils/Debug';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    imports: [NgIf, NgFor, ReactiveFormsModule, FormsModule, FaIconComponent],
})
@Debug.log
export class ChatComponent implements OnInit, AfterViewChecked, OnDestroy {

    private readonly chatService: ChatService = inject(ChatService);

    public userMessage: string = '';

    public connected: boolean = false;
    public chat: Message[] = [];
    public readMessages: number = 0;
    public unreadMessagesText: string = '';
    public showUnreadMessagesButton: boolean = false;
    public visible: boolean = true;

    public faReply: IconDefinition = faReply;

    private isNearBottom: boolean = true;
    private notYetScrolled: boolean = true;

    private readonly chatDiv: Signal<ElementRef<HTMLElement> | undefined> = viewChild<ElementRef<HTMLElement>>('chatDiv');

    private chatSubscription!: Subscription;

    public ngOnInit(): void {
        this.loadChatContent();
    }

    private loadChatContent(): void {
        this.chatSubscription = this.chatService.subscribeToMessages((message: Message) => {
            this.onMessageReceived(message);
        });
    }

    public ngOnDestroy(): void {
        this.chatSubscription.unsubscribe();
    }

    public ngAfterViewChecked(): void {
        this.scrollToBottomIfNeeded();
    }

    private onMessageReceived(message: Message): void {
        this.chat.push(message);
        const nbMessages: number = this.chat.length;
        if (this.visible && this.isNearBottom) {
            this.readMessages = nbMessages;
            this.updateUnreadMessagesText(0);
            this.scrollToBottom();
        } else {
            this.updateUnreadMessagesText(nbMessages - this.readMessages);
        }
    }

    private updateUnreadMessagesText(unreadMessages: number): void {
        if (this.visible && this.isNearBottom === false) {
            this.showUnreadMessagesButton = true;
        } else {
            this.showUnreadMessagesButton = false;
        }

        if (unreadMessages === 0) {
            this.unreadMessagesText = $localize`no new message`;
            this.showUnreadMessagesButton = false;
        } else if (unreadMessages === 1) {
            this.unreadMessagesText = $localize`1 new message`;
        } else {
            this.unreadMessagesText = $localize`${unreadMessages} new messages`;
        }
    }

    private scrollToBottomIfNeeded(): void {
        if (this.visible) {
            if (this.isNearBottom || this.notYetScrolled) {
                this.scrollToBottom();
            }
        }
    }

    public updateCurrentScrollPosition(): void {
        const threshold: number = 10;
        const position: number = this.chatDiv()!.nativeElement.scrollTop + this.chatDiv()!.nativeElement.offsetHeight;
        const height: number = this.chatDiv()!.nativeElement.scrollHeight;
        this.isNearBottom = position > height - threshold;
    }

    public scrollToBottom(): void {
        const chatDiv: ElementRef<HTMLElement> | undefined = this.chatDiv();
        if (chatDiv == null) {
            return;
        }
        this.updateUnreadMessagesText(0);
        this.scrollTo(chatDiv.nativeElement.scrollHeight);
        this.notYetScrolled = false;
    }

    // public for testing purpose only
    public scrollTo(position: number): void {
        this.chatDiv()!.nativeElement.scroll({
            top: position,
            left: 0,
            behavior: 'smooth',
        });
    }

    public async sendMessage(): Promise<void> {
        const content: string = this.userMessage;
        this.userMessage = ''; // clears it first to seem more responsive
        await this.chatService.sendMessage(content);
    }

    public switchChatVisibility(): void {
        if (this.visible) {
            this.visible = false;
        } else {
            this.visible = true;
            this.updateUnreadMessagesText(0);
            this.scrollToBottom();
            this.readMessages = this.chat.length;
        }
    }

    public formatTimestamp(timestamp: number): string {
        return formatDate(timestamp, 'HH:mm:ss', 'en-US');
    }
}
