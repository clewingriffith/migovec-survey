#!/usr/bin/env python

import sys
import struct
import datetime

"""
File Header

This consists of:

File ID: the string "Survex 3D Image File" followed by a linefeed (decimal 10, hex x0a). [Note: v0.01 files can have a carriage return before this and other linefeeds - this is a file format error in any other format version].
File format version: "v3", "v4", "v5", "v6", "v7" followed by a linefeed. Any future versions will be "v8", "v9", "v10", "v11", etc. Older format versions aren't described here, but had version strings "v0.01", "Bv0.01", "bv0.01", and "v2").
Survey title: A string followed by a linefeed. There's no length limit on this string.
Timestamp: A string followed by a linefeed. This is intended to be the time the file was generated, rather than the time the survey data was collected. The easiest way to generate this is with the strftime() format "%a,%Y.%m.%d %H:%M:%S %Z" if you have access to strftime(). An example timestamp is "Sun,2002.03.17 14:01:07 GMT".
"""

def readLine(file):
	buffer = []
	while True:
		c = file.read(1)
		if c == '\x0a':
			break
		buffer.append(c)
	return ''.join(buffer)

def readHeader(file):
	expectedFileIdString = "Survex 3D Image File\x0a"
	fileId = file.read(len(expectedFileIdString));
	if fileId != expectedFileIdString:
		raise "Doesn't look like a survex .3d file"
	print fileId
	formatVersion = readLine(file)
	if formatVersion != "v7":
		raise "Unsupported format version %s" % formatVersion
	surveyTitle = readLine(file)
	print "Survey Title:",surveyTitle
	timestamp = readLine(file)
	print "Timestamp:",timestamp



def readSurvey(file):
	
	currentLabel = ""
	
	def readLabel(label):
		newLabel = label;
		bytes=file.read(1)
		labelLength=int(struct.unpack("B",bytes)[0])
		print "LabelLength",labelLength
		labelSection = file.read(labelLength)
		newLabel += labelSection
		print "+",labelSection
		print newLabel
		return newLabel
	
	while True:
		code = file.read(1)
		print hex(ord(code)),
		if code == '\x00': #STOP
			print ":STOP"
			if currentLabel == "":
				print "End Of File"
				break
			else:
				currentLabel = ""
		elif code >= '\x01' and code <= '\x0e': #TRIM
			print ":TRIM"
			n=ord(code)-ord('\x01')+1
			print n
			currentLabel = currentLabel[:-16]
			for dot in range(n):
				currentLabel = currentLabel[:currentLabel.rfind(".")]
			currentLabel = currentLabel + "."
			print currentLabel
		elif code == '\x0f': #MOVE
			bytes = file.read(4*3)
			x,y,z = struct.unpack("<iii", bytes)
			print ":MOVE",0.01*x,0.01*y,0.01*z
		elif code >= '\x10' and code <= '\x1f':#TRIM
			print ":TRIM"
			n=ord(code)-ord('\x10')+1
			print n
			currentLabel = currentLabel[:-n]
			print currentLabel
		elif code == '\x20': #DATE
			bytes = file.read(2)
			daysSince1900 = struct.unpack("<H", bytes)
			dateAt1900 = datetime.date(1900,1,1)
			surveydate = dateAt1900 + datetime.timedelta(daysSince1900[0])
			print ":DATE:",surveydate
		elif code == '\x21': #DATESPAN
			bytes = file.read(3)
			daysSince1900,daysSinceDate1 = struct.unpack("<HB", bytes)
			dateAt1900 = datetime.date(1900,1,1)
			surveyStart = dateAt1900 + datetime.timedelta(daysSince1900)
			surveyEnd = surveyStart + datetime.timedelta(daysSinceDate1)
		elif code == '\x22': #ERROR
			bytes = file.read(4*5)
			numLegs,traverseLength,E,H,V = struct.unpack("<iiiii", bytes)
		elif code == '\x23':#DATE
			print ":DATE"
			bytes = file.read(2*2)
			days1Since1900,days2Since1900 = struct.unpack("<HH", bytes)
		elif code == '\x24':#DATE
			pass
		elif code >= '\x25' and code <= '\x2f':
			raise "Found reserved code %s"%code
		elif code >= '\x30' and code <= '\x31': #XSECT
			print ":XSECT"
			currentLabel = readLabel(currentLabel)
			bytes=file.read(2*4)
			#length,label,L,R,U,D =
		elif code >= '\x32' and code <= '\x33':#XSECT
			print ":XSECT"
			currentLabel = readLabel(currentLabel)
			bytes=file.read(4*4)
		elif code >= '\x34' and code <= '\x3f':
			raise "Found reserved code %s"%code
		elif code >= '\x40' and code <= '\x7f': #LABEL
			print ":LABEL"
			currentLabel = readLabel(currentLabel)
			bytes = file.read(4*3)
			x,y,z = struct.unpack("<iii", bytes)
			#print labelSection
		elif code >= '\x80' and code <= '\xbf':
			print ":LINE"
			#bytes=file.read(1)
			#labelLength=int(struct.unpack("B",bytes)[0])
			#print "len=",labelLength
			#labelSection = file.read(labelLength)
			#currentLabel += labelSection
			#print "+",labelSection
			#print currentLabel
			currentLabel = readLabel(currentLabel)
			bytes = file.read(4*3)
			x,y,z = struct.unpack("<iii", bytes)
			print 0.01*x,0.01*y,0.01*z
		else:
			raise "Found reserved code %s"%code

inputFileName = sys.argv[1]
inputFile = open(inputFileName, 'rb')

readHeader(inputFile)
readSurvey(inputFile)

