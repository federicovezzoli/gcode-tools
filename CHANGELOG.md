# [1.7.0](https://github.com/federicovezzoli/gcode-tpgen/compare/v1.6.0...v1.7.0) (2026-04-11)


### Features

* enhance zero reference point handling and formatting in G-code generation ([f3baf2d](https://github.com/federicovezzoli/gcode-tpgen/commit/f3baf2db425d5573e6c25ba6b5ac169f5d6b72a2))
* Implement zero reference point selection for G92 origin in universal parameters ([4b7332f](https://github.com/federicovezzoli/gcode-tpgen/commit/4b7332f2b77f3d82f3e4dd6d9b29b2a46f5c5a26))

# [1.6.0](https://github.com/federicovezzoli/gcode-tpgen/compare/v1.5.0...v1.6.0) (2026-03-24)


### Features

* Add multipass support to surfacing generator ([b50e17f](https://github.com/federicovezzoli/gcode-tpgen/commit/b50e17ffd74a52d3226e32d4d2c4dd9b8e1d76e0))
* add passes parameter to surfacing functionality and update related components ([0748ed4](https://github.com/federicovezzoli/gcode-tpgen/commit/0748ed4a306f9c8058cbfde8ff309711ced0430a))
* Enhance stroke merging logic and improve rendering of cuts in ToolpathPreview ([e9bc253](https://github.com/federicovezzoli/gcode-tpgen/commit/e9bc253cf4075455350f62a767e7f5457c35d247))
* Refactor passes handling in ToolpathPreview and Gcode generation for improved safety and clarity ([4524eac](https://github.com/federicovezzoli/gcode-tpgen/commit/4524eacaae73d91c3a65d647eb2a905f8d42441e))

# [1.5.0](https://github.com/federicovezzoli/gcode-tpgen/compare/v1.4.0...v1.5.0) (2026-03-23)


### Features

* update license in package-lock.json and enhance ModeParamsForm with xsize and ysize props ([94584cd](https://github.com/federicovezzoli/gcode-tpgen/commit/94584cdec255a0256613afc2239b861fb52bbbe9))
* update metadata for G-Code Patterns Generator with enhanced descriptions and keywords ([be541e8](https://github.com/federicovezzoli/gcode-tpgen/commit/be541e846590e245997a0f7895047f7b3f54a73a))

# [1.4.0](https://github.com/federicovezzoli/gcode-tpgen/compare/v1.3.0...v1.4.0) (2026-03-22)


### Features

* add MIT license file and update package.json to include license information ([163dc81](https://github.com/federicovezzoli/gcode-tpgen/commit/163dc81a8f1f12a92648c1781921f7da3e0b172d))

# [1.3.0](https://github.com/federicovezzoli/gcode-tpgen/compare/v1.2.0...v1.3.0) (2026-03-22)


### Features

* update deployment workflow to include semantic release and adjust permissions ([6fa5821](https://github.com/federicovezzoli/gcode-tpgen/commit/6fa58218e4c25aa41d29edcd73b7a290373e6bf3))

# [1.2.0](https://github.com/federicovezzoli/gcode-tpgen/compare/v1.1.0...v1.2.0) (2026-03-22)


### Features

* trigger deployment after successful semantic release ([2f03057](https://github.com/federicovezzoli/gcode-tpgen/commit/2f03057a4afe769df52c9be7dce342d9d64decab))

# [1.1.0](https://github.com/federicovezzoli/gcode-tpgen/compare/v1.0.0...v1.1.0) (2026-03-22)


### Features

* add validation for bit width and stepover in ModeParamsForm; update ToolpathPreview to use SurfacingParams ([ff2d734](https://github.com/federicovezzoli/gcode-tpgen/commit/ff2d73432b6b8e40f09d592f215adb726abbd55d))
* enhance surfacing mode with bit width parameter and update toolpath preview ([1fef8b7](https://github.com/federicovezzoli/gcode-tpgen/commit/1fef8b7f05ddd5cf93ba494a9140278ccbb6001d))

# 1.0.0 (2026-03-22)


### Bug Fixes

* add .claude/settings.local.json to .gitignore ([e749913](https://github.com/federicovezzoli/gcode-tpgen/commit/e74991384d75f65d11b24125edb61b98d37d462a))
* add suppressHydrationWarning to RootLayout component ([2b6e227](https://github.com/federicovezzoli/gcode-tpgen/commit/2b6e227f6b44cfe8b94f964fb742bcc7f60edafd))
* layout review + descriptions of the modes ([8d94fb9](https://github.com/federicovezzoli/gcode-tpgen/commit/8d94fb92514bb9a0f648d735f568241f22b86b48))
* moved to biome ([8508925](https://github.com/federicovezzoli/gcode-tpgen/commit/8508925645028fd2e7778bcef2dc2cd03e3f6ea1))
* moved to src folder ([b09656b](https://github.com/federicovezzoli/gcode-tpgen/commit/b09656b4c52af575ce80eb5f950154c2cfd4f3c2))
* update font-sans variable and enhance description in Home component ([a26a018](https://github.com/federicovezzoli/gcode-tpgen/commit/a26a0182259543dc818eeea12680fba390476e4e))


### Features

* add footer with author and repository links ([14eef59](https://github.com/federicovezzoli/gcode-tpgen/commit/14eef598da1138152b3e0fd373975faa0353a495))
* Add G-code test fixtures and implement unit tests for G-code generation ([0294d7b](https://github.com/federicovezzoli/gcode-tpgen/commit/0294d7bfb6810867ae610cbf0161f01e0696bc25))
* add GitHub Pages static export and deploy workflow ([005c34a](https://github.com/federicovezzoli/gcode-tpgen/commit/005c34ad5299041ca7446f147b06264cad417849))
* add ToolpathPreview component and integrate with GcodeOutput ([aa20f04](https://github.com/federicovezzoli/gcode-tpgen/commit/aa20f049d41335d78716a95c479b343779551eb3))
* add UI components for separator, tabs, and textarea ([cf972a8](https://github.com/federicovezzoli/gcode-tpgen/commit/cf972a82e1ea9c86fd9e96349d2118b1e21943ed))
* dark mode + mode selector review ([560c0a3](https://github.com/federicovezzoli/gcode-tpgen/commit/560c0a36e9e5f426a7f27561225c2d8bc675f44c))
* initial commit ([bb49520](https://github.com/federicovezzoli/gcode-tpgen/commit/bb49520c5c5178e8feb2ac045351eb2a1b37a739))
* Refactor G-code generation for improved modularity and readability ([ec06879](https://github.com/federicovezzoli/gcode-tpgen/commit/ec06879009ceb204ba1c97b1629cfaa1a1a565fa))
* update dependencies for semantic release and add version display in footer ([b7fc784](https://github.com/federicovezzoli/gcode-tpgen/commit/b7fc78480794d4335b2482d601586443708b0cd1))
