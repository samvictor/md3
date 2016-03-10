// Configure loading modules from the lib directory
requirejs.config({
    //baseUrl: '../lib',
	baseUrl: '../md3/lib',
	//baseUrl: '..',
	paths: {
		//jquery: "jquery.min"
		req_jquery: "http://code.jquery.com/jquery-1.12.0.min.js"
		req_d3: "http://d3js.org/d3.v3.min.js"
	}
});

// Start loading the main app file
//requirejs(['../libr/d3.min','../libr/jquery.min','../main/md3']);
requirejs(['req_d3', 'req_jquery', '../main/md3']);
//requirejs(['d3.min','jquery','../main/md3']);
/*try
{
	requirejs(['lib/d3.min','lib/jquery','main/md3']);
	//requirejs(['md3/lib/d3.min','md3/lib/jquery.min','md3/main/md3']);
}
catch (err)
{
	requirejs(['md3/lib/d3.min','md3/lib/jquery.min','md3/main/md3']);
}*/