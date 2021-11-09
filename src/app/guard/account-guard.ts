import { CanActivate, UrlTree } from '@angular/router';
import { AuthenticationService, AuthUser } from '../services/AuthenticationService';

/**
 * This abstract guard can be used to implement guards based on the current user
 */
export abstract class AccountGuard implements CanActivate {
    constructor(private authService: AuthenticationService) {
    }
    public canActivate(): Promise<boolean | UrlTree > {
        return new Promise((resolve: (value: boolean | UrlTree) => void) => {
            this.authService.getUserObs().subscribe((user: AuthUser): void => {
                this.evaluateUserPermission(user).then(resolve);
            });
        });
    }
    protected abstract evaluateUserPermission(user: AuthUser): Promise<boolean | UrlTree>
}
