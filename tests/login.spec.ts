import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { loadRegisteredUser } from '../utils/userStore';

test.describe('User login', () => {
  test('the newly registered user can log in', async ({ page }) => {
    const user = loadRegisteredUser();

    // Makes the cause obvious instead of failing on an empty email field.
    test.skip(
      user === null,
      'No account available. Run the register project first, or set EXISTING_USER_EMAIL and EXISTING_USER_PASSWORD in .env.',
    );

    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.goto();
    await loginPage.login(user!.email, user!.password);

    await dashboardPage.expectLoggedIn();
  });

  test('login fails with a wrong password', async ({ page }) => {
    const user = loadRegisteredUser();
    test.skip(user === null, 'No account available for the negative test.');

    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(user!.email, 'WrongPassword@2026');

    // The user must stay on the login page and must not reach the dashboard.
    await expect(page).not.toHaveURL(/dashboard/);
    await expect(loginPage.loginButton).toBeVisible();
  });
});
