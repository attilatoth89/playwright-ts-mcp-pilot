# Playwright + TypeScript E2E demo: registration and login

End-to-end tests for the registration and login flow of
[rahulshettyacademy.com/client](https://rahulshettyacademy.com/client/), a
publicly available practice application.

Status: 4 tests, all passing against the live application (Chromium).

The repository has two purposes. The first is to show how I structure a test
suite: page objects, generated test data, chained projects, CI. The second is to
document a small experiment - how far an AI assistant gets on its own when it
builds a test framework from zero, and where a human still has to make the call.

## Stack

| | |
|---|---|
| Test runner | Playwright Test 1.62 |
| Language | TypeScript 5.7 (strict mode) |
| Structure | Page Object Model |
| CI | GitHub Actions, nightly schedule |
| AI tooling | Playwright MCP server in VS Code |

## Getting started

```bash
npm install
npx playwright install --with-deps chromium
npm test
```

Useful variations:

```bash
npm run test:headed   # watch the browser while it runs
npm run test:ui       # interactive UI mode, time-travel through steps
npm run test:debug    # step-by-step debugging
npm run report        # open the HTML report of the last run
npm run typecheck     # TypeScript check without running tests
```

## Test cases

| Project | Test | What it verifies |
|---|---|---|
| `register` | a new user can register | The happy path from the login page to the confirmation message |
| `register` | mismatched passwords are rejected | No account is created and the user stays on the form |
| `login` | the newly registered user can log in | The account created above reaches the dashboard |
| `login` | login fails with a wrong password | No dashboard access with wrong credentials |

## How the two flows are connected

Logging in requires an account that already exists. Rather than hardcoding
credentials, the login test uses the account the registration test just created.

Playwright's project dependencies handle the ordering:

```ts
{
  name: 'login',
  testMatch: /login\.spec\.ts/,
  dependencies: ['register'],
}
```

The `login` project only starts if `register` passed, so a login failure is
never caused by a broken registration - the run stops before it gets there. The
account itself travels through a small JSON file written by `utils/userStore.ts`,
because the two projects run in separate worker processes and cannot share
memory. If the file is missing, the login test falls back to the credentials in
`.env`, or skips with an explicit reason instead of failing on an empty field.

Registration only succeeds once per email address, so `utils/testData.ts`
generates a unique address for every run. Without that, the suite would pass
once and fail forever after.

## Project layout

```
pages/          Page objects - all locators live here
  LoginPage.ts
  RegisterPage.ts
  DashboardPage.ts
tests/
  register.spec.ts
  login.spec.ts
utils/
  testData.ts   Generates a unique user per run
  userStore.ts  Hands the account from one project to the next
docs/
  MCP-SETUP.md  Playwright MCP server setup for VS Code
```

## A note on the assertions

`expect(page).toHaveURL(/dashboard/)` on its own is a weak assertion: the URL can
change while the page renders nothing. `DashboardPage.expectLoggedIn()`
therefore checks three independent signals - the URL, a visible sign-out control
and rendered product data. A test that cannot fail for the right reason is worse
than no test, because it reports safety that is not there.

The negative cases exist for the same reason. A suite that only covers happy
paths passes just as happily when validation has been removed entirely.

## The experiment: how much can the AI do on its own?

I ran this as a four-week pilot, one to two hours a day, with the Playwright MCP
server connected to VS Code. The question was whether an assistant can build a
working test framework from prompts alone - from the folder structure to a
passing test - and where the limit is.

**What worked well.** Scaffolding was fast and largely correct: config,
tsconfig, folder structure, page object skeletons, CI workflow. Reading the live
page through the MCP server was a real improvement over guessing selectors, and
turning a recorded flow into page objects was reliable.

**Where it needed a human.** Every locator that failed is worth looking at,
because none of them failed for the reason I expected.

*A plausible id that does not exist.* The occupation dropdown was addressed as
`#occupation`. It is the obvious guess, it reads perfectly in review, and the
element simply has no id. Only opening the DOM revealed that the page contains
exactly one `<select>`.

*Incomplete discovery, not incorrect generation.* Asked to list the form fields,
the assistant returned a table with `id`, `name` and `type` - and the submit
button appeared to have no usable identifier. Acting on that would have replaced
a locator that was already correct. A second, more specific question ("give me
the value attribute as well") showed that `input[value="Register"]` worked all
along. The failure was in the depth of the investigation, not in the code.

*A best-practice locator that is wrong on this page.* `getByRole('link', { name:
/register here/i })` is exactly what the Playwright documentation recommends. It
timed out, because the element is an `<a>` without an `href`, and the browser
therefore does not expose it with the `link` role. This is the most instructive
failure of the three: the code was not sloppy, it was a textbook pattern applied
to a page where an accessibility detail invalidates it - and no amount of
reading the code would have revealed that. Only running it did.

*Test data that only works once.* Without being told, the assistant hardcoded an
email address. Registration succeeds once per address, so the suite would have
gone green on the first run and red on every run afterwards.

*Missing negative cases.* The happy path came first try. The mismatched-password
and wrong-password cases were only added when I asked for them.

**Conclusion.** The assistant took over most of the typing and a good part of
the reading, and it was clearly faster than working alone. What it did not take
over is deciding what is worth testing, and whether a green test means anything.

The recurring pattern is that AI-generated tests do not fail loudly. They fail
by being fluent: correct-looking selectors for elements that do not exist,
recommended patterns applied where they do not hold, assertions that pass for
the wrong reason. Reviewing this output turned out to be a distinct skill from
writing it, and code review alone was not enough - three of the issues above
only surfaced on the first real run against the live application.

## Known limitations

The application under test is a shared public practice site. It is occasionally
slow or unavailable, and its data is reset from time to time, so a failing
nightly run is not always a defect in the tests. The suite runs on Chromium
only; adding Firefox and WebKit is a config change, kept out here to keep the
run fast.
