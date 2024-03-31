import { BlockEntity, IDatom } from '@logseq/libs/dist/LSPlugin';
import { Task, TaskPriority, TaskState } from './taskModel';

export enum OutlinerState {
  INSERT_BLOCKS = 'insert-blocks',
  SAVE_BLOCK = 'save-block',
  MOVE_BLOCKS = 'move-blocks',
}

export async function processOnChangedEvent(
  blocks: BlockEntity[],
  txData: IDatom[],
  txMeta?: { [key: string]: any; outlinerOp: string } | undefined
) {
  // Return if outlinerOp isn't in an expected state
  if (
    !txMeta ||
    !Object.values(OutlinerState).includes(txMeta.outlinerOp as OutlinerState)
  ) {
    return;
  }

  blockDebugLog(blocks, txMeta.outlinerOp);

  const taskStateBlocks = findTaskStateBlocks(blocks);
  if (taskStateBlocks.length == 0) {
    console.log('No Task found for this block');
    return;
  }
}

function findTaskStateBlocks(blocks: BlockEntity[]): Task[] {
  // Patterns for task states and priorities
  const taskStatePattern = Object.values(TaskState).join('|');
  const taskPriorityPattern = Object.keys(TaskPriority).join('|');
  const regexPattern = new RegExp(
    `^(#+\\s+)?(${taskStatePattern})\\s+(\\[#(${taskPriorityPattern})\\])?.*$`
  );

  const taskStateBlocks: Task[] = [];
  blocks.forEach((block, index) => {
    const match = regexPattern.exec(block.content);
    if (match) {
      const state = match[2] as TaskState;
      const priority = match[3] as TaskPriority | null;
      taskStateBlocks.push({ state: state, priority: priority });

      console.log(
        `Found a TaskState at index: ${index}, State: ${state}, Priority: ${priority}`
      );
    }
  });
  return taskStateBlocks;
}

function sortTasks(tasks: Task[]): Task[] {
  // Define the sorting logic based on your criteria
  // For example, if you're sorting by priority:
  tasks.sort((a, b) => {
    // Assuming that null priority comes last
    if (!a.priority && b.priority) return 1;
    if (a.priority && !b.priority) return -1;
    if (a.priority && b.priority) {
      // Compare the priorities directly if they're both non-null
      return a.priority.localeCompare(b.priority);
    }
    // If both priorities are null, keep the order as is
    return 0;
  });

  return tasks;
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
