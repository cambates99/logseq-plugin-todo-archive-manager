import "@logseq/libs";
import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin.user";

import React from "react";
import * as ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { logseq as PL } from "../package.json";

// @ts-expect-error
const css = (t, ...args) => String.raw(t, ...args);

const pluginId = PL.id;

const settingsSchema: SettingSchemaDesc[] = [
  {
    key: "hotkey",
    type: "string",
    default: "Ctrl+Shift+E",
    title: "Hotkey to insert emoji",
    description: "The hotkey to insert an emoji into the current block."
  }
  // ... You can define more settings here
];

async function main() {
  console.info(`#${pluginId}: MAIN`);
  const root = ReactDOM.createRoot(document.getElementById("app")!);

  // Use Logseq's API to load the settings schema
  logseq.useSettingsSchema(settingsSchema);

  // Wait for Logseq to provide the settings
  await logseq.ready();

  // Check if the settings have been loaded
  const hotkey = logseq.settings?.hotkey || 'Ctrl+Shift+E'; // Provide a default value

  // Register the command with the hotkey from the settings
  logseq.App.registerCommandPalette({
    key: 'insert-emoji',
    label: 'Insert an emoji',
    keybinding: {
      mode: 'global',
      binding: hotkey,
    },
  }, () => {
    // Insert the emoji at the current cursor location
    logseq.Editor.insertAtEditingCursor('😀');
  });

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  function createModel() {
    return {
      show() {
        logseq.showMainUI();
      },
    };
  }

  logseq.provideModel(createModel());
  logseq.setMainUIInlineStyle({
    zIndex: 11,
  });

  const openIconName = "template-plugin-open";

  logseq.provideStyle(css`
    .${openIconName} {
      opacity: 0.55;
      font-size: 20px;
      margin-top: 4px;
    }

    .${openIconName}:hover {
      opacity: 0.9;
    }
  `);

  logseq.App.registerUIItem("toolbar", {
    key: openIconName,
    template: `
      <div data-on-click="show" class="${openIconName}">⚙️</div>
    `,
  });
}

logseq.ready(main).catch(console.error);
