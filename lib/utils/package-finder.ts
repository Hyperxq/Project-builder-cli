import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { logger } from './logger';

export function getLocalPackageUrl(packageName: string) {
  // Step 1: Get the current working directory
  const projectRoot = process.cwd();

  // Step 2: Check if `node_modules` exists locally
  const nodeModulesPath = join(projectRoot, 'node_modules');

  if (existsSync(nodeModulesPath)) {
    // Step 3: Check if the package is installed locally
    const packagePath = join(nodeModulesPath, packageName);
    if (existsSync(packagePath)) {
      return packagePath; // Return the local path to the package
    }
  }

  // Step 4: Check globally if not found locally
  const globalNodeModulesPath = getGlobalNodeModulesPath(packageName); // Implement this based on the environment
  const globalPackagePath = join(globalNodeModulesPath, packageName);
  if (existsSync(globalPackagePath)) {
    return globalPackagePath; // Return the global path to the package
  }

  // Step 5: Return null if the package is not found
  return null;
}

function getGlobalNodeModulesPath(packageName: string) {
  try {
    // Attempt to resolve the module path
    const resolvedPath = require.resolve(packageName, {
      paths: [globalNodeModulesPath()],
    });

    return resolvedPath;
  } catch {
    // If the module isn't found, return null or handle the error
    logger.error(`Module ${packageName} not found globally.`);

    return null;
  }
}

// Helper to determine the global node_modules path based on the current Node.js environment
function globalNodeModulesPath() {
  return execSync('npm root -g').toString().trim();
}
