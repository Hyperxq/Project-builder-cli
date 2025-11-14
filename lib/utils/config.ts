import Conf from 'conf';
import fs from 'fs';
import path from 'path';

const globalStore = new Conf({ projectName: 'builder-cli' });

const LOCAL_CONFIG_FILENAME = 'builder.config.json';

const DEFAULT_CONFIG = {
  cli: {
    showBanner: true,
  },
};

export function loadEffectiveConfig(): Record<string, any> {
  const local = loadLocalConfig();
  if (Object.keys(local).length > 0) {
    return local;
  }

  const global = globalStore.store;
  if (Object.keys(global).length > 0) {
    return global;
  }

  // Store default config globally (first run)
  for (const [key, value] of Object.entries(DEFAULT_CONFIG)) {
    globalStore.set(key, value);
  }

  return DEFAULT_CONFIG;
}

// Utility: load and parse local config file
function loadLocalConfig(): Record<string, any> {
  const localPath = path.resolve(process.cwd(), LOCAL_CONFIG_FILENAME);
  if (fs.existsSync(localPath)) {
    try {
      const raw = fs.readFileSync(localPath, 'utf-8');
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to parse local config:', e);
    }
  }
  return {};
}

// Utility: resolve dot-notated key (e.g., cli.packageManager)
function resolveKeyPath(obj: any, key: string): any {
  return key.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
}

// Getter
export function getConfig(key?: string, global = true): any {
  const local = loadLocalConfig();
  if (!key) {
    return global ? globalStore.store : local;
  }

  return global ? globalStore.get(key) : resolveKeyPath(local, key);
}

// Setter
export function setConfig(key: string, value: any, global = true): void {
  if (global) {
    globalStore.set(key, value);
  } else {
    const localPath = path.resolve(process.cwd(), LOCAL_CONFIG_FILENAME);
    const local = loadLocalConfig();
    const keys = key.split('.');
    let current = local;

    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = current[keys[i]] || {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;

    fs.writeFileSync(localPath, JSON.stringify(local, null, 2), 'utf-8');
  }
}

// Delete
export function deleteConfig(key: string, global = true): void {
  if (global) {
    globalStore.delete(key);
  } else {
    const localPath = path.resolve(process.cwd(), LOCAL_CONFIG_FILENAME);
    const local = loadLocalConfig();
    const keys = key.split('.');
    let current = local;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        return;
      }
      current = current[keys[i]];
    }

    delete current[keys[keys.length - 1]];
    fs.writeFileSync(localPath, JSON.stringify(local, null, 2), 'utf-8');
  }
}

// Full config list
export function listConfig(global = true): Record<string, any> {
  return global ? globalStore.store : loadLocalConfig();
}
