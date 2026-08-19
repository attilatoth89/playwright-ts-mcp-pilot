import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Login page of https://rahulshettyacademy.com/client/
 *
 * Locators live in the constructor so a UI change only has to be fixed in one
 * place. Where the application exposes a stable id the test uses it; elsewhere
 * it falls back to the accessible role or the visible label, which survives
 * styling changes better than a CSS path.
 */
export class LoginPage {
  readonly page: Page;

  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly registerLink: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.emailInput = page.locator('#userEmail');
    this.passwordInput = page.locator('#userPassword');
    this.loginButton = page.locator('#login');
    // Verified against the live DOM: this is an <a> without an href, so the
    // browser does not give it the "link" ARIA role and getByRole('link')
    // never matches it. Text is the reliable handle here.
    this.registerLink = page.getByText(/register here/i);
    this.errorMessage = page.locator('.ng-tns-c4-0, [role="alert"]').first();
  }

  async goto(): Promise<void> {
    await this.page.goto('#/auth/login');
    await expect(this.emailInput).toBeVisible();
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async openRegistrationForm(): Promise<void> {
    await this.registerLink.click();
    await expect(this.page).toHaveURL(/register/);
  }
}
