/**
 * Test data generation.
 *
 * Registration can only succeed once per email address, so every run needs a
 * fresh, unique user. The timestamp keeps the address unique without pulling in
 * an external faker dependency.
 */

export type Gender = 'Male' | 'Female';

export interface TestUser {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  occupation: string;
  gender: Gender;
  password: string;
}

/** Digits only, 10 characters - the application rejects shorter numbers. */
function randomPhoneNumber(): string {
  const suffix = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, '0');
  return `7000${suffix}`;
}

/**
 * The password must contain an uppercase letter, a lowercase letter, a digit
 * and a special character, otherwise the form shows a validation error.
 */
const DEFAULT_PASSWORD = 'Portfolio@2026';

export function generateUser(overrides: Partial<TestUser> = {}): TestUser {
  const timestamp = Date.now();

  return {
    firstName: 'Attila',
    lastName: 'Test',
    email: `qa.automation.${timestamp}@example.com`,
    phone: randomPhoneNumber(),
    occupation: 'Engineer',
    gender: 'Male',
    password: DEFAULT_PASSWORD,
    ...overrides,
  };
}
