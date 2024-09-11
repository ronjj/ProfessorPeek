import os
import json
import PyPDF2
import re

def extract_instructor(line):
    match = re.search(r'Instructor:\s*([^C]+)College', line)
    if match:
        return match.group(1).strip()
    return ""

def safe_float_convert(value):
    try:
        return float(value.rstrip('.'))
    except ValueError:
        print(f"Warning: Could not convert '{value}' to float. Using 0.0 instead.")
        return 0.0

def parse_pdf_content(pdf_content):
    lines = pdf_content.split('\n')
    result = {}
    evaluations = []
    current_question = None

    for i, line in enumerate(lines):
        line = line.strip()
        
        if line.startswith("Semester:"):
            result['semester'] = line.split(":", 1)[1].strip()
        elif line.startswith("Course:"):
            result['course'] = {
                'name': line.split(":", 1)[1].strip(),
                'instructor': ''
            }
        elif "Responses," in line and "Enrolled," in line and "Response" in line:
            parts = line.split()
            result['responses'] = int(parts[0])
            result['enrolled'] = int(parts[2])
            result['response_rate'] = float(parts[4].rstrip('%'))
            result['course']['instructor'] = extract_instructor(line)
        elif re.match(r'^\d+\s+\d+\s+\d+\s+\d+\s+\d+\s+\d+\s+[\d.]+', line):
            parts = line.split()
            if len(parts) >= 7:
                current_question = {
                    'responses': {
                        '1': int(parts[0]),
                        '2': int(parts[1]),
                        '3': int(parts[2]),
                        '4': int(parts[3]),
                        '5': int(parts[4])
                    },
                    'total': int(parts[5]),
                    'mean': safe_float_convert(parts[6]),
                    'question': ''
                }
                # Extract question text from the remaining part of the line and subsequent lines
                question_text = ' '.join(parts[7:])
                while i + 1 < len(lines) and not re.match(r'^\d+\s+\d+\s+\d+\s+\d+\s+\d+\s+\d+\s+[\d.]+', lines[i+1]):
                    i += 1
                    question_text += ' ' + lines[i].strip()
                current_question['question'] = question_text.strip()
                evaluations.append(current_question)
                current_question = None

    result['evaluations'] = evaluations
    return result

def process_pdf_file(file_path, is_first_pdf=False):
    try:
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            pdf_content = ''
            for page in reader.pages:
                pdf_content += page.extract_text() + '\n'
        
        if is_first_pdf:
            print("Debug: Full content of the first PDF:")
            print(pdf_content)
            print("End of first PDF content")
        
        result = parse_pdf_content(pdf_content)
        if result:
            result['file_path'] = file_path
        return result
    except Exception as e:
        print(f"Error processing {file_path}: {str(e)}")
        return None

def process_directory(root_dir):
    all_results = []
    is_first_pdf = True

    for subject in os.listdir(root_dir):
        subject_path = os.path.join(root_dir, subject)
        if os.path.isdir(subject_path):
            subject_processed = False
            for pdf_file in os.listdir(subject_path):
                if pdf_file.endswith('.pdf'):
                    pdf_path = os.path.join(subject_path, pdf_file)
                    result = process_pdf_file(pdf_path, is_first_pdf)
                    if result:
                        result['subject'] = subject
                        all_results.append(result)
                        if not subject_processed:
                            print(f"Processed: {subject}")
                            subject_processed = True
                    if is_first_pdf:
                        is_first_pdf = False

    return all_results

# Usage
root_directory = '/Users/ronaldjabouin/Documents/ProfessorPeek/backend/course-evals'
results = process_directory(root_directory)

# Output the results in JSON format
print(json.dumps(results, indent=2))

# Save results to a file
with open('evaluation_results.json', 'w') as f:
    json.dump(results, f, indent=2)

print(f"Results saved to evaluation_results.json")
