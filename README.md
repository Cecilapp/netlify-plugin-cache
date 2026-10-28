# @cecilapp/netlify-plugin-cache

This [Netlify plugin](https://docs.netlify.com/build-plugins/) persists the [Cecil](https://cecil.app)’s cache between Netlify builds.

## Usage

There are two ways to install this plugin:

### Installing from [Netlify UI](https://docs.netlify.com/build-plugins/#ui-installation)

[One-click install](https://app.netlify.com/plugins/@cecilapp/netlify-plugin-cache/install) to add this to your Cecil site.

### Installing from [npm](https://www.npmjs.com/package/@cecilapp/netlify-plugin-cache)

Add the plugin to your project’s `package.json`:

```bash
npm install -D @cecilapp/netlify-plugin-cache
```

Add the following lines to your project’s `netlify.toml` file:

```toml
[build]
  publish = "_site"
[[plugins]]
  package = "@cecilapp/netlify-plugin-cache"
```

### Available inputs

```toml
[[plugins]]
  package = "@cecilapp/netlify-plugin-cache"
  [plugins.inputs]
  cacheDir = ".cache" # Cache directory, relative to the project root (`.cache` by default)
  debug = true        # Print the list of cached items in build log (`false` by default)
```

### Environment variables

The plugin reads the same environment variables as Cecil:

- `CECIL_CACHE_DIR`: cache directory (takes precedence over the `cacheDir` input)
- `CECIL_CACHE_ENABLED=false`: cache is disabled, so the plugin doesn’t restore nor store anything
- `CECIL_DEBUG=true`: print the list of cached items in build log

## License

_@cecilapp/netlify-plugin-cache_ is a free software distributed under the terms of the MIT license.

© [Arnaud Ligny](https://arnaudligny.fr)
