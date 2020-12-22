import {Component} from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthenticationService} from 'src/app/services/authentication/AuthenticationService';

@Component({
    selector: 'app-inscription',
    templateUrl: './inscription.component.html',
})
export class InscriptionComponent {
    constructor(private authService: AuthenticationService, private router : Router) {}

    public errorMessage: string;

    public inscriptionForm = new FormGroup({
        email: new FormControl(),
        password: new FormControl(),
    });
    public tryRegister(value: {email: string, pseudo: string, password: string}) {
        this.authService.doRegister(value)
            .then((res) => this.router.navigate(['/server']),
                (err) => this.errorMessage = err.message);
    }
}
