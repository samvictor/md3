// Configure loading modules from the lib directory
requirejs.config({
    //baseUrl: '../lib',
	//baseUrl: '../md3/lib',
	baseUrl: '..',
	paths: {
		jquery: "jquery.min"
	}
});

// Start loading the main app file
//requirejs(['d3.min','jquery','../main/md3']);
try
{
	//requirejs(['lib/d3.min','lib/jquery','main/md3']);
	requirejs(['md3/lib/d3.min','md3/lib/jquery','md3/main/md3']);
}
catch (err)
{
	requirejs(['md3/lib/d3.min','md3/lib/jquery','md3/main/md3']);
}