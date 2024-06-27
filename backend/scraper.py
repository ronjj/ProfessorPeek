from bs4 import BeautifulSoup
import requests
import os
# Scraper For Getting Courses From Cornell Course Catalog

# Get all subject codes from main course roster page
def getSubjectCodes(semester):
    URL = f"https://classes.cornell.edu/browse/roster/{semester}"
    page = requests.get(URL)
    soup = BeautifulSoup(page.content, "html.parser")

    # Find all <li> elements with the class "browse-subjectcode"
    li_tags = soup.find_all('li', class_='browse-subjectcode')

    # Extract the text of each <a> tag within these <li> elements
    a_tags_text = [li.find('a').text for li in li_tags]

    return a_tags_text

# Get all courses from a subject with course code and truncated description
def getCoursesForSubject(subject, semester, create_text_file=False):
    assert semester.length == 4
    
    URL = f"https://classes.cornell.edu/browse/roster/{semester}/subject/{subject}"
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

def getCoursesForSubjectDetailed(subject, semester, create_text_file=False):
    URL = f"https://classes.cornell.edu/browse/roster/{semester}/subject/{subject}"
    page = requests.get(URL)
    soup = BeautifulSoup(page.content, "html.parser")

    classes = []
    nodes = soup.find_all('div', class_='node')
    for node in nodes:
        try:
            course_code = node.find('div', class_='title-subjectcode').text.strip()
            course_code_number = node['data-catalog-nbr']
            course_page_url = f"https://classes.cornell.edu/browse/roster/{semester}/class/{subject}/{course_code_number}"
            course_page = requests.get(course_page_url)
            course_soup = BeautifulSoup(course_page.content, "html.parser")

            # Get course details from the individual course page
            course_title = course_soup.find('div', class_='title-coursedescr').find('a').text.strip()
            course_description = course_soup.find('p', class_='catalog-descr').text.strip()
            classes.append({'code': course_code, 'title': course_title, 'description': course_description, 'url': course_page_url})
        except Exception as e:
            print(f"An error occurred: {e}")
            continue

    if create_text_file:
        # Create the 'data' directory if it doesn't exist
        if not os.path.exists('data'):
            os.makedirs('data')

        # Write the output to a file in the 'data' directory
        with open(os.path.join('data', f"{subject}.txt"), "w") as file:
            for cls in classes:
                file.write(f"Code: {cls['code']}\n")
                file.write(f"Title: {cls['title']}\n")
                file.write(f"Description: {cls['description']}\n")
                file.write("\n")

        print("Created text file for subject: ", subject)
    else:
        for cls in classes:
            print(f"Code: {cls['code']}")
            print(f"Title: {cls['title']}")
            print(f"Description: {cls['description']}")
            print(f"URL: {cls['url']}")
            print("\n")


# if __name__ == "__main__":
#     subjectCodes = getSubjectCodes("FA24")
#     for subject in subjectCodes:
#         getCoursesForSubjectDetailed(subject, "FA24", create_text_file=True)
#     print("Finished scraping all subjects")


# Get total number of courses from a subject
def getCoursesForSubjectDetailedNumber(subject, semester, create_text_file=False):
    URL = f"https://classes.cornell.edu/browse/roster/{semester}/subject/{subject}"
    page = requests.get(URL)
    soup = BeautifulSoup(page.content, "html.parser")

    classes = []
    nodes = soup.find_all('div', class_='node')
    for node in nodes:
        try:
            course_code = node.find('div', class_='title-subjectcode').text.strip()

            # Get course details from the individual course page
            classes.append({'code': course_code})
        except Exception as e:
            print(f"An error occurred: {e}")
            continue

    if create_text_file:
        # Create the 'data' directory if it doesn't exist
        if not os.path.exists('data'):
            os.makedirs('data')

        # Write the output to a file in the 'data' directory
        with open(os.path.join('data', f"{subject}.txt"), "w") as file:
            for cls in classes:
                file.write(f"Code: {cls['code']}\n")
                file.write(f"Title: {cls['title']}\n")
                file.write(f"Description: {cls['description']}\n")
                file.write("\n")

        print("Created text file for subject: ", subject)
    else:
        for cls in classes:
            print(f"Code: {cls['code']}")
    
    return len(classes)


subjectCodes = getSubjectCodes("FA24")
total_courses = 0
for subject in subjectCodes:
    total_courses += getCoursesForSubjectDetailedNumber(subject, "FA24", create_text_file=False)
print("Total number: ", total_courses)
print("Finished scraping all subjects")