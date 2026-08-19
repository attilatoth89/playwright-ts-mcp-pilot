import { expect, type Locator, type Page } from '@playwright/test';

/**
 * The product listing page the application opens after a successful login.
 * It is only used to verify that the login really happened, so it exposes the
 * few elements that prove a logged-in session.
 */
export class DashboardPage {
  readonly page: Page;

  readonly homeLink: Locator;
  readonly signOutButton: Locator;
  readonly productCards: Locator;

  constructor(page: Page) {
    this.page = page;

    this.homeLink = page.getByRole('link', { name: /home/i });
    this.signOutButton = page.getByRole('button', { name: /sign out/i });
    this.productCards = page.locator('.card-body');
  }

  /**
   * A logged-in session is confirmed by three independent signals: the URL, the
   * presence of a sign-out control and rendered product data. Checking the URL
   * alone would pass even if the page failed to load its content.
   */
  async expectLoggedIn(): Promise<void> {
    await expect(this.page).toHaveURL(/dashboard/);
    await expect(this.signOutButton).toBeVisible();
    await expect(this.productCards.first()).toBeVisible();
  }
}
