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
st_14_8192_8818_5812.png
    /path/to/google_appengine/appcfg.py update dist/migovec-survey
    
 should deploy to the interweb. The version field in src/app.yaml will control 
 where the deployed version goes.  version: 4 would be deployed to 
 http://4.migovec-survey.appspot.com/
 
 Creating the tiles
 ----------------------
 The build scripts takes a hi-res image of the drawn survey at each year of the survey.
 To allow us to visualize a consistent progression of the cave exploration, this
 can't be the drawn survey as it was several years ago, but rather the current
 view of the passages that were discovered on a particular year.
 In the migovecsurveydata git project, there should be an inkscape file for the
 plan and the elevation.
 
 Open the master elevation file
 Make the GoogleMapsTileGuides layer visible and all the laster that are not the 
 extended elevation invisible
 
 Generating a hi-res picture for a particular year:
 
 Open the inkscape survey.
 Mark all layers apart from extendedElevation and GoogleMapsTileGuide hidden.
 Briefly unlock the GoogleMapsTileGuide layer so you can select it, then lock it again.
 Hide the GoogleMapsTileGuide layer
 Expand the extended elevation layer. There will be a sublayer for each year of discovery.
 Hide the years after the one you want to export, so if you're exporting the survey as
 of 2011, hide all years after 2011.
 File->export bitmap [ set Export area to Selection, BitMap size to 8192x8192 ]]
 Use filename  migovec-survey/src/survey/year/2011/survey/SysMig/extendedElevation/st_14_8192_8818_5812.png
 Where 2011 should be replaced with the year of the survey being exported.
 
 
 
 #tile comparison
 compare -metric RMSE 2013/survey/SysMig/extendedElevation/st_14_8192_8818_5812.png 2012/survey/SysMig/extendedElevation/st_14_8192_8818_5812.png NULL:

 