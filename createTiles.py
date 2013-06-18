#!/usr/bin/env python

import os
import fnmatch
import re
import subprocess

def getParametersFromFileName(filename):
	print "Examining filename ",filename
	m = re.search("""\St_(\d+)_(\d+)_(\d+)_(\d+).png""", filename)
	if m.group(0) == filename:
		print "filename is in correct syntax."
		parameters =  {
			'zoomLevel': int(m.group(1)),
			'imageSize': int(m.group(2)),
			'xTile': int(m.group(3)),
			'yTile': int(m.group(4))
			}
		if parameters['imageSize']%256 != 0:
			raise("imageSize ", parameters['imageSize'], " must be a multiple of 256")
		print parameters
		return parameters
	else:
		raise("Unexpected filename format")
	
def  calcNumLevelsToCreate(imageSize):
	size = imageSize
	numLevels =1
	while size>256:
		numLevels+=1
		size = size/2
	return numLevels
	
def getDestinationParameters(params, incZoomLevel):	
	destParams = {
		'zoomLevel':params['zoomLevel']+incZoomLevel,
		'imageSize':params['imageSize']>>(calcNumLevelsToCreate(params['imageSize'])-incZoomLevel-1),
		'xTile':params['xTile']<<incZoomLevel,
		'yTile':params['yTile']<<incZoomLevel
	}
	return destParams
	
def createScaledImage(root,  filename, sourceParameters, destinationParameters):
	pixelSize = destinationParameters['imageSize']
	srcFile = os.path.join(root,filename)
	relRoot = os.path.relpath(root, "src")
	try:
		os.makedirs(os.path.join("build",relRoot))
	except:
		pass
		
	subprocess.call(["convert " + os.path.join(root,filename) + 
	" -resize %dx%d "%(pixelSize,pixelSize) + 
	#" -background white -gravity center " +
	#" -extent %dx%d "%(pixelSize,pixelSize) +
	#" -flatten " + 
	os.path.join("build", relRoot, "it_%(zoomLevel)d_%(imageSize)d_%(xTile)d_%(yTile)d.png" % destinationParameters)],
	shell=True)
 	

def processSource(root,filename):
	sourceParameters = getParametersFromFileName(filename)
	numLevelsToCreate = calcNumLevelsToCreate(sourceParameters['imageSize'])
	print "Creating ",numLevelsToCreate, " zoom levels"
	for incZoomLevel in range(0,numLevelsToCreate):
		destParams = getDestinationParameters(sourceParameters, incZoomLevel)
		print destParams
		createScaledImage(root,  filename, sourceParameters, destParams)
		
def cutIntoTiles(root, filename):
	sourceParameters = getParametersFromFileName(filename)
	print sourceParameters
	numLevels = calcNumLevelsToCreate(sourceParameters['imageSize'])
	numXtiles = 1<<(numLevels-1)
	subprocess.call(["convert " + os.path.join(root,filename) + 
	" -crop 256x256 " + 
	os.path.join(root, filename+".%d")],
	shell=True)
	print numXtiles
	xTileBase = sourceParameters['xTile']
	yTileBase = sourceParameters['yTile']
	for y in range(0,numXtiles):
		for x in range(0,numXtiles):
			idx = y*numXtiles+x;
			xt = xTileBase + x
			yt = yTileBase +y
			newFileName = "t_%d_%d_%d.png" % (sourceParameters['zoomLevel'],xt,yt)
			print "newFileName=",newFileName
			oldFileName = filename+".%d"%idx
			if numXtiles==1:
				oldFileName = filename
			print "oldfileName=",filename+".%d"%idx
			os.rename(os.path.join(root,oldFileName), os.path.join(root,newFileName))

if __name__ == '__main__':

	print "Generating Google maps tiles"
	print "============================"

	
	source_files = []
	for root, dirnames, filenames in os.walk('src/survey'):
	  for filename in fnmatch.filter(filenames, 'st_*.png'):
	      source_files.append((root, filename))

	print "Found source files: ", source_files

	for root,filename in source_files:
		processSource(root,filename)
	
	print "Cutting intermediate files into tiles"
	intermediate_files = []
	for root, dirnames, filenames in os.walk('build/survey'):
	  for filename in fnmatch.filter(filenames, 'it_*.png'):
	      intermediate_files.append((root, filename))
	print intermediate_files;
	for root,filename in intermediate_files:
		cutIntoTiles(root,filename)
	print "Done."
