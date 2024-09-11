import os
import time
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# Base URL
base_url = "https://apps.engineering.cornell.edu/CourseEval/crseval/results"

# Setup the Chrome driver
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))

def get_course_subject_codes(driver):
    subject_elements = driver.find_elements(By.CSS_SELECTOR, "ul li a")
    subject_codes = [element.text for element in subject_elements]
    return subject_codes

def save_cookies(driver):
    all_cookies = driver.get_cookies()
    saved_cookies = {}
    for cookie in all_cookies:
        domain = cookie['domain']
        if domain.endswith('.cornell.edu') or domain.endswith('duosecurity.com'):
            if domain not in saved_cookies:
                saved_cookies[domain] = {}
            saved_cookies[domain][cookie['name']] = cookie['value']
    return saved_cookies

def download_pdf(pdf_url, folder_path, filename, saved_cookies):
    try:
        session = requests.Session()
        for domain, cookies in saved_cookies.items():
            if domain in pdf_url:
                session.cookies.update(cookies)
        response = session.get(pdf_url)
        if response.status_code == 200:
            file_path = os.path.join(folder_path, filename)
            with open(file_path, 'wb') as file:
                file.write(response.content)
        else:
            raise Exception(f"Didn't get 200 status code. Got {response.status_code}")
    except Exception as e:
        print(f"Failed to download {filename}: {str(e)}")

def process_subject_page(driver, subject_code, saved_cookies, semester):
    folder_path = os.path.join("course-evals", semester, subject_code)
    os.makedirs(folder_path, exist_ok=True)
    
    pdf_links = driver.find_elements(By.CSS_SELECTOR, "ul li a[href$='.pdf']")
    
    for link in pdf_links:
        relative_url = link.get_attribute("href")
        filename = f"{subject_code}_{link.text.replace(', ', '_').replace(' ', '_')}.pdf"
        download_pdf(relative_url, folder_path, filename, saved_cookies)
        time.sleep(0.5)
    
    print(f"Finished processing subject: {subject_code} for {semester}")

def get_semester_codes(driver):
    semester_elements = driver.find_elements(By.CSS_SELECTOR, "ul li a")
    semester_codes = []
    for element in semester_elements:
        href = element.get_attribute("href")
        code = href.split("Semester=")[-1]
        semester_codes.append((element.text, code))
    return semester_codes

try:
    driver.get(base_url)

    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "username")))

    username = os.environ.get('NETID')
    password = os.environ.get('CORNELL')

    if not username or not password:
        raise ValueError("NETID or CORNELL environment variable is not set")

    username_input = driver.find_element(By.ID, "username")
    password_input = driver.find_element(By.ID, "password")
    login_button = driver.find_element(By.CSS_SELECTOR, "input[name='_eventId_proceed'][type='submit']")

    username_input.send_keys(username)
    password_input.send_keys(password)
    login_button.click()

    print("Waiting for 20 seconds after form submission...")
    time.sleep(20)

    # Save cookies after login
    saved_cookies = save_cookies(driver)
    print("Saved cookies:", saved_cookies)

    # Get all semester codes
    semester_codes = get_semester_codes(driver)

    for semester_text, semester_code in semester_codes:
        try:
            semester_url = f"{base_url}/index.cfm?Semester={semester_code}"
            print(f"Processing semester: {semester_text} (Code: {semester_code})")

            driver.get(semester_url)
            time.sleep(10)

            subject_codes = get_course_subject_codes(driver)

            for subject_code in subject_codes:
                try:
                    subject_url = f"{semester_url}&Dept={subject_code}"
                    driver.get(subject_url)
                    
                    time.sleep(5)
                    
                    process_subject_page(driver, subject_code, saved_cookies, semester_text)
                    
                    time.sleep(5)
                
                except Exception as e:
                    print(f"Error processing subject {subject_code} for {semester_text}: {e}")
                    continue

            print(f"Finished processing all subjects for {semester_text}")
        
        except Exception as e:
            print(f"Error processing semester {semester_text}: {e}")
            continue

    print("Finished processing all semesters")

except Exception as e:
    print(f"An error occurred: {e}")

finally:
    driver.quit()
