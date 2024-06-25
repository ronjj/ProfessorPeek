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


    URL = f"https://classes.cornell.edu/browse/roster/FA24/subject/{subject}"
    page = requests.get(URL)
    soup = BeautifulSoup(page.content, "html.parser")

    classes = []
    nodes = soup.find_all('div', class_='node')
    for node in nodes:
        try:
            course_code = node.find('div', class_='title-subjectcode').text.strip()
            # Extract course code number
            course_code_number = course_code.split()[-1]
            course_page_url = f"https://classes.cornell.edu/browse/roster/FA24/class/{subject}/{course_code_number}"
            course_page = requests.get(course_page_url)
            course_soup = BeautifulSoup(course_page.content, "html.parser")

            # Get course details from the individual course page
            course_title = course_soup.find('div', class_='title-subjectcode').text.strip()
            course_description = course_soup.find('p', class_='course-descr').text.strip()
            classes.append({'code': course_code, 'title': course_title, 'description': course_description})
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
                file.write(f"Course Code: {cls['code']}\n")
                file.write(f"Course Title: {cls['title']}\n")
                file.write(f"Description: {cls['description']}\n")
                file.write("\n")

        print("Created text file for subject: ", subject)
    else:
        for cls in classes:
            print(f"Course Code: {cls['code']}")
            print(f"Course Title: {cls['title']}")
            print(f"Description: {cls['description']}")
            print("\n")
    URL = f"https://classes.cornell.edu/browse/roster/FA24/subject/{subject}"
    page = requests.get(URL)
    soup = BeautifulSoup(page.content, "html.parser")

    classes = []
    nodes = soup.find_all('div', class_='node')
    main_element = nodes[1]
    print(main_element)
    try:
        course_code = main_element.find('div', class_='title-subjectcode').text.strip()
        print(course_code)
        course_code_number = course_code.split(" ")[1]
        print(course_code_number)
        COURSE_PAGE = requests.get(COURSE_URL)
        course_soup = BeautifulSoup(COURSE_PAGE.content, "html.parser")
        
        COURSE_URL = f"https://classes.cornell.edu/browse/roster/FA24/class/{subject}/{course_code_number}"
        course_code = course_soup.find('div', class_='title-subjectcode').text.strip()
        course_title = course_soup.find('a', class_='dtitle-CS1110').text.strip()
        course_description = course_soup.find('p', class_='catalog-descr').text.strip()
        classes.append({'code': course_code, 'title': course_title, 'description': course_description})
    except Exception as e:
        print(e)
    
    print(classes)

def getCoursesForSubjectDetailed(subject, create_text_file=False):
    URL = f"https://classes.cornell.edu/browse/roster/FA24/subject/{subject}"
    page = requests.get(URL)
    soup = BeautifulSoup(page.content, "html.parser")

    classes = []
    nodes = soup.find_all('div', class_='node')
    for node in nodes:
        try:
            course_code = node.find('div', class_='title-subjectcode').text.strip()
            course_code_number = node['data-catalog-nbr']
            course_page_url = f"https://classes.cornell.edu/browse/roster/FA24/class/{subject}/{course_code_number}"
            course_page = requests.get(course_page_url)
            course_soup = BeautifulSoup(course_page.content, "html.parser")

            # Get course details from the individual course page
            course_title = course_soup.find('div', class_='title-coursedescr').find('a').text.strip()
            course_description = course_soup.find('p', class_='catalog-descr').text.strip()
            classes.append({'code': course_code, 'title': course_title, 'description': course_description})
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
                file.write(f"Course Code: {cls['code']}\n")
                file.write(f"Course Title: {cls['title']}\n")
                file.write(f"Description: {cls['description']}\n")
                file.write("\n")

        print("Created text file for subject: ", subject)
    else:
        for cls in classes:
            print(f"Course Code: {cls['code']}")
            print(f"Course Title: {cls['title']}")
            print(f"Description: {cls['description']}")
            print("\n")
    URL = f"https://classes.cornell.edu/browse/roster/FA24/subject/{subject}"
    page = requests.get(URL)
    soup = BeautifulSoup(page.content, "html.parser")

    classes = []
    nodes = soup.find_all('div', class_='node')
    for node in nodes:
        try:
            course_code = node.find('div', class_='title-subjectcode').text.strip()
            # Extract course code number
            course_code_number = course_code.split()[-1]
            course_page_url = f"https://classes.cornell.edu/browse/roster/FA24/class/{subject}/{course_code_number}"
            course_page = requests.get(course_page_url)
            course_soup = BeautifulSoup(course_page.content, "html.parser")

            # Get course details from the individual course page
            course_title = course_soup.find('div', class_='title-subjectcode').text.strip()
            course_description = course_soup.find('p', class_='course-descr').text.strip()
            classes.append({'code': course_code, 'title': course_title, 'description': course_description})
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
            print("\n")  

# print(getCoursesForSubject("AEM", create_text_file=False))
print(getCoursesForSubjectDetailed("CS", create_text_file=False))

# if __name__ == "__main__":
#     subjectCodes = getSubjectCodes()
#     for subject in subjectCodes:
#         getCoursesForSubject(subject)
#     print("Finished scraping all subjects")



