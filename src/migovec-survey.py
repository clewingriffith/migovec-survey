import webapp2
import json
from google.appengine.api import users
from google.appengine.ext import db

class Label(db.Model):
	text_en = db.StringProperty(required=True)
	position = db.GeoPtProperty(required=True)
	def asJson(self):
		return json.dumps(self.asDict())
	def asDict(self):
		dic = {'id': self.key().id(), 'text_en':self.text_en, 'position':(self.position.lat, self.position.lon) }
		return dic

class MainPage(webapp2.RequestHandler):
  def get(self):
	self.redirect("static/index.html")
      #self.response.headers['Content-Type'] = 'text/html'
      #file = open("static/index.html")
      
      #self.response.write(file.read())

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

"""
Create a new label at default position 0,0.
Returns the JSON representation of the new label, including id field.
"""
class PostLabel(webapp2.RequestHandler):
	def post(self):
		try:
			raw_content = self.request.body
			print raw_content
			json_data = json.loads(raw_content)
			print json_data
			text_en = json_data['text_en']
		except:
			self.error(400)
		newLabel = Label(text_en = text_en, position=db.GeoPt(0,0))
		newLabel.put()
		self.response.headers['Content-Type'] = 'application/json'
		self.response.out.write(newLabel.asJson())
	

class GetLabel(webapp2.RequestHandler):
	def get(self, label_id):
		print "Trying to get label by id " + label_id
		m = Label.get_by_id(int(label_id))
		self.response.headers['Content-Type'] = 'application/json'
		self.response.out.write(m.asJson())

class GetLabels(webapp2.RequestHandler):
	def get(self):
		allLabelsQuery = Label.all()
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

app = webapp2.WSGIApplication([('/', MainPage), ('/login', Login), ('/labels',GetLabels), (r'/update/label/(.*)', PutLabel), ('/create/label', PostLabel), (r'/get/label/(.*)',GetLabel)],
                              debug=True)

