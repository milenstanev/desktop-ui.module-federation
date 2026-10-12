# Debugging Guide

This guide covers debugging the Desktop UI application in WebStorm, VS Code.

---

## WebStorm Debugging

### Debug React App

1. Open WebStorm
2. Select **Debug React App** from the run configurations dropdown
3. Click the debug button (bug icon)
4. WebStorm will start the dev server and attach the debugger
5. Set breakpoints in your `.tsx`/`.ts` files
6. Interact with the app in the browser - execution will pause at breakpoints

### Debug Unit Tests

1. Select **Debug Unit Tests** from the run configurations dropdown
2. Click the debug button
3. Set breakpoints in test files or source files
4. Tests will run and pause at breakpoints

### Debug E2E Tests

1. Select **Debug E2E Tests** from the run configurations dropdown
2. Click the debug button
3. Playwright tests will run with debugging enabled

### Debug Single Test File

1. Right-click on any test file
2. Select **Debug 'filename'**
3. WebStorm will run only that test file with debugging

---

## VS Code / VS Code Debugging

### Debug React App (Chrome)

1. Open VS Code
2. Press `F5` or go to Run > Start Debugging
3. Select **Debug React App (Chrome)** from the dropdown
4. The dev server will start and Chrome will open
5. Set breakpoints in your `.tsx`/`.ts` files
6. Interact with the app - execution will pause at breakpoints

### Debug React App (Edge)

Same as Chrome but uses Microsoft Edge browser.

### Attach to Running Chrome

If you already have the app running:

1. Start Chrome with remote debugging:
   ```bash
   # macOS
   /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
   
   # Windows
   chrome.exe --remote-debugging-port=9222
   
   # Linux
   google-chrome --remote-debugging-port=9222
   ```

2. Start the dev server:
   ```bash
   npm start
   ```

3. In VS Code, select **Attach to Chrome** and press `F5`

### Debug Unit Tests

1. Select **Debug Unit Tests** from the debug dropdown
2. Press `F5`
3. Tests will run with debugging enabled
4. Set breakpoints in test files or source code

### Debug E2E Tests

1. Select **Debug E2E Tests (Playwright)** from the debug dropdown
2. Press `F5`
3. Playwright will run in debug mode with inspector UI

### Debug Current E2E Test File

1. Open an E2E test file (`.spec.ts`)
2. Select **Debug Current E2E Test** from the debug dropdown
3. Press `F5`
4. Only the current test file will run in debug mode

---

## Breakpoint Tips

### Setting Breakpoints

- Click in the gutter (left of line numbers) to set a breakpoint
- Red dot = active breakpoint
- Gray dot = disabled breakpoint

### Conditional Breakpoints

- Right-click on a breakpoint
- Select **Edit Breakpoint**
- Add a condition (e.g., `windowId === 'counter-1'`)
- Breakpoint only triggers when condition is true

### Logpoints

- Right-click in gutter
- Select **Add Logpoint**
- Enter expression to log (e.g., `windowId: ${windowId}`)
- No need to add `console.log()` to code

---

## Common Debugging Scenarios

### Debug Window Component

1. Set breakpoint in `src/components/Window/Window.tsx`
2. Start debugging
3. Add a window in the app
4. Debugger pauses when window renders

### Debug Redux Action

1. Set breakpoint in `src/features/Desktop/DesktopSlice.ts`
2. Start debugging
3. Trigger action (e.g., add window)
4. Debugger pauses in reducer

### Debug Form Validation

1. Set breakpoint in `src/features/FormEditor/FormEditor.tsx`
2. Start debugging
3. Submit form with invalid data
4. Debugger pauses in validation logic

### Debug E2E Test Failure

1. Open failing test file
2. Set breakpoint before failing assertion
3. Run **Debug Current E2E Test**
4. Inspect page state when paused

---

## Troubleshooting

### Breakpoints Not Working

**Check source maps are enabled:**
- WebStorm: Settings > Build, Execution, Deployment > Debugger > JavaScript > Enable source maps
- VS Code: Source maps are enabled by default

**Verify dev server is running:**
```bash
npm start
```

**Clear browser cache:**
- Hard refresh: `Cmd+Shift+R` (macOS) or `Ctrl+Shift+R` (Windows/Linux)

### Debugger Not Attaching

**WebStorm:**
- Check that port 3000 is not blocked
- Restart WebStorm
- Invalidate caches: File > Invalidate Caches / Restart

**VS Code:**
- Check Chrome is not already running with debugging
- Kill all Chrome processes and try again
- Check `.vscode/launch.json` exists

### Source Maps Not Loading

**Check webpack config:**
- Source maps are generated in development mode by default
- File: `config-overrides.js`

**Verify build:**
```bash
npm run build
```

Should generate `.map` files in `build/static/js/`

---

## Debug Configuration Files

### WebStorm

Configurations stored in:
- `.idea/runConfigurations/Debug_React_App.xml`
- `.idea/runConfigurations/Debug_Unit_Tests.xml`
- `.idea/runConfigurations/Debug_E2E_Tests.xml`

### VS Code / VS Code

Configurations stored in:
- `.vscode/launch.json` - Debug configurations
- `.vscode/tasks.json` - Build tasks
- `.vscode/extensions.json` - Recommended extensions

---

## Keyboard Shortcuts

### WebStorm

- `Cmd+Shift+D` / `Ctrl+Shift+D` - Debug
- `F8` - Step over
- `F7` - Step into
- `Shift+F8` - Step out
- `Cmd+F8` / `Ctrl+F8` - Toggle breakpoint
- `F9` - Resume program

### VS Code / VS Code

- `F5` - Start debugging / Continue
- `F10` - Step over
- `F11` - Step into
- `Shift+F11` - Step out
- `F9` - Toggle breakpoint
- `Shift+F5` - Stop debugging

---

## Additional Resources

- [WebStorm Debugging Guide](https://www.jetbrains.com/help/webstorm/debugging-javascript-in-chrome.html)
- [VS Code Debugging Guide](https://code.visualstudio.com/docs/editor/debugging)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)
