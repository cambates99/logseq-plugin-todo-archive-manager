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
  // Return if outlinerOp isn't in an expected state or an undo
  if (
    !txMeta ||
    txMeta["undo?"] ||
    !Object.values(OutlinerState).includes(txMeta.outlinerOp as OutlinerState)
  ) {
    return;
  }

  blockDebugLog(blocks, txMeta.outlinerOp);

  const taskStateBlocks = findTaskBlockStates(blocks);
  if (taskStateBlocks.length == 0) {
    console.log('No Task found for this block');
    return;
  }
  // TODO: add a 'DONE' check here and if true, move to 'TODO Archive' without sorting
  if (taskStateBlocks.length == 1) {
    sortTaskByPriority(taskStateBlocks[0]);
  }
}

function findTaskBlockStates(blocks: BlockEntity[]): Task[] {
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
      const priority = match[3] as TaskPriority;
      taskStateBlocks.push({ state: state, priority: priority, uuid: block.uuid, parentID: block.parent.id });

      console.log(
        `Found a TaskState at index: ${index}, State: ${state}, Priority: ${priority}`
      );
    }
  });
  return taskStateBlocks;
}

async function sortTaskByPriority(task: Task): Promise<void> {

  const parentBlock = await logseq.Editor.getBlock(task.parentID, { includeChildren: true })
  if (!parentBlock || !parentBlock.children) { return; }

  const blockEntitiesOnly = parentBlock.children.filter((child): child is BlockEntity => 'content' in child);
  const neighboringTaskBlocks = findTaskBlockStates(blockEntitiesOnly);
  const sortedTasks = neighboringTaskBlocks.sort(compareTasks);

  for (let i = 0; i < sortedTasks.length - 1; i++) {
    await logseq.Editor.moveBlock(
      sortedTasks[i].uuid,
      sortedTasks[i + 1].uuid,
      { before: true }
    );
  }
}

async function sortTasksByPriority(tasks: Task[]): Promise<void> {
  // First, group tasks by their parent ID to minimize the number of calls to logseq.Editor.getBlock
  // const tasksByParent: Record<string, Task[]> = {};
  // tasks.forEach((task) => {
  //   if (tasksByParent[task.parentID]) {
  //     tasksByParent[task.parentID].push(task);
  //   } else {
  //     tasksByParent[task.parentID] = [task];
  //   }
  // });
}

function compareTasks(a: Task, b: Task): number {

  const priorityOrder = {
    [TaskPriority.A]: 1,
    [TaskPriority.B]: 2,
    [TaskPriority.C]: 3,
    [TaskPriority.None]: 4
  };

  // Compare by priority first
  const priorityCompare = priorityOrder[a.priority] - priorityOrder[b.priority];
  if (priorityCompare !== 0) return priorityCompare;

  // If priorities are the same, compare by state
  const stateOrder = {
    [TaskState.TODO]: 1,
    [TaskState.DOING]: 2,
    [TaskState.DONE]: 3,
  };

  return stateOrder[a.state] - stateOrder[b.state];
}

function blockDebugLog(blocks: BlockEntity[], state: string) {
  console.log('------------------------------------------------------------');
  console.log(`Total blocks received: ${blocks.length}, State: ${state}`);
  blocks.forEach((block, index) => {
    console.log(`Block index: ${index}, UUID: ${block.uuid}`);
    console.log(`Content: ${block.content}`);

    if (block.children && block.children.length > 0) {
      console.log(`\tThis block has children: ${block.children.length}`);
    }
  });
}
