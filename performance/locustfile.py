from locust import HttpLocust, TaskSet


def index(l):
    l.client.get("/")

def aboutUs(l):
	l.client.get("/about-us.html");

def searchPostings(l):
	l.client.get("/search-postings.html");

def myProfile(l):
	l.client.get("/my-profile.html");

def createPosting(l):
	l.client.get("/create-posting.html");

def viewUsers(l):
    l.client.get("/view-users.html");

def login(l):
	l.client.post("/login", {"email":"jen@abc.com", "password":"123"});

class UserBehavior(TaskSet):
    tasks = {viewUsers: 2, index:2, aboutUs:2, createPosting:2,
     searchPostings:2, myProfile:2};

    def on_start(self):
        login(self);

class WebsiteUser(HttpLocust):
    task_set = UserBehavior
    min_wait=1000
    max_wait=3000