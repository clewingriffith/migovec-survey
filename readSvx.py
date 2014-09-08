

import os

surveys = []
#hierarchy = []

def parseSvx(svxName, hierarchy,context):
	surveys = []
	team = []
	#print "parse",svxName,hierarchy
	svxFile = open(svxName, 'r')
	for line in svxFile:
		line = line.strip()
		if line.startswith("*begin"):
			surveyname = line.split()[1]
			hierarchy.append(surveyname)
			#print "BEGIN",hierarchy
		elif line.startswith("*end"):
			#print "END",
			surveys.append({
				'name':".".join(hierarchy), 
				'file':svxName.replace(context['basedir'],""),
				'date':context['date'],
				'team':team
			})
			hierarchy.pop()
			team = []
			#print hierarchy
		elif line.startswith("*include"):
			includename = line.split()[1]
			#remove .svx extension from  name
			includename = includename.rsplit(".svx")[0]
			includename = includename.replace('\\', '/')
			filenameToInclude = os.path.join(os.path.dirname(svxName), includename+".svx")
			surveys.extend(parseSvx(filenameToInclude, hierarchy,context))
		elif line.startswith("*date"):
			currentDate = line.split()[1]
			context['date'] = currentDate
			#print "DATE",currentDate
		elif line.startswith("*team"):
			roles = line.rpartition('"')[2].split()
			name= line.split('"')[1]
			team.append({'name':name, 'roles':roles})
	return surveys


current_survexname = '../migovecsurveydata/migovecsurveydata/sysmig_vrtnarija.svx'

surveys = parseSvx(current_survexname,[],{'basedir':'../migovecsurveydata/migovecsurveydata/'})
print surveys

print sorted(surveys, key=lambda k: k['date'])

"""
for each survex file
   if *begin: 
	   set prefix = current prefix + name
	
    if *end 
         set prefix = current prefix - name
	 output survex with year, team 
	 
   if *include:
	   read survex file with prefix current survey

	"""