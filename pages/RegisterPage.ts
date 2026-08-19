import { expect, type Locator, type Page } from '@playwright/test';
import type { TestUser } from '../utils/testData';

/**
 * Registration page of https://rahulshettyacademy.com/client/
 */
export class RegisterPage {
  readonly page: Page;

  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly occupationSelect: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly termsCheckbox: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;
  readonly loginAfterRegisterButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.firstNameInput = page.locator('#firstName');
    this.lastNameInput = page.locator('#lastName');
    this.emailInput = page.locator('#userEmail');
    this.phoneInput = page.locator('#userMobile');
    // The occupation dropdown has no id - the page has exactly one <select>.
    this.occupationSelect = page.locator('select');
    this.passwordInput = page.locator('#userPassword');
    this.confirmPasswordInput = page.locator('#confirmPassword');
    this.termsCheckbox = page.locator('input[type="checkbox"]').first();
    this.submitButton = page.locator('input[type="submit"][value="Register"]');
    this.successMessage = page.getByText(/account created successfully/i);
    this.loginAfterRegisterButton = page.getByRole('button', { name: /login/i });
  }

  async goto(): Promise<void> {
    await this.page.goto('#/auth/register');
    await expect(this.firstNameInput).toBeVisible();
  }

  private genderRadio(gender: TestUser['gender']): Locator {
    return this.page.locator(`input[value="${gender}"]`);
  }

  /** Fills every field of the form but does not submit it. */
  /**
   * Selecting by label, not by value: Angular renders the option values as
   * "3: Engineer", where the number is the index in the options array. Any
   * reordering of the list would silently break a value-based selector.
   */
  async fillForm(user: TestUser): Promise<void> {
    await this.firstNameInput.fill(user.firstName);
    await this.lastNameInput.fill(user.lastName);
    await this.emailInput.fill(user.email);
    await this.phoneInput.fill(user.phone);
    await this.occupationSelect.selectOption({ label: user.occupation });
    await this.genderRadio(user.gender).check();
    await this.passwordInput.fill(user.password);
    await this.confirmPasswordInput.fill(user.password);
    await this.termsCheckbox.check();
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async register(user: TestUser): Promise<void> {
    await this.fillForm(user);
    await this.submit();
  }
}
