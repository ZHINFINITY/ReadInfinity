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
});

