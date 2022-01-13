import { CanActivate, UrlTree } from '@angular/router';
import { AuthenticationService, AuthUser } from '../services/AuthenticationService';

/**
 * This abstract guard can be used to implement guards based on the current user
 */
export abstract class AccountGuard implements CanActivate {
    constructor(private readonly authService: AuthenticationService) {
    }
    public async canActivate(): Promise<boolean | UrlTree > {
        const user: AuthUser = await this.authService.getUser();
        return this.evaluateUserPermission(user);
    }
    protected abstract evaluateUserPermission(user: AuthUser): Promise<boolean | UrlTree>
}
