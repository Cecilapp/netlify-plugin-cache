const DEFAULT_CACHE_DIR = '.cache';

// Casts a value like Cecil does with `FILTER_VALIDATE_BOOLEAN` (returns `null` if not a boolean)
const toBool = (value) => {
  if (typeof value === 'boolean') return value;
  if (value === undefined || value === null) return null;
  const str = String(value).trim().toLowerCase();
  if (['1', 'true', 'on', 'yes'].includes(str)) return true;
  if (['0', 'false', 'off', 'no', ''].includes(str)) return false;
  return null;
};

// `CECIL_CACHE_DIR` wins because Cecil itself uses it, regardless of the plugin inputs
const getCacheDirs = (inputs) => [
  process.env.CECIL_CACHE_DIR || inputs.cacheDir || DEFAULT_CACHE_DIR
];

const isCacheDisabled = () =>
  toBool(process.env.CECIL_CACHE_ENABLED) === false || toBool(process.env.CECIL_CACHE) === false;

const isDebug = (inputs) =>
  toBool(inputs.debug) === true || toBool(process.env.CECIL_DEBUG) === true;

const printDebug = (items) => {
  items.forEach((item, index) => {
    console.log(`${index + 1}. ${item}`);
  });
};

module.exports = {
  async onPreBuild({constants, inputs, utils}) {
    if (process.cwd() === constants.PUBLISH_DIR) {
      utils.build.failBuild(
        `Your site’s publish directory is not set correctly (“${constants.PUBLISH_DIR}”).`
      );
    }

    if (isCacheDisabled()) {
      console.log('Cecil’s cache is disabled: nothing to restore.');
      return;
    }

    const cacheDirs = getCacheDirs(inputs);

    if (await utils.cache.restore(cacheDirs)) {
      const cachedItems = await utils.cache.list();

      utils.status.show({
        title: 'Cecil’s cache restored',
        summary: `Cecil’s cache (${cacheDirs.join(', ')}) restored from previous build.`
      });
      console.log('Cecil’s cache (%s) restored from previous build (%s cached items).', cacheDirs.join(', '), cachedItems.length);
      if (isDebug(inputs)) printDebug(cachedItems);
    } else {
      console.log('Cecil’s cache (%s) not found in Netlify cache.', cacheDirs.join(', '));
    }
  },
  async onPostBuild({inputs, utils}) {
    if (isCacheDisabled()) {
      console.log('Cecil’s cache is disabled: nothing to store.');
      return;
    }

    const cacheDirs = getCacheDirs(inputs);

    if (await utils.cache.save(cacheDirs)) {
      const cachedItems = await utils.cache.list();

      utils.status.show({
        title: 'Cecil’s cache stored',
        summary: `Cecil’s cache (${cacheDirs.join(', ')}) stored to speed up next builds.`
      });
      console.log('Cecil’s cache (%s) stored to speed up next builds (%s cached items).', cacheDirs.join(', '), cachedItems.length);
      if (isDebug(inputs)) printDebug(cachedItems);
    } else {
      console.log('Cecil’s cache (%s) not found: nothing to store.', cacheDirs.join(', '));
    }
  },
};
