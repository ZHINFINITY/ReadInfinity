'use client';

import React from 'react';

import Dialog from '@/components/Dialog';
import {
  useDictionaryResults,
  DictionaryResultsHeader,
  DictionaryResultsBody,
} from './DictionaryResultsView';

interface DictionarySheetProps {
  word: string;
  lang?: string;
  onDismiss: () => void;
  onManage?: () => void;
}

const DictionarySheet: React.FC<DictionarySheetProps> = ({ word, lang, onDismiss, onManage }) => {
  const state = useDictionaryResults({ word, lang });
  return (
    <Dialog
      isOpen
      snapHeight={0.75}
      dismissible
      header={
        <DictionaryResultsHeader
          // The -mt-4 compensates for Dialog's drag handle, which is `sm:hidden`
          // (shown only below sm). Mirror that breakpoint so on sm+ (no handle)
          // the header isn't pulled up into the top edge.
          headerClassName='-mt-4 sm:mt-0'
          currentWord={state.currentWord}
          canGoBack={state.canGoBack}
          goBack={state.goBack}
          onManage={onManage}
          onSpeak={state.speakWord}
          speaking={state.isSpeaking}
        />
      }
      // The sheet body owns the scroll area; leaving Dialog's outer content
      // scroller active creates a nested flex/overflow layout that can paint
      // the first provider and leave the lower viewport empty on Android.
      contentClassName='!mt-0 !flex !min-h-0 !flex-1 !flex-col !overflow-hidden !px-0'
      onClose={onDismiss}
    >
      <div className='flex min-h-0 flex-1 flex-col' style={{ touchAction: 'pan-y' }}>
        <DictionaryResultsBody {...state} />
      </div>
    </Dialog>
  );
};

export default DictionarySheet;
