from bs4 import BeautifulSoup
import requests
# Scraper For Getting Courses From Cornell Course Catalog

def getSubjectCodes():
    URL = "https://classes.cornell.edu/browse/roster/FA24"
    page = requests.get(URL)
    soup = BeautifulSoup(page.content, "html.parser")

    # Find all <li> elements with the class "browse-subjectcode"
    li_tags = soup.find_all('li', class_='browse-subjectcode')

    # Extract the text of each <a> tag within these <li> elements
    a_tags_text = [li.find('a').text for li in li_tags]

    return a_tags_text

print(getSubjectCodes())







