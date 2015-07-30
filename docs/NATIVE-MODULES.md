# Native Node module compatibility

> The native Node modules are supported by Electron, but since Electron is using a different V8 version from official Node, you have to manually specify the location of Electron's headers when building native modules.  
See https://github.com/atom/electron/blob/master/docs/tutorial/using-native-node-modules.md for more details.

I published https://github.com/s-a/electron-recompile which aims to help with compile native modules for a specific electron version. Unfortunately is seems that there is no standard for requiring native modules in packages which cares about diffent versions.

For example NSLog simply searches like this 
```javascript
  NSLog = require('../build/Release/nslog.node');
```

A very good approach for me is available at the fibers source code which searches with a little bit more logic.
```javascript
// Look for binary for this platform
var v8 = 'v8-'+ /[0-9]+\.[0-9]+/.exec(process.versions.v8)[0];
var modPath = path.join(__dirname, 'bin', process.platform+ '-'+ process.arch+ '-'+ v8, 'fibers');
try {
	fs.statSync(modPath+ '.node');
} catch (ex) {
	// No binary!
	throw new Error('`'+ modPath+ '.node` is missing. Try reinstalling `node-fibers`?');
}
```

However it depends on the Node.js module if you can manage different native versions at the same time.
***Feel free to [submit an issue](https://github.com/s-a/iron-node/issues) if you are affected by such a problem.*** or contact the third party module author directly and reference to this document. Maybe the authors are willing to implement such a logic into their modules. To make those things easier I wrote [Node Module Path](https://github.com/s-a/nmp).