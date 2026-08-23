import clsx from 'clsx';
import { IoFileTray } from 'react-icons/io5';
import { useTranslation } from '@/hooks/useTranslation';
import MenuItem from '@/components/MenuItem';
import Menu from '@/components/Menu';

export interface ImportMenuProps {
  menuClassName?: string;
  setIsDropdownOpen?: (open: boolean) => void;
  onImportBooksFromFiles: () => void;
  onImportBooksFromDirectory?: () => void;
  /** Retained for shared callers; offline mode intentionally ignores it. */
  onImportBookFromUrl?: () => void;
  onImportBookFromNovelUrl?: () => void;
  onOpenCatalogManager?: () => void;
  onOpenFeeds?: () => void;
}

const ImportMenu: React.FC<ImportMenuProps> = ({
  menuClassName,
  setIsDropdownOpen,
  onImportBooksFromFiles,
  onImportBooksFromDirectory,
}) => {
  const _ = useTranslation();

  const handleImportFromFiles = () => {
    onImportBooksFromFiles();
    setIsDropdownOpen?.(false);
  };

  const handleImportFromDirectory = () => {
    onImportBooksFromDirectory?.();
    setIsDropdownOpen?.(false);
  };

  return (
    <Menu
      className={clsx(
        'dropdown-content bg-base-100 rounded-box !relative z-[1] mt-3 p-2 shadow',
        menuClassName,
      )}
      onCancel={() => setIsDropdownOpen?.(false)}
    >
      <MenuItem
        label={_('Open Local File')}
        Icon={<IoFileTray className='h-5 w-5' />}
        onClick={handleImportFromFiles}
      />
      {onImportBooksFromDirectory && (
        <MenuItem
          label={_('Open Device Folder')}
          Icon={<IoFileTray className='h-5 w-5' />}
          onClick={handleImportFromDirectory}
        />
      )}
    </Menu>
  );
};

export default ImportMenu;
