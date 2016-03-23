// Configure loading modules from the lib directory

requirejs.config({
	baseUrl: '../lib',   		// for local
	//baseUrl: '../md3/lib',   	// for github
	//enforceDefine: true,      // might not work in IE without this
	paths: {
		jquery: "http://code.jquery.com/jquery-2.2.1.min",
		'req_d3': "http://d3js.org/d3.v3.min",
		'req_md3': ['../md3/main/md3', '../main/md3']
	}
});

// Start loading the main app file
requirejs(['req_d3', 'jquery', 'req_md3']);