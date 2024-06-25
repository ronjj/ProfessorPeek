from bs4 import BeautifulSoup
import requests
import os
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

def getCoursesForSubject(subject, create_text_file=False):
    URL = f"https://classes.cornell.edu/browse/roster/FA24/subject/{subject}"
    page = requests.get(URL)
    soup = BeautifulSoup(page.content, "html.parser")

    classes = []
    nodes = soup.find_all('div', class_='node')
    for node in nodes:
        try:
            course_code = node.find('div', class_='title-subjectcode').text.strip()
            description = node.find('p', class_='course-descr').text.strip()
            classes.append({'title': course_code, 'description': description})
        except:
            continue

    if create_text_file:
        # Create the 'data' directory if it doesn't exist
        if not os.path.exists('data'):
            os.makedirs('data')

        # Write the output to a file in the 'data' directory
        with open(os.path.join('data', f"{subject}.txt"), "w") as file:
            for cls in classes:
                file.write(f"Course Code: {cls['course_code']}\n")
                file.write(f"Description: {cls['description']}\n")
                file.write("\n")
    
    
        print("Created text file for subject: ", subject)
    else:
        print(classes)

print(getCoursesForSubject("AEM", create_text_file=False))
# if __name__ == "__main__":
#     subjectCodes = getSubjectCodes()
#     for subject in subjectCodes:
#         getCoursesForSubject(subject)
#     print("Finished scraping all subjects")



