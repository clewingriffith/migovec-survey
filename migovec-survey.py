import webapp2

class MainPage(webapp2.RequestHandler):
  def get(self):
	self.redirect("static/index.html")
      #self.response.headers['Content-Type'] = 'text/html'
      #file = open("static/index.html")
      
      #self.response.write(file.read())

app = webapp2.WSGIApplication([('/', MainPage)],
                              debug=True)

