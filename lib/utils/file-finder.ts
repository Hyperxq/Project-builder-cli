/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import axios from 'axios';
import { existsSync } from 'fs';
import { isAbsolute, join } from 'path';
import { logger } from './logger';

// Utility to get a file based on package name and file name (with or without internal path)
export async function getPackageFile<T = any>(
  packageName: string,
  fileName: string = '',
  remotePackageUrl?: string,
): Promise<T | undefined> {
  // Step 1: Check if packageName is a local path
  if (isLocalPath(packageName)) {
    const localFilePath = join(process.cwd(), packageName, fileName);
    if (existsSync(localFilePath)) {
      return require(localFilePath);
    } else {
      logger.error(`Local file not found: ${localFilePath}`);

      return undefined;
    }
  }

  // Step 2: Try to get the file locally or globally
  const filePath = getLocalPackageFilePath(packageName, fileName);
  if (filePath && existsSync(filePath)) {
    // If the file exists locally/globally, read and return it
    return require(filePath);
  }

  // Step 3: If not found locally/globally, attempt to fetch it from a remote URL
  const url =
    remotePackageUrl || `https://unpkg.com/${packageName}/${fileName}`;
  try {
    const response = await axios.get(url);

    return response.data;
  } catch (error) {
    logger.error(
      `Failed to fetch ${fileName} for ${packageName} from ${url}:`,
      error,
    );

    return null;
  }
}

// Helper function to determine if the package name is a local path
function isLocalPath(packageName: string): boolean {
  return (
    packageName.startsWith('./') ||
    packageName.startsWith('../') ||
    isAbsolute(packageName)
  );
}

// Reusing the utility function to get the local or global path to the file
function getLocalPackageFilePath(packageName: string, fileName: string) {
  const packagePath = getLocalPackageUrl(packageName);
  if (packagePath) {
    return join(packagePath, fileName);
  }

  return null;
}

// Utility to find local or global package path
function getLocalPackageUrl(packageName: string) {
  const projectRoot = process.cwd();
  const nodeModulesPath = join(projectRoot, 'node_modules');

  if (existsSync(nodeModulesPath)) {
    const packagePath = join(nodeModulesPath, packageName);
    if (existsSync(packagePath)) {
      return packagePath;
    }
  }

  const globalNodeModulesPath = getGlobalNodeModulesPath();
  const globalPackagePath = join(globalNodeModulesPath, packageName);
  if (existsSync(globalPackagePath)) {
    return globalPackagePath;
  }

  return null;
}

function getGlobalNodeModulesPath() {
  const { execSync } = require('child_process');

  return execSync('npm root -g').toString().trim();
}
