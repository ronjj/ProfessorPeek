import json
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import re
import os

def load_data():
    file_path = '/Users/ronaldjabouin/Documents/ProfessorPeek/backend/evaluation_results.json'
    try:
        with open(file_path, 'r') as file:
            return json.load(file)
    except json.JSONDecodeError:
        print(f"Error: The file {file_path} is not a valid JSON file.")
        return []
    except FileNotFoundError:
        print(f"Error: The file {file_path} was not found.")
        return []

def semester_sort_key(semester):
    season, year = semester.split('  ')  # Split on double space
    return (int(year), 0 if season == 'Spring' else 1)

def extract_lecture_number(course_name):
    match = re.search(r'Lec\s*(\d+)', course_name, re.IGNORECASE)
    return match.group(1) if match else ''

def analyze_course_enrollment(data, course_prefix):
    course_data = []
    for entry in data:
        course_info = entry.get('course', {})
        course_name = course_info.get('name', '')
        if course_prefix in course_name:
            semester = entry.get('semester', 'Unknown')
            enrolled = entry.get('enrolled')
            lecture_number = extract_lecture_number(course_name)
            if semester != 'Unknown' and enrolled is not None:
                course_data.append({
                    'semester': semester,
                    'enrolled': enrolled,
                    'instructor': course_info.get('instructor', 'Unknown'),
                    'lecture_number': lecture_number
                })
    
    if not course_data:
        print(f"No data found for {course_prefix}")
        return None
    
    df = pd.DataFrame(course_data)
    df['semester_with_lecture'] = df['semester'] + ' - LEC ' + df['lecture_number']
    df = df.sort_values('semester', key=lambda x: x.map(semester_sort_key))
    
    return df

def plot_course_enrollment(df, course_prefix, output_folder):
    # Create output folder if it doesn't exist
    os.makedirs(output_folder, exist_ok=True)
    
    # Plot original data
    plt.figure(figsize=(15, 8))
    plt.plot(range(len(df)), df['enrolled'], marker='o', linestyle='-', linewidth=2, markersize=6)
    plt.title(f'{course_prefix} Enrollment Over Time', fontsize=16)
    plt.xlabel('Semester', fontsize=12)
    plt.ylabel('Number of Students Enrolled', fontsize=12)
    
    plt.xticks(range(len(df)), df['semester_with_lecture'], rotation=45, ha='right', fontsize=8)
    
    for i, txt in enumerate(df['enrolled']):
        plt.annotate(str(txt), (i, df['enrolled'].iloc[i]), 
                     textcoords="offset points", xytext=(0,5), ha='center',
                     fontsize=8, va='bottom')
    
    plt.grid(True, linestyle='--', alpha=0.7)
    plt.tight_layout()
    plt.savefig(os.path.join(output_folder, f'{course_prefix.replace(" ", "_").lower()}_enrollment_trend.png'), dpi=300)
    plt.close()
    
    # Plot with line of best fit
    plt.figure(figsize=(15, 8))
    x = np.arange(len(df))
    y = df['enrolled'].values
    
    z = np.polyfit(x, y, 1)
    p = np.poly1d(z)
    
    plt.plot(x, y, 'bo', label='Original data')
    plt.plot(x, p(x), 'r--', label='Line of best fit')
    
    plt.title(f'{course_prefix} Enrollment Trend with Line of Best Fit', fontsize=16)
    plt.xlabel('Semester', fontsize=12)
    plt.ylabel('Number of Students Enrolled', fontsize=12)
    
    plt.xticks(range(len(df)), df['semester_with_lecture'], rotation=45, ha='right', fontsize=8)
    
    plt.grid(True, linestyle='--', alpha=0.7)
    plt.legend()
    plt.tight_layout()
    plt.savefig(os.path.join(output_folder, f'{course_prefix.replace(" ", "_").lower()}_enrollment_trend_with_fit.png'), dpi=300)
    plt.close()

def provide_insights(df, course_prefix):
    if df is None or df.empty:
        return f"No insights available for {course_prefix} due to lack of data."

    total_semesters = len(df)
    avg_enrollment = df['enrolled'].mean()
    max_enrollment = df['enrolled'].max()
    min_enrollment = df['enrolled'].min()
    max_semester = df.loc[df['enrolled'].idxmax(), 'semester_with_lecture']
    min_semester = df.loc[df['enrolled'].idxmin(), 'semester_with_lecture']
    
    recent_trend = 'increasing' if df['enrolled'].iloc[-1] > df['enrolled'].iloc[-2] else 'decreasing'
    
    # Calculate overall trend
    x = np.arange(len(df))
    y = df['enrolled'].values
    z = np.polyfit(x, y, 1)
    slope = z[0]
    
    overall_trend = "increasing" if slope > 0 else "decreasing"
    
    insights = f"""
    Insights into {course_prefix} Enrollment:
    1. Data spans {total_semesters} semesters/sections.
    2. Average enrollment: {avg_enrollment:.2f} students.
    3. Highest enrollment: {max_enrollment} students in {max_semester}.
    4. Lowest enrollment: {min_enrollment} students in {min_semester}.
    5. Recent trend: Enrollment is {recent_trend} based on the last two data points.
    6. Overall trend: Enrollment is {overall_trend} based on the line of best fit.
    7. Instructors: {', '.join(df['instructor'].unique())}
    """
    return insights

def main():
    course_prefix = "CS  2110"  # Change this string to analyze different courses
    
    data = load_data()
    if not data:
        print("No data to analyze. Exiting.")
        return

    df = analyze_course_enrollment(data, course_prefix)
    
    if df is not None and not df.empty:
        output_folder = f"{course_prefix.replace(' ', '_').lower()}-info"
        plot_course_enrollment(df, course_prefix, output_folder)
        insights = provide_insights(df, course_prefix)
        print(insights)
        print(f"Analysis complete. Check the '{output_folder}' folder for enrollment trend visualizations.")
    else:
        print(f"No analysis could be performed for {course_prefix} due to lack of data")

if __name__ == "__main__":
    main()
