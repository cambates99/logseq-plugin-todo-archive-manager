import { BlockEntity, IDatom } from "@logseq/libs/dist/LSPlugin";
import { Task, TaskPriority, TaskState } from "./taskModel";


// TODO: Add Doing and Done valdiation; TODO: Maybe check the beggning of the line to help performance?
export async function processOnChangedEvent({ blocks, txData, txMeta }: {
    blocks: BlockEntity[];
    txData: IDatom[];
    txMeta?: { [key: string]: any; outlinerOp: string; } | undefined;
  }) {
    // Return if outlinerOp doesnt exist
  if (!txMeta || !txMeta.outlinerOp) return;

  switch (txMeta.outlinerOp) {
    case 'insert-blocks':
      // Logic for insert-blocks
      blockDebugLog(blocks, txMeta.outlinerOp);
      findTaskStateBlocks(blocks);
      break;
    case 'save-block':
      // Logic for save-block, including getBlock if it's a new TODO
      blockDebugLog(blocks, txMeta.outlinerOp);
      findTaskStateBlocks(blocks);
      break;
    case 'move-blocks':
      // Logic for move-blocks
      blockDebugLog(blocks, txMeta.outlinerOp);
      findTaskStateBlocks(blocks);
      break;
    default:
      return;
  }
}

function findTaskStateBlocks(blocks: BlockEntity[]): Task[] {
  const taskStatePattern = Object.values(TaskState).join('|');
  const taskPriorityPattern = Object.keys(TaskPriority).join('|');
  const regexPattern = new RegExp(`^(#+\\s+)?(${taskStatePattern})\\s+(\\[#(${taskPriorityPattern})\\])?.*$`);


  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  const taskStateBlocks: Task[] = [];
  blocks.forEach((block, index) => {
      if(block.content) {
        const match = regexPattern.exec(block.content)

        if (match) {
          const state = match[2] as TaskState;
          const priority = match[3] as TaskPriority | null;
          console.log(`Found a TaskState at index: ${index}, State: ${state}, Priority: ${priority}`);

          taskStateBlocks.push({
            state: state,
            priority: priority
          });
        }
    }
  });
  return taskStateBlocks;
}

function blockDebugLog(blocks: BlockEntity[], state: string) {
    
  console.log('------------------------------------------------------------');
  console.log(`Total blocks received: ${blocks.length}, State: ${state}`);
  blocks.forEach((block, index) => {
    console.log(`Block index: ${index}, UUID: ${block.uuid}`);
    console.log(`Content: ${block.content}`);

    if (block.children && block.children.length > 0) {
      console.log(`This block has children: ${block.children.length}`);
    }
  });
}