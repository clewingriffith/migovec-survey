import webapp2
import json
from google.appengine.api import users


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

class GetLabels(webapp2.RequestHandler):
	def get(self):
		root = {}
		labels = []
		labels.append({'label':'Atlantis', 'position':(51.53870, -0.01652), 'id':'123'})
		labels.append({'label':'Cactus Junction', 'position':(0,0), 'id':'124'})
		root['labels'] = labels
		self.response.headers['Content-Type'] = 'application/json'
		self.response.out.write(json.dumps(root))

app = webapp2.WSGIApplication([('/', MainPage), ('/login', Login), ('/labels',GetLabels)],
                              debug=True)

