import * as React from 'react';
import { PiBooks } from 'react-icons/pi';

import { useEnv } from '@/context/EnvContext';
import { useTranslation } from '@/hooks/useTranslation';

interface LibraryEmptyStateProps {
  onImport: (anchor: HTMLElement) => void;
}

const LibraryEmptyState: React.FC<LibraryEmptyStateProps> = ({ onImport }) => {
  const _ = useTranslation();
  const { appService } = useEnv();
  const isMobile = appService?.isMobile ?? false;

  return (
    <div className='hero-content text-neutral-content text-center'>
      <div className='flex max-w-md flex-col items-center'>
        <PiBooks aria-hidden className='text-base-content/60 mb-10 size-16' />
        <h1 className='mb-5 text-balance text-4xl font-semibold leading-tight tracking-tight'>
          {_('Start your library')}
        </h1>
        <p className='text-base-content/70 mb-12 text-pretty text-base leading-relaxed'>
          {isMobile
            ? _('ReadInfinity scans your device for books automatically.')
            : _('ReadInfinity scans your book folders automatically, or you can open a book manually.')}
        </p>
        <div className='flex w-full max-w-xs flex-col gap-3'>
          <button
            type='button'
            aria-haspopup='menu'
            className='btn btn-primary h-11 min-h-11 rounded-lg'
            onClick={(event) => onImport(event.currentTarget)}
          >
            {_('Open a Book')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LibraryEmptyState;
