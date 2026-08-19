import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { generateUser } from '../utils/testData';
import { saveRegisteredUser } from '../utils/userStore';

test.describe('User registration', () => {
  test('a new user can register from the login page', async ({ page }) => {
    const user = generateUser();
    const loginPage = new LoginPage(page);
    const registerPage = new RegisterPage(page);

    await test.step('open the registration form from the login page', async () => {
      await loginPage.goto();
      await loginPage.openRegistrationForm();
    });

    await test.step('fill in and submit the registration form', async () => {
      await registerPage.register(user);
    });

    await test.step('the application confirms the new account', async () => {
      await expect(registerPage.successMessage).toBeVisible();
      await expect(registerPage.loginAfterRegisterButton).toBeVisible();
    });

    // Hand the account over to the login test, which runs next.
    saveRegisteredUser(user);
    // eslint-disable-next-line no-console
    console.log(`Registered user: ${user.email}`);
  });

  test('registration is rejected when the two passwords differ', async ({ page }) => {
    const user = generateUser();
    const registerPage = new RegisterPage(page);

    await registerPage.goto();
    await registerPage.fillForm(user);
    await registerPage.confirmPasswordInput.fill('DifferentPassword@2026');
    await registerPage.submit();

    // The account must not be created, so the confirmation must stay away.
    await expect(registerPage.successMessage).toBeHidden();
    await expect(page).toHaveURL(/register/);
  });
});
