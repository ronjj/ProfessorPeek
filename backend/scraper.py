from bs4 import BeautifulSoup
import requests
# Scraper For Getting Courses From Cornell Course Catalog

# Get all subject codes from main course roster page
def getSubjectCodes():
    URL = "https://classes.cornell.edu/browse/roster/FA24"
    page = requests.get(URL)
    soup = BeautifulSoup(page.content, "html.parser")

    # Find all <li> elements with the class "browse-subjectcode"
    li_tags = soup.find_all('li', class_='browse-subjectcode')

    # Extract the text of each <a> tag within these <li> elements
    a_tags_text = [li.find('a').text for li in li_tags]

    return a_tags_text

def getCoursesForSubject(subject):
    URL = f"https://classes.cornell.edu/browse/roster/FA24/subject/{subject}"
    page = requests.get(URL)
    soup = BeautifulSoup(page.content, "html.parser")

    classes = []
    nodes = soup.find_all('div', class_='node')
    for node in nodes:
        try:
            title = node.find('div', class_='title-subjectcode').text.strip()
            description = node.find('p', class_='course-descr').text.strip()
            classes.append({'title': title, 'description': description})
        except:
            continue

    return classes

print(getCoursesForSubject('CS'))

