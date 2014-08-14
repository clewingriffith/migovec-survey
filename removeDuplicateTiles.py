
import os, sys
mapping_path = os.path.abspath('build')
sys.path.append(mapping_path)

import duplicate_tile_mapping

if __name__ == '__main__':

	print "Removing Duplicate map tiles"
	print "==========================="
	
	removal_count = 0
	
	for source,dest in duplicate_tile_mapping.tile_mapping.items():
		if source != dest:
			os.remove(source)
			removal_count += 1
			
	print "Removed",removal_count,"files."
	print "Done."
	
