import { describe, expect, it, vi } from 'vitest';
import type { FileSystem } from '@/types/system';
import { loadDictionariesFromFolder } from '@/services/dictionaries/dictionaryService';

describe('loadDictionariesFromFolder', () => {
  it('registers an MDX bundle without opening the large MDX payload', async () => {
    const readDir = vi.fn().mockResolvedValue([
      { path: 'nested/Long Dictionary.mdx', size: 900_000_000 },
      { path: 'nested/Long Dictionary.mdd', size: 120_000_000 },
    ]);
    const openFile = vi.fn();
    const fs = { readDir, openFile } as unknown as FileSystem;

    const result = await loadDictionariesFromFolder(fs, '/storage/emulated/0/Dictionaries');

    expect(result.imported).toHaveLength(1);
    expect(result.imported[0]).toMatchObject({
      kind: 'mdict',
      name: 'long dictionary',
      externalRoot: '/storage/emulated/0/Dictionaries',
      files: {
        mdx: 'nested/Long Dictionary.mdx',
        mdd: ['nested/Long Dictionary.mdd'],
      },
    });
    expect(openFile).not.toHaveBeenCalled();
    expect(readDir).toHaveBeenCalledWith(
      '/storage/emulated/0/Dictionaries',
      'None',
      expect.arrayContaining(['mdx', 'mdd']),
    );
  });

  it('discovers multiple nested bundles from one selected folder', async () => {
    const readDir = vi.fn().mockResolvedValue([
      { path: 'english/English.mdx', size: 900_000_000 },
      { path: 'english/English.mdd', size: 120_000_000 },
      { path: 'french/French.mdx', size: 800_000_000 },
      { path: 'french/French.mdd', size: 100_000_000 },
    ]);
    const openFile = vi.fn();
    const fs = { readDir, openFile } as unknown as FileSystem;

    const result = await loadDictionariesFromFolder(fs, '/storage/emulated/0/Dictionaries');

    expect(result.imported).toHaveLength(2);
    expect(result.imported.map((dict) => dict.files.mdx)).toEqual([
      'english/English.mdx',
      'french/French.mdx',
    ]);
    expect(result.orphanFiles).toEqual([]);
    expect(openFile).not.toHaveBeenCalled();
  });

  it('discovers a complete StarDict bundle in a nested folder without opening payload files', async () => {
    const readDir = vi.fn().mockResolvedValue([
      { path: 'languages/English/English.ifo', size: 180 },
      { path: 'languages/English/English.idx', size: 12_000_000 },
      { path: 'languages/English/English.dict', size: 800_000_000 },
    ]);
    const ifo = new File(['bookname=Nested English\nlang=en\n'], 'English.ifo');
    const openFile = vi.fn().mockImplementation((path: string) => {
      if (path.endsWith('.ifo')) return Promise.resolve(ifo);
      return Promise.reject(new Error(`payload must not be opened: ${path}`));
    });
    const fs = { readDir, openFile } as unknown as FileSystem;

    const result = await loadDictionariesFromFolder(fs, '/storage/emulated/0/Dictionaries');

    expect(result.imported).toHaveLength(1);
    expect(result.imported[0]).toMatchObject({
      kind: 'stardict',
      name: 'Nested English',
      externalRoot: '/storage/emulated/0/Dictionaries',
      files: {
        ifo: 'languages/English/English.ifo',
        idx: 'languages/English/English.idx',
        dict: 'languages/English/English.dict',
      },
    });
    expect(openFile).toHaveBeenCalledTimes(1);
    expect(openFile).toHaveBeenCalledWith(
      '/storage/emulated/0/Dictionaries/languages/English/English.ifo',
      'None',
    );
  });
});
