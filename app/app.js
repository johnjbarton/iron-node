var fs = require('fs');
var path = require('path');
var remote = require('remote');
var dialog = remote.require('dialog');
var markdown = require('markdown').markdown;

window.opener = window.open = require("open");


var error = function(error) {
	console.error(error);
	var msgBoxConfig = {
		type : "error", 
		title : "Uncaught Exception", 
		buttons:["ok", "close"]
	};

	switch (typeof error) {
		case "object":
			msgBoxConfig.title = "Uncaught Exception: " + error.code;
			msgBoxConfig.message = error.message;
			msgBoxConfig.detail = error.stack;
			break;
		case "string":
			msgBoxConfig.message = error;
			break;
	}


	dialog.showMessageBox(remote.getCurrentWindow(), msgBoxConfig, function(response){
		if (response === 1){
			remote.getCurrentWindow().close();
		}
	});
}


process.on('uncaughtException', error);

var prepareStartScriptParameter = function(filename) {
	var result = filename;

	if (!path.isAbsolute(filename)){
		result = path.resolve(process.cwd(), filename);
	}

	return result;
};

var initializePackageScripts = function(json) {
	var packageMeta = json;
	var scripts = [];
	if (packageMeta.scripts){
		for(var script in packageMeta.scripts){
			if (packageMeta.scripts.hasOwnProperty(script)){
				scripts.push('<a class="menu-item" href="#"><span class="octicon octicon-terminal"></span>' + script + ' : ' + packageMeta.scripts[script] + '</a>');
			}
		}
	}
	document.getElementById("project-terminal").innerHTML = scripts.join("");
}

var initializePackageInfo = function(rootDirectory){
	var p = path.join(rootDirectory, "package.json");
	fs.exists(p, function(exists){
		if (exists){
			fs.readFile(p, function(err, data){
				if (err){
					console.error(err);
				} else {
					try{
						document.getElementById("project-package").innerHTML = '<a class="menu-item" href="#"><span class="octicon octicon-package"></span><span>' + p + '</span></a>';
						var meta = JSON.parse(data.toString());
						initializePackageScripts(meta);
						if (meta.repository && meta.repository.url){
							document.getElementById("project-repo-url").innerHTML = '<a class="menu-item" href="#" onclick="window.opener(\'' + meta.repository.url + '\')"><span class="octicon octicon-repo"></span>Repository</a>';
						}
						if (meta.bugs && meta.bugs.url){
							document.getElementById("project-bugs-url").innerHTML = '<a class="menu-item" href="#" onclick="window.opener(\'' + meta.bugs.url + '\')"><span class="octicon octicon-bug"></span>Issues</a>';
						}
					} catch (e){
						console.error("Error in", p, e);
					}
				}
			});
		}
	});
}

var initializeInfoWindow = function(rootDirectory) {
	initializePackageInfo(rootDirectory);
	var filename = path.join(rootDirectory, "DEBUG.md");
	var loadMarkdownFile = function(fn) {
		fs.readFile(fn, function(err, data){
			document.getElementById("content").innerHTML =  markdown.toHTML( data.toString() );
		});
	};

	fs.exists(filename, function(exists){
		if (exists){
			loadMarkdownFile(filename);
		} else {
			filename = path.join(rootDirectory, "README.md");
			fs.exists(filename, function(exists){
				if (exists){
					loadMarkdownFile(filename);
				}
			});
		}
	});
};

var boot = function() {
	var args = remote.process.argv;

	// reset and equip process.argv for forthcoming Node.js scripts.
	process.argv = [args[0]];
	for (var i = 2; i < args.length; i++) {
		var arg = args[i];
		process.argv.push(arg);
	}

	if (args[2]){
		args[2] = prepareStartScriptParameter(args[2]);
	}

	if (args[2]){
		document.getElementById("project-filename").innerHTML = args[2];
		initializeInfoWindow(path.dirname(args[2]));
		require(args[2]);
	} else {
		document.getElementById("project-filename").innerHTML = "No start script given.<br>Try <code>iron-node [path_to_your_javascript_file]</code>";
		initializeInfoWindow(process.cwd());
	}
}


window.onload = function() {
  window.setTimeout(boot, 1000);
}