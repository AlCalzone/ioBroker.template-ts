# Documentation of certain tsconfig.json properties

## compileOnSave (true | false)
`true` automatically build files in Visual Studio (Code), in combination with the watch option.

## compilerOptions.declaration (true | false)
`true` emits d.ts files.

## compilerOptions.noEmitOnError (true | false)
`false` prevents compilation of faulty code.

## compilerOptions.noImplicitAny (true | false)
`true` enforces stricter type checking. `false` is usually enough.

## compilerOptions.sourceMap / compilerOptions.inlineSourceMap (true | false)
Source maps are for debugging.  
Use *EITHER* `sourceMap = true` (generates .map file)
or `inlineSourceMap = true` (includes map files in js files), *NOT* both. 
If you have problems finding the right lines while debugging, try switching the source map types.  
You can also disable them for less output.

## compilerOptions.target ("es5", "es6", "...")
- `"es5"` compiles to "old" JavaScript.
- You can choose `"es6"` for NodeJS 6+

## compilerOptions.lib
Choose lib `["es6"]` for native Promise support in NodeJS 4+. You can omit this if you only target es6+

## compilerOptions.watch (true | false)
`true` watches file system and triggers compilation on changes. 
Supported in Visual Studio Code. Not supported in Visual Studio - omit this option if neccessary.