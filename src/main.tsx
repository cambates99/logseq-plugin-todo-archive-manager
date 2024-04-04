import '@logseq/libs';
import {
  BlockEntity,
  BlockUUIDTuple,
  IDatom,
  SettingSchemaDesc,
} from '@logseq/libs/dist/LSPlugin.user';

import React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { logseq as PL } from '../package.json';
import { processOnChangedEvent } from './taskProcessor';

// @ts-expect-error this was in tempalte orignially
const css = (t, ...args) => String.raw(t, ...args);

const pluginId = PL.id;

const settingsSchema: SettingSchemaDesc[] = [
  {
    key: 'navigateToArchiveHotkey',
    type: 'object',
    default: 'ctrl+shift+e',
    title: 'Hotkey to navigate to Archive',
    description: 'The hotkey to navigate to your Archive page.',
  },
  // ... other settings
];

// async function handleBlockChange(currentBlockUuid: string) {

//   // get currentBlock's parent entity if exists
//   const parentBlockId = currentBlock.parent ? currentBlock.parent.id : currentBlock.id;
//   const parentBlock = await logseq.Editor.getBlock(parentBlockId);

//   if (parentBlock == null) { logseq.UI.showMsg('No Parent Found'); }
//   else
//     logseq.Editor.openInRightSidebar(currentBlock.uuid);
// }

async function main() {
  console.info(`#${pluginId}: MAIN`);
  const root = ReactDOM.createRoot(document.getElementById('app')!);

  // Use Logseq's API to load the settings schema
  logseq.useSettingsSchema(settingsSchema);

  // Wait for Logseq to provide the settings
  await logseq.ready();

  // Check if the settings have been loaded
  const pageLocation = 'TODO Archive';

  // Register the command with the hotkey from the settings to navigate to the page
  const navigateToArchiveHotkey = logseq.settings?.navigateToArchiveHotkey || {
    modifiers: ['ctrl', 'shift'],
    key: 'e',
  };

  const blockArray = [];

  logseq.DB.onChanged(e => {
    processOnChangedEvent(e.blocks, e.txData, e?.txMeta);
  });

  logseq.App.registerCommandPalette(
    {
      key: 'navigate-to-archive',
      label: 'Navigate to Archive',
      keybinding: {
        mode: 'global',
        binding: `${settingsSchema[0].default}`,
      },
    },
    async () => {
      // Get the current block being edited
      // const currentBlock = await logseq.Editor.getCurrentBlock();
      // if (currentBlock != null) {
      //   // Open the current block in the right sidebar
      //   if (currentBlock.parent != null) {
      //     const parentBlock = await logseq.Editor.getBlock(currentBlock.parent.id);
      //     logseq.Editor.openInRightSidebar(parentBlock ? parentBlock.uuid : 'error ');
      //   }
      //   else
      //     logseq.Editor.openInRightSidebar(currentBlock.uuid);
      // }
      // logseq.UI.showMsg(`Result: ${currentBlock?.parent} Id ${currentBlock?.parent.id}`);
      // const currentBlock = await logseq.Editor.getCurrentBlock();
      // console.log('uuid: ', currentBlock?.uuid);
      // console.log('content: ', currentBlock?.content);
    }
  );

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

  const openIconName = 'template-plugin-open';

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

  logseq.App.registerUIItem('toolbar', {
    key: openIconName,
    template: `
      <div data-on-click="show" class="${openIconName}">⚙️</div>
    `,
  });
}

logseq.ready(main).catch(console.error);
