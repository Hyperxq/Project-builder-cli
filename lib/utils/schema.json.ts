/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Schematic, Schematics } from '../../actions/actions.interfaces';
import { fetchData } from './fetch-data';

export async function getSchemaFromPackage(
  urlBase: string,
  collectionName: string,
  schematicName: string,
  isLocal: boolean = true,
) {
  // 1. Determine if the project has `node_modules` in the current working directory.
  // 2. If `node_modules` exists, check if the collection/package is installed locally.
  // 3. If the package is not installed locally, check if it is installed globally.
  // 4. If the package is not found locally or globally, fetch it from a remote URL (defaulting to `https://unpkg.com/`).
  // 5. Once the package is located, read the `package.json` from the appropriate source (local, global, or remote).
  // 6. Extract the collection path from `package.json` to locate the collection file.
  // 7. Read the collection file to gather information about available schematics.
  // 8. Identify the specific schematic you need to process.
  // 9. Extract the path to the `schema.json` for the selected schematic.
  // 10. Read the `schema.json` file to obtain the schema details.
}

async function callUrl(url, isLocal: boolean = false) {
  if (isLocal) {
    return await fetchData(url);
  } else {
    return require.resolve(url);
  }
}

function findSchematicByAlias(
  schematics: Schematics,
  alias: string,
): Schematic | undefined {
  const [schematicName, schematic] =
    Object.entries(schematics).find(([schematicName, schematic]) =>
      (schematic?.aliases ?? []).some((x) => x === alias),
    ) ?? [];

  const response = schematic ? schematics[schematicName] : undefined;
  if (response) {
    response.schematicName = schematicName;
  }

  return response;
}
