// Configure loading modules from the lib directory
requirejs.config({
    baseUrl: '../lib',
	paths: {
		jquery: "jquery.min"
	}
});

// Start loading the main app file
requirejs(['d3.min','jquery','../main/md3']);