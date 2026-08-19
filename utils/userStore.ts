import * as fs from 'fs';
import * as path from 'path';
import type { TestUser } from './testData';

/**
 * Hands the freshly registered account over from the registration test to the
 * login test.
 *
 * Playwright runs each project in its own worker process, so the two tests
 * cannot share a variable in memory. Writing the account to a small JSON file
 * keeps the handover explicit and makes it easy to see afterwards which user
 * the run actually created.
 */

const STORE_DIR = path.join(process.cwd(), '.test-state');
const STORE_FILE = path.join(STORE_DIR, 'registered-user.json');

export function saveRegisteredUser(user: TestUser): void {
  fs.mkdirSync(STORE_DIR, { recursive: true });
  fs.writeFileSync(STORE_FILE, JSON.stringify(user, null, 2), 'utf-8');
}

/**
 * Returns the account created by the registration test. Falls back to the
 * credentials in .env so the login test can also be run on its own against a
 * permanent account.
 */
export function loadRegisteredUser(): Pick<TestUser, 'email' | 'password'> | null {
  if (fs.existsSync(STORE_FILE)) {
    const raw = fs.readFileSync(STORE_FILE, 'utf-8');
    return JSON.parse(raw) as TestUser;
  }

  const { EXISTING_USER_EMAIL, EXISTING_USER_PASSWORD } = process.env;
  if (EXISTING_USER_EMAIL && EXISTING_USER_PASSWORD) {
    return { email: EXISTING_USER_EMAIL, password: EXISTING_USER_PASSWORD };
  }

  return null;
}

export function clearRegisteredUser(): void {
  if (fs.existsSync(STORE_FILE)) {
    fs.rmSync(STORE_FILE);
  }
}
