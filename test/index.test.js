const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const plugin = require('../index.js');

const ENV_VARS = ['CECIL_CACHE_DIR', 'CECIL_CACHE_ENABLED', 'CECIL_CACHE', 'CECIL_DEBUG'];

const mockUtils = ({ restored = true, saved = true, items = ['.cache/assets', '.cache/templates'] } = {}) => {
  const calls = { restore: [], save: [], status: [], failBuild: [] };
  return {
    calls,
    utils: {
      cache: {
        restore: async (dirs) => { calls.restore.push(dirs); return restored; },
        save: async (dirs) => { calls.save.push(dirs); return saved; },
        list: async () => items,
      },
      status: { show: (status) => calls.status.push(status) },
      build: { failBuild: (message) => calls.failBuild.push(message) },
    },
  };
};

const constants = { PUBLISH_DIR: '_site' };

describe('netlify-plugin-cache', () => {
  let logs;
  let originalLog;

  beforeEach(() => {
    ENV_VARS.forEach((name) => delete process.env[name]);
    logs = [];
    originalLog = console.log;
    console.log = (...args) => logs.push(args.join(' '));
  });

  afterEach(() => {
    console.log = originalLog;
    ENV_VARS.forEach((name) => delete process.env[name]);
  });

  it('restores and saves `.cache` by default', async () => {
    const { utils, calls } = mockUtils();
    await plugin.onPreBuild({ constants, inputs: {}, utils });
    await plugin.onPostBuild({ constants, inputs: {}, utils });
    assert.deepStrictEqual(calls.restore, [['.cache']]);
    assert.deepStrictEqual(calls.save, [['.cache']]);
    assert.strictEqual(calls.status.length, 2);
  });

  it('uses the `cacheDir` input', async () => {
    const { utils, calls } = mockUtils();
    await plugin.onPreBuild({ constants, inputs: { cacheDir: 'tmp/cache' }, utils });
    assert.deepStrictEqual(calls.restore, [['tmp/cache']]);
  });

  it('gives priority to `CECIL_CACHE_DIR` over the `cacheDir` input', async () => {
    process.env.CECIL_CACHE_DIR = 'env-cache';
    const { utils, calls } = mockUtils();
    await plugin.onPreBuild({ constants, inputs: { cacheDir: 'tmp/cache' }, utils });
    await plugin.onPostBuild({ constants, inputs: { cacheDir: 'tmp/cache' }, utils });
    assert.deepStrictEqual(calls.restore, [['env-cache']]);
    assert.deepStrictEqual(calls.save, [['env-cache']]);
  });

  it('fails the build if publish directory is the project root', async () => {
    const { utils, calls } = mockUtils();
    await plugin.onPreBuild({ constants: { PUBLISH_DIR: process.cwd() }, inputs: {}, utils });
    assert.strictEqual(calls.failBuild.length, 1);
  });

  for (const [name, value] of [['CECIL_CACHE_ENABLED', 'false'], ['CECIL_CACHE', '0']]) {
    it(`skips cache when ${name}=${value}`, async () => {
      process.env[name] = value;
      const { utils, calls } = mockUtils();
      await plugin.onPreBuild({ constants, inputs: {}, utils });
      await plugin.onPostBuild({ constants, inputs: {}, utils });
      assert.deepStrictEqual(calls.restore, []);
      assert.deepStrictEqual(calls.save, []);
    });
  }

  it('does not show status when cache is not found', async () => {
    const { utils, calls } = mockUtils({ restored: false, saved: false });
    await plugin.onPreBuild({ constants, inputs: {}, utils });
    await plugin.onPostBuild({ constants, inputs: {}, utils });
    assert.strictEqual(calls.status.length, 0);
  });

  it('prints cached items with the `debug` input', async () => {
    const { utils } = mockUtils();
    await plugin.onPreBuild({ constants, inputs: { debug: true }, utils });
    assert.ok(logs.includes('1. .cache/assets'));
    assert.ok(logs.includes('2. .cache/templates'));
  });

  it('prints cached items with CECIL_DEBUG=true', async () => {
    process.env.CECIL_DEBUG = 'true';
    const { utils } = mockUtils();
    await plugin.onPostBuild({ constants, inputs: {}, utils });
    assert.ok(logs.includes('1. .cache/assets'));
  });

  it('does not print cached items with CECIL_DEBUG=false', async () => {
    process.env.CECIL_DEBUG = 'false';
    const { utils } = mockUtils();
    await plugin.onPostBuild({ constants, inputs: { debug: false }, utils });
    assert.ok(!logs.includes('1. .cache/assets'));
  });
});
