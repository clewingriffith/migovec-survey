import webapp2
import json
from google.appengine.api import users
from google.appengine.ext import db
import os
from google.appengine.ext.webapp import template

class Label(db.Model):
	layer = db.StringProperty(required=True)
	text_en = db.StringProperty(required=True)
	position = db.GeoPtProperty(required=True)
	zoom_level = db.IntegerProperty(required=True)
	def asJson(self):
		return json.dumps(self.asDict())
	def asDict(self):
		dic = {
			'id': self.key().id(),
			'text_en':self.text_en, 
			'position':(self.position.lat, self.position.lon),
			'zoom_level':self.zoom_level
		}
		return dic
		
		
class Photo(db.Model):
	layer = db.StringProperty(required=True)
	url = db.StringProperty(required=True)
	position = db.GeoPtProperty(required=True)
	caption = db.StringProperty(required=False)
	def asJson(self):
		return json.dumps(self.asDict())
	def asDict(self):
		dic = {
			'id': self.key().id(),
			'url':self.url, 
			'position':(self.position.lat, self.position.lon),
			'caption':self.caption
		}
		return dic

class MainPage(webapp2.RequestHandler):
  def get(self):
	editMode = self.request.get('edit')
	
	template_values = {
		'editMode': ("1" == editMode)
	}

	self.response.headers['Content-Type'] = 'text/html'
	path = os.path.join(os.path.dirname(__file__), 'index.html')
	self.response.out.write(template.render(path, template_values))

class Login(webapp2.RequestHandler):
	def get(self):
		user = users.get_current_user()
		if user:
			self.response.headers['Content-Type'] = 'text/plain'
			if users.is_current_user_admin():
				self.response.out.write('Hello admin user, ' + user.nickname())
			else:
				self.response.out.write('Hello normal user, ' + user.nickname())
		else:
			self.redirect(users.create_login_url(self.request.uri))

class GetMarkers(webapp2.RequestHandler):
	def get(self):
		pass
		
class PutLabel(webapp2.RequestHandler):
	def put(self, label_id):
		json_data = None;
		#try:
		raw_content = self.request.body
		print raw_content
		json_data = json.loads(raw_content)
		
		print json_data

		idInPayload = json_data['id']
		
		if label_id != idInPayload:
			self.error(400)
			
		#except:
		#	self.error(400)
			
		print "Trying to get label by id " + label_id
		m = Label.get_by_id(int(label_id))
		if json_data.has_key('text_en'):
			newTextEn = json_data['text_en']
			m.text_en = newTextEn
		if json_data.has_key('position'):
			(lat,lng) = json_data['position']
			m.position = db.GeoPt(lat,lng)
		m.put()


class PutPhoto(webapp2.RequestHandler):
	def put(self, photo_id):
		json_data = None;
		#try:
		raw_content = self.request.body
		print raw_content
		json_data = json.loads(raw_content)
		
		print json_data

		idInPayload = json_data['id']
		
		if photo_id != idInPayload:
			self.error(400)
			
		print "Trying to get photo by id " + photo_id
		m = Photo.get_by_id(int(photo_id))
		if json_data.has_key('url'):
			newUrl = json_data['url']
			m.url = newUrl
		if json_data.has_key('position'):
			(lat,lng) = json_data['position']
			m.position = db.GeoPt(lat,lng)
		if json_data.has_key('caption'):
			newCaption = json_data['caption']
			m.caption = newCaption
		m.put()


"""
Create a new label at default position 0,0.
Returns the JSON representation of the new label, including id field.
"""
class PostLabel(webapp2.RequestHandler):
	def post(self, layer):
		try:
			raw_content = self.request.body
			print raw_content
			json_data = json.loads(raw_content)
			print json_data
			text_en = json_data['text_en']
			zoom_level = int(json_data['zoom_level'])
		except:
			self.error(400)
		newLabel = Label(layer = layer, text_en = text_en, position=db.GeoPt(0,0), zoom_level=zoom_level)
		newLabel.put()
		self.response.headers['Content-Type'] = 'application/json'
		self.response.out.write(newLabel.asJson())
	
"""
Create a new photo at default position 0,0.
Returns the JSON representation of the new label, including id field.
"""
class PostPhoto(webapp2.RequestHandler):
	def post(self, layer):
		try:
			raw_content = self.request.body
			print raw_content
			json_data = json.loads(raw_content)
			print json_data
			url = json_data['url']
			caption = None
			if json_data.has_key('caption'):
				caption = json_data['caption']
			#url = "http://union.ic.ac.uk/rcc/caving/photo_archive/slovenia/highlights/Clewin_on_Concorde_2004_Photo_by_Jarvist_Frost-mediumquality.JPG";
		except:
			self.error(400)
		newPhoto = Photo(layer = layer, url = url, position=db.GeoPt(0,0), caption=caption)
		newPhoto.put()
		self.response.headers['Content-Type'] = 'application/json'
		self.response.out.write(newPhoto.asJson())

class GetLabel(webapp2.RequestHandler):
	def get(self, label_id):
		print "Trying to get label by id " + label_id
		m = Label.get_by_id(int(label_id))
		self.response.headers['Content-Type'] = 'application/json'
		self.response.out.write(m.asJson())

class GetLabels(webapp2.RequestHandler):
	def get(self, layer):
		#allLabelsQuery = Label.all()
		allLabelsQuery = db.GqlQuery("SELECT * FROM Label WHERE layer='%s'" % layer)
		allLabels = allLabelsQuery.run(batch_size=1000)
		root = {}
		labels = []
		for label in allLabels:
			labels.append(label.asDict())
			
		#labels.append({'label':'Atlantis', 'position':(51.53870, -0.01652), 'id':'123'})
		#labels.append({'label':'Cactus Junction', 'position':(0,0), 'id':'124'})
		root['labels'] = labels
		self.response.headers['Content-Type'] = 'application/json'
		self.response.out.write(json.dumps(root))

class GetPhotos(webapp2.RequestHandler):
	def get(self, layer):
		#allPhotosQuery = Photo.all()
		allPhotosQuery = db.GqlQuery("SELECT * FROM Photo WHERE layer='%s'" % layer)
		allPhotos = allPhotosQuery.run(batch_size=1000)
		root = {}
		photos = []
		for photo in allPhotos:
			photos.append(photo.asDict())
		
		root['photos'] = photos
		self.response.headers['Content-Type'] = 'application/json'
		self.response.out.write(json.dumps(root))

app = webapp2.WSGIApplication([('/', MainPage), 
('/login', Login),
('/labels/(.*)',GetLabels), 
('/photos/(.*)',GetPhotos), 
(r'/update/label/(.*)', PutLabel),
(r'/update/photo/(.*)', PutPhoto),
('/create/label/(.*)', PostLabel), 
('/create/photo/(.*)', PostPhoto), 
(r'/get/label/(.*)',GetLabel)],
                              debug=True)

