import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { MGPOptional, MGPValidation, Utils } from '@everyboard/lib';

import { AutofocusDirective } from '../../../pipes-and-directives/autofocus.directive';
import { ConnectedUserService } from '../../../services/ConnectedUserService';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    imports: [ReactiveFormsModule, AutofocusDirective, FormsModule, NgIf],
})
export class ResetPasswordComponent {

    public readonly connectedUserService: ConnectedUserService = inject(ConnectedUserService);

    public success: boolean = false;
    public errorMessage: MGPOptional<string> = MGPOptional.empty();
    public email: string = '';

    public async resetPassword(): Promise<void> {
        Utils.assert(this.email !== '', 'No email was entered, but it should not be possible to submit the form then!');
        this.errorMessage = MGPOptional.empty();
        this.success = false;
        const result: MGPValidation = await this.connectedUserService.sendPasswordResetEmail(this.email);
        if (result.isSuccess()) {
            this.success = true;
        } else {
            this.errorMessage = MGPOptional.of(result.getReason());
        }
    }
}
