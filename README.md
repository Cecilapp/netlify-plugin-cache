# netlify-plugin-cache

This [Netlify plugin](https://docs.netlify.com/build-plugins/) persists the [Cecil](https://cecil.app)’s cache between Netlify builds.

## Usage

There are two ways to install this plugin:

### Installing from [Netlify UI](https://docs.netlify.com/build-plugins/#ui-installation)

[One-click install](http://app.netlify.com/plugins/@cecil/netlify-plugin-cache/install) to add this to your Cecil site.

### Installing from [npm](https://www.npmjs.com/package/@cecil/netlify-plugin-cache)

Add the plugin in `package.json`:

```bash
npm install -D @cecil/netlify-plugin-cache
```

Add the following lines to your project's `netlify.toml` file:

```toml
[build]
  publish = "_site"
[[plugins]]
  package = "@cecil/netlify-plugin-cache"
```

### Available inputs

```toml
[[plugins]]
  package = "@cecil/netlify-plugin-cache"
  [plugins.inputs]
  cacheDir = ".cache" # Cache directory (`.cache` by default)
  debug = true        # Print list of cached folders in build log (`false` by default)
```

## License

_@cecil/netlify-plugin-cache_ is a free software distributed under the terms of the MIT license.

© [Arnaud Ligny](https://arnaudligny.fr)
