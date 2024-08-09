/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import axios from 'axios';
import { existsSync } from 'fs';
import { join } from 'path';

// Utility to get a file based on package name and file name (with or without internal path)
export async function getPackageFile(
  packageName: string,
  fileName: string,
  remotePackageUrl?: string,
): Promise<any> {
  // Step 1: Try to get the file locally or globally
  const filePath = getLocalPackageFilePath(packageName, fileName);

  if (filePath && existsSync(filePath)) {
    // Step 2: If the file exists locally/globally, read and return it
    const fileContent = require(filePath);

    return fileContent;
  }

  // Step 3: If not found locally/globally, attempt to fetch it from a remote URL
  const url =
    remotePackageUrl || `https://unpkg.com/${packageName}/${fileName}`;

  try {
    const response = await axios.get(url);

    return response.data;
  } catch (error) {
    console.error(
      `Failed to fetch ${fileName} for ${packageName} from ${url}:`,
      error,
    );

    return null;
  }
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
