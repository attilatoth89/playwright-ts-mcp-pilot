# Playwright MCP server in VS Code

The Playwright MCP server lets an AI assistant drive a real browser: it can open
a page, read the accessibility tree, click elements and report back what it
found. For test automation this matters because the assistant no longer guesses
selectors from a screenshot or from memory - it reads them from the live DOM.

## Prerequisites

- VS Code 1.102 or newer (MCP support is built in from that version)
- Node.js 18+
- GitHub Copilot Chat in agent mode, or another MCP-capable assistant

## Configuration

This repository already contains `.vscode/mcp.json`:

```json
{
  "servers": {
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

Because the file is committed, anyone who clones the repository gets the same
setup. `npx` downloads the server on first use, so there is nothing to install
by hand.

## Starting it

1. Open the repository in VS Code.
2. Open `.vscode/mcp.json` and click **Start** above the `playwright` entry, or
   run **MCP: List Servers** from the command palette and start it there.
3. Open Copilot Chat and switch to **Agent** mode.
4. Click the tools icon and confirm that the Playwright tools are listed.

## What it is used for in this project

The registration form has fields whose ids are not visible from the outside.
Instead of guessing, the assistant was asked to open the page and report the
actual attributes:

> Open https://rahulshettyacademy.com/client/#/auth/register and list every
> form field with its id, name and type.

The page objects in `pages/` were then written from that output. The same
workflow is useful when a test breaks: the assistant opens the page, compares
the current DOM with the locator in the code and points at the element that was
renamed.

## Where the boundary is

The server gives the assistant eyes, not judgement. It can report that a button
exists and that clicking it changes the URL. It cannot decide whether that URL
is the correct one, which edge cases are worth covering, or whether an assertion
actually proves anything. Those decisions stayed with the engineer in this
project, and the generated code was reviewed line by line before it was
committed - see the findings section in the main README.

## Alternative: Playwright codegen

For recording a flow without an assistant:

```bash
npm run codegen
```

This opens a browser, records the interactions and writes the matching
Playwright code. Useful for discovering selectors quickly, but the generated
code needs restructuring before it belongs in a test suite - it produces flat
scripts with brittle locators and no assertions.
