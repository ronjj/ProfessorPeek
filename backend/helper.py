import json
import re
from flask import jsonify

def convert_to_json(api_response_text):
    # Split the text into paragraphs based on double newlines
    paragraphs = api_response_text.split('\n\n')
    
    # Regex pattern to match the course code and name
    course_pattern = re.compile(r'\((.*?)\) (.*?):')
    
    # Initialize an empty list to store courses
    courses = []

    for paragraph in paragraphs:
        match = course_pattern.match(paragraph)
        if match:
            course_code = match.group(1)
            course_name = match.group(2)
            course_description = paragraph[len(match.group(0)):].strip()
            courses.append({
                'course_code': course_code,
                'course_name': course_name,
                'course_description': course_description
            })
    
    if not courses:
        return jsonify({'error': 'No relevant information found. Please try adjusting your search.'})
    else:
        # Convert the list of courses to a JSON string
        json_response = jsonify(courses)
        return json_response