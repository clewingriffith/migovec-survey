migovec-survey
==============

The aim of this site is to provide a more interactive version of the cave survey for the caves of Migovec

How it works
----------------

The migovec survey site uses the Google Maps Javascript API.   For the normal
'paper' view it takes a high resolution image of the drawn survey and scales it
to various zoom levels, and then cuts up the images into lots of smaller tiles.
This allows your browser to load only the bits of the image that it needs to 
draw what you are looking at.   On top of the image tiles it displays labels 
suitable for the level of detail you are looking at.

Building
----------

Most of the code is javascript and python.   The only real build step needed is
to scale and cut the survey into tiles.  

    ant build 

will start a python script (createTiles.py) which makes calls to imageMagick convert.
This step is very CPU and memory intensive. It'll split the job over all the CPUs cores
you have.   


Deploying
------------

Run 
    ant dist
to copy the files into a dist folder ready for deployment.    

You'll need the google-appengine pythonn download to actually deploy

    /path/to/google_appengine/appcfg.py update dist/migovec-survey
    
 should deploy to the interweb. The version field in src/app.yaml will control 
 where the deployed version goes.  version: 4 would be deployed to 
 http://4.migovec-survey.appspot.com/
 
 