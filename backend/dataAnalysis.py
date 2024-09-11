import json
import pandas as pd
import matplotlib.pyplot as plt

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

def analyze_cs1110_enrollment(data):
    cs1110_data = []
    for entry in data:
        course_info = entry.get('course', {})
        course_name = course_info.get('name', '')
        if 'CS  1110' in course_name:  # Note the two spaces
            semester = entry.get('semester', 'Unknown')
            enrolled = entry.get('enrolled')
            if semester != 'Unknown' and enrolled is not None:
                cs1110_data.append({
                    'semester': semester,
                    'enrolled': enrolled,
                    'instructor': course_info.get('instructor', 'Unknown')
                })
    
    if not cs1110_data:
        print("No data found for CS  1110")
        return None
    
    df = pd.DataFrame(cs1110_data)
    df = df.sort_values('semester', key=lambda x: x.map(semester_sort_key))
    
    return df

def plot_cs1110_enrollment(df):
    plt.figure(figsize=(15, 8))
    plt.plot(range(len(df)), df['enrolled'], marker='o', linestyle='-', linewidth=2, markersize=6)
    plt.title('CS  1110 Enrollment Over Time', fontsize=16)
    plt.xlabel('Semester', fontsize=12)
    plt.ylabel('Number of Students Enrolled', fontsize=12)
    
    # Adjust x-axis labels
    plt.xticks(range(len(df)), df['semester'], rotation=45, ha='right', fontsize=8)
    
    # Add value labels for each point with smaller font
    for i, txt in enumerate(df['enrolled']):
        plt.annotate(str(txt), (i, df['enrolled'].iloc[i]), 
                     textcoords="offset points", xytext=(0,5), ha='center',
                     fontsize=8, va='bottom')
    
    plt.grid(True, linestyle='--', alpha=0.7)
    plt.tight_layout()
    plt.savefig('cs1110_enrollment_trend.png', dpi=300)  # Increased DPI for better quality
    plt.close()

def provide_insights(df):
    if df is None or df.empty:
        return "No insights available for CS  1110 due to lack of data."

    total_semesters = len(df)
    avg_enrollment = df['enrolled'].mean()
    max_enrollment = df['enrolled'].max()
    min_enrollment = df['enrolled'].min()
    max_semester = df.loc[df['enrolled'].idxmax(), 'semester']
    min_semester = df.loc[df['enrolled'].idxmin(), 'semester']
    
    recent_trend = 'increasing' if df['enrolled'].iloc[-1] > df['enrolled'].iloc[-2] else 'decreasing'
    
    insights = f"""
    Insights into CS  1110 Enrollment:
    1. Data spans {total_semesters} semesters.
    2. Average enrollment: {avg_enrollment:.2f} students.
    3. Highest enrollment: {max_enrollment} students in {max_semester}.
    4. Lowest enrollment: {min_enrollment} students in {min_semester}.
    5. Recent trend: Enrollment is {recent_trend} based on the last two data points.
    6. Instructors: {', '.join(df['instructor'].unique())}
    """
    return insights

def main():
    data = load_data()
    if not data:
        print("No data to analyze. Exiting.")
        return

    df = analyze_cs1110_enrollment(data)
    
    if df is not None and not df.empty:
        plot_cs1110_enrollment(df)
        insights = provide_insights(df)
        print(insights)
        print("Analysis complete. Check 'cs1110_enrollment_trend.png' for the enrollment trend visualization.")
    else:
        print("No analysis could be performed for CS  1110 due to lack of data")

if __name__ == "__main__":
    main()
