import { existsSync } from 'fs';
import { join, resolve } from 'path';

export function getRelativePath(currentPath: string = process.cwd()) {
  const projectRoot = findProjectRoot() ?? process.cwd();

  return currentPath.replace(projectRoot, '') || '/';
}

export function findProjectRoot(
  startPath: string = process.cwd(),
  fileToFind: string = 'package.json',
) {
  if (existsSync(join(startPath, fileToFind))) {
    return startPath;
  }
  if (resolve(startPath, '..') === startPath) {
    throw new Error('Project root not found');
  }

  return findProjectRoot(resolve(startPath, '..'));
}
