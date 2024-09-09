import os
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# Base URL
base_url = "https://apps.engineering.cornell.edu/CourseEval/crseval/results"

# Setup Chrome options
chrome_options = webdriver.ChromeOptions()
# Uncomment the next line to run Chrome in headless mode
# chrome_options.add_argument("--headless")

# Setup the Chrome driver
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)

def get_course_subject_codes(driver):
    subject_elements = driver.find_elements(By.CSS_SELECTOR, "ul li a")
    subject_codes = [element.text for element in subject_elements]
    return subject_codes

def process_subject_page(driver, subject_code):
    # TODO: Implement operations for each subject page
    print(f"Processing subject: {subject_code}")
    
    # Placeholder for operations
    # Add your code here to perform operations on the subject page
    # For example:
    # - Extract course information
    # - Collect statistics
    # - Download data
    # etc.
    
    print(f"Finished processing subject: {subject_code}")

try:
    # Navigate to the base URL
    driver.get(base_url)

    # Wait for the login page to load
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "username"))
    )

    # Get login credentials from environment variables
    username = os.environ.get('NETID')
    password = os.environ.get('CORNELL')

    if not username or not password:
        raise ValueError("NETID or CORNELL environment variable is not set")

    # Perform login
    username_input = driver.find_element(By.ID, "username")
    password_input = driver.find_element(By.ID, "password")
    login_button = driver.find_element(By.CSS_SELECTOR, "input[name='_eventId_proceed'][type='submit']")

    username_input.send_keys(username)
    password_input.send_keys(password)
    login_button.click()

    # Wait for 20 seconds
    print("Waiting for 20 seconds after form submission...")
    time.sleep(20)

    # After waiting, try to find the first semester link
    try:
        first_semester = driver.find_element(By.CSS_SELECTOR, "ul li a")
        semester_text = first_semester.text
        semester_href = first_semester.get_attribute("href")

        print(f"First semester: {semester_text}")
        print(f"Link: {semester_href}")
        print("Successfully logged in and found the first semester")

        # Navigate to the semester page
        driver.get(semester_href)

        # Wait for the page to load
        time.sleep(10)  # Adjust this wait time if needed

        # Get the course subject codes
        subject_codes = get_course_subject_codes(driver)

        print("Course subject codes:")
        print(subject_codes)
        print(f"Total number of subject codes: {len(subject_codes)}")

        # Iterate over each subject code
        for subject_code in subject_codes:
            try:
                subject_url = f"https://apps.engineering.cornell.edu/CourseEval/crseval/results/index.cfm?Semester=2023FA&Dept={subject_code}"
                driver.get(subject_url)
                
                # Wait for the page to load (adjust time if needed)
                time.sleep(5)
                
                # Process the subject page
                process_subject_page(driver, subject_code)
                
                # Optional: Add a short delay between requests to avoid overloading the server
                time.sleep(2)
            
            except Exception as e:
                print(f"Error processing subject {subject_code}: {e}")
                continue  # Continue with the next subject even if there's an error
        
        print("Finished processing all subjects")

    except Exception as e:
        print(f"Error while processing semester page: {e}")

    print(f"Final URL: {driver.current_url}")

except Exception as e:
    print(f"An error occurred: {e}")

finally:
    # Close the browser
    driver.quit()
