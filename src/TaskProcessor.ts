import { BlockEntity, IDatom } from "@logseq/libs/dist/LSPlugin";


enum TaskState {
    TODO = 'TODO',
    DOING = 'DOING',
    DONE = 'DONE',
    // LATER = 'LATER',
    // NOW = 'NOW',
    // WAITING = 'WAITING',
    // CANCELED = 'CANCELED'
}

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
        findIndexOfTaskStateBlock(blocks);
        break;
      case 'save-block':
        // Logic for save-block, including getBlock if it's a new TODO
        blockDebugLog(blocks, txMeta.outlinerOp);
        findIndexOfTaskStateBlock(blocks);
        break;
      case 'move-blocks':
        // Logic for move-blocks
        blockDebugLog(blocks, txMeta.outlinerOp);
        findIndexOfTaskStateBlock(blocks);
        break;
      default:
        return;
    }
  
}

function findIndexOfTaskStateBlock(blocks: BlockEntity[]){
    const taskStates = Object.values(TaskState).join('|');
    const regexPattern = new RegExp(`^(#+\\s+)?(${taskStates})\\s`);

    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    blocks.forEach((block, index) => {
        if(block.content && regexPattern.test(block.content)) {
            console.log(`Found a TaskState at index: ${index}, Content: ${block.content}`);
        }
    });

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