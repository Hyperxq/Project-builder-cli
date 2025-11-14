import Conf from 'conf';

export const builderConfig = new Conf({ projectName: '@pbuilder/cli' });

// helpers
export function getConfig(key?: string) {
  if (key) {
    return builderConfig.get(key)
  };
  return builderConfig.store;
}

export function setConfig(key: string, value: any) {
  builderConfig.set(key, value);
}

export function deleteConfig(key: string) {
  builderConfig.delete(key);
}