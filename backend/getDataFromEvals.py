import os
import json
import PyPDF2
import re

def extract_instructor(line):
    match = re.search(r'Instructor:\s*([^C]+)College', line)
    if match:
        return match.group(1).strip()
    return ""

def parse_pdf_content(pdf_content):
    lines = pdf_content.split('\n')
    result = {}
    current_question = None
    evaluations = []
    question_text = ""

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
            # Extract instructor name from the same line
            result['course']['instructor'] = extract_instructor(line)
        elif line.startswith("["):
            if current_question:
                evaluations.append(current_question)
            question_text = line
            current_question = {'question': question_text}
        elif current_question and line[0].isdigit() and '.' in line:
            current_question['question'] += "\n" + line
        elif current_question and len(line.split()) == 7 and all(part.replace('.', '').isdigit() for part in line.split()):
            parts = line.split()
            current_question['responses'] = {
                '1': int(parts[0]),
                '2': int(parts[1]),
                '3': int(parts[2]),
                '4': int(parts[3]),
                '5': int(parts[4])
            }
            current_question['total'] = int(parts[5])
            current_question['mean'] = float(parts[6])
            evaluations.append(current_question)
            current_question = None

    if current_question:
        evaluations.append(current_question)
    
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
