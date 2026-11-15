import { Component, OutputEmitterRef, Signal, WritableSignal, inject, output, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { ArrayUtils, MGPOptional } from '@everyboard/lib';

import { Theme, ThemeService } from '../../../services/ThemeService';
import { Language, UserSettingsService } from '../../../services/UserSettingsService';

type SettingOption<T> = { value: T; name: string }

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    imports: [ReactiveFormsModule],
})
export class SettingsComponent {

    private readonly userSettingsService: UserSettingsService = inject(UserSettingsService);
    private readonly themeService: ThemeService = inject(ThemeService);

    public readonly availableLanguages: SettingOption<Language>[] = [
        { value: 'fr', name: 'Français' },
        { value: 'en', name: 'English' },
    ];
    public readonly availableThemes: SettingOption<Theme>[] = [
        { value: 'light', name: $localize`Light` },
        { value: 'dark', name: $localize`Dark` },
    ];
    public readonly currentTheme: Signal<Theme> = this.themeService.theme;
    public readonly currentLanguage: Language;
    public readonly candidateLanguage: WritableSignal<MGPOptional<Language>> = signal(MGPOptional.empty());
    public readonly settingsClosed: OutputEmitterRef<void> = output();

    public constructor() {
        this.currentLanguage = this.userSettingsService.getLanguage();
    }
    public changeLanguage(event: Event): void {
        const target: HTMLSelectElement = event.target as HTMLSelectElement;
        const selectedLanguage: MGPOptional<SettingOption<Language>> = ArrayUtils.find(
            this.availableLanguages,
            (language: SettingOption<Language>): boolean => language.value === target.value,
        );
        if (selectedLanguage.isPresent() && selectedLanguage.get().value !== this.currentLanguage) {
            this.candidateLanguage.set(MGPOptional.of(selectedLanguage.get().value));
        } else {
            this.candidateLanguage.set(MGPOptional.empty());
        }
    }
    public reloadWithCandidateLanguage(): void {
        const candidateLanguage: MGPOptional<Language> = this.candidateLanguage();
        if (candidateLanguage.isPresent()) {
            this.userSettingsService.activateLanguage(candidateLanguage.get());
            this.reload();
        }
    }
    public applyCandidateLanguageNextTime(): void {
        const candidateLanguage: MGPOptional<Language> = this.candidateLanguage();
        if (candidateLanguage.isPresent()) {
            this.userSettingsService.scheduleLanguageChange(candidateLanguage.get());
            this.candidateLanguage.set(MGPOptional.empty());
            this.settingsClosed.emit();
        }
    }
    public cancelLanguageChange(): void {
        this.candidateLanguage.set(MGPOptional.empty());
    }
    public changeTheme(event: Event): void {
        const target: HTMLSelectElement = event.target as HTMLSelectElement;
        const selectedTheme: MGPOptional<SettingOption<Theme>> = ArrayUtils.find(
            this.availableThemes,
            (theme: SettingOption<Theme>): boolean => theme.value === target.value,
        );
        if (selectedTheme.isPresent()) {
            this.userSettingsService.changeTheme(selectedTheme.get().value);
            this.themeService.loadTheme(selectedTheme.get().value);
        }
    }
    private reload(): void {
        // Reload app to apply changes
        window.open(window.location.href, '_self');
    }
}
