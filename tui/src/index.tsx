import React from 'react';
import { render } from 'ink';
import { App } from './app.tsx';

if (!process.stdin.isTTY) {
  console.error('The status TUI needs an interactive terminal.');
  process.exit(1);
}

const ALT_SCREEN_ON = '\x1b[?1049h\x1b[H';
const ALT_SCREEN_OFF = '\x1b[?1049l';

process.stdout.write(ALT_SCREEN_ON);
const instance = render(<App />, { exitOnCtrlC: false });

const restore = () => process.stdout.write(ALT_SCREEN_OFF);
process.on('exit', restore);

await instance.waitUntilExit();
