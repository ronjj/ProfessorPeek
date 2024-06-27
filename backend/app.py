from flask import Flask, request, jsonify, make_response
import requests
import os
import json
from flask_cors import CORS
from fuzzywuzzy import fuzz
import os
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from llama_index.core.prompts import PromptTemplate

from openai import OpenAI

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# Initialise Flask App
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # This allows all domains for paths under /api
basedir = os.path.abspath(os.path.dirname(__file__))

def create_app():
    app = Flask(__name__)
    # app.config.from_object("project.config")
    return app

def error_message(message, code):
    return json.dumps({"message": f"{message}", "code" : f"{code}"})

@app.route('/<last_name>/<first_name>', methods=["GET"])
def get_rate_my_professor_score(last_name, first_name):
    if request.method == "OPTIONS": # CORS preflight
      print("option request")
      return _build_cors_preflight_response()

    elif request.method == "GET":
        url = 'https://www.ratemyprofessors.com/graphql'  

        headers = {
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.7',
        'Authorization': 'Basic dGVzdDp0ZXN0',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json',
        'Cookie': 'ccpa-notice-viewed-02=true; cid=UjVMSbzN3x-20230719; userSchoolId=U2Nob29sLTI5OA==; userSchoolLegacyId=298; userSchoolName=Cornell%20University',
        'Origin': 'https://www.ratemyprofessors.com',
        'Referer': 'https://www.ratemyprofessors.com/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-GPC': '1',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 11.0; Surface Duo) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36',
        'sec-ch-ua': '"Brave";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
        'sec-ch-ua-mobile': '?1',
        'sec-ch-ua-platform': '"Android"'
    }

        query = """
    query NewSearchTeachersQuery($query: TeacherSearchQuery!, $count: Int) {
      newSearch {
        teachers(query: $query, first: $count) {
          didFallback
          edges {
            cursor
            node {
              id
              legacyId
              firstName
              lastName
              department
              departmentId
              school {
                legacyId
                name
                id
              }
              ...CompareProfessorsColumn_teacher
            }
          }
        }
      }
    }

    fragment CompareProfessorsColumn_teacher on Teacher {
      id
      legacyId
      firstName
      lastName
      school {
        legacyId
        name
        id
      }
      department
      departmentId
      avgRating
      numRatings
      wouldTakeAgainPercentRounded
      mandatoryAttendance {
        yes
        no
        neither
        total
      }
      takenForCredit {
        yes
        no
        neither
        total
      }
      ...NoRatingsArea_teacher
      ...RatingDistributionWrapper_teacher
    }

    fragment NoRatingsArea_teacher on Teacher {
      lastName
      ...RateTeacherLink_teacher
    }

    fragment RatingDistributionWrapper_teacher on Teacher {
      ...NoRatingsArea_teacher
      ratingsDistribution {
        total
        ...RatingDistributionChart_ratingsDistribution
      }
    }

    fragment RatingDistributionChart_ratingsDistribution on ratingsDistribution {
      r1
      r2
      r3
      r4
      r5
    }

    fragment RateTeacherLink_teacher on Teacher {
      legacyId
      numRatings
      lockStatus
    }
    """
        variables = {
            "query": {
                "text": last_name,
                "schoolID": "U2Nob29sLTI5OA=="
            },
            "count": 10
        }

        response = requests.post(url, headers=headers, json={'query': query, 'variables': variables})
        data = response.json()
        edges = data['data']['newSearch']['teachers']['edges']
        # Professor not found at all
        if len(edges) == 0:
            return {"rating": 0, "rmp_link": "None", "num_ratings": 0}
        else:
          seen_names = []

          # iterate over response from RateMyProfessor. If there is an exact match, return the rating
          # else, I keep track of all the professors names and similarity ratio then return. If the ratio has a match over 40, I return it,
          # else, there is no professor

          for index in range(0, len(edges)):
            # Make sure it's the right professor
            print(edges[index]['node']['firstName'].lower(), first_name.lower(), edges[index]['node']['lastName'].lower(), last_name.lower())
            if edges[index]['node']['firstName'].lower() == first_name.lower() and edges[index]['node']['lastName'].lower() == last_name.lower():
              result = edges[index]['node']['avgRating']
              legacy_id = edges[index]['node']['legacyId']
              rmp_link = f"https://www.ratemyprofessors.com/professor/{legacy_id}"
              num_ratings = edges[index]['node']['numRatings']
              resp = make_response({"rating": result, "rmp_link": rmp_link, "num_ratings": num_ratings})
              resp.headers['Access-Control-Allow-Origin'] = '*'
              print(f"returning {edges[index]['node']['firstName'].lower()}, {first_name.lower()}, {edges[index]['node']['lastName'].lower()}, {last_name.lower()}")
              return resp
            # Incase professor Course Roster name is different from Rate My Professor name, this still returns a rating
            # Example: Course Roster: "Stephen Marschener", Rate My Professor: "Steve Marschener"
            # There's also a case where it just returns the wrong professor entirely. Jaehee Kim for example since they 
            # don't have reviews but there are multiple professors with last name Kim.
            # Another example is Snyder
            else:
              seen_names.append((fuzz.ratio(edges[index]['node']['firstName'].lower(), first_name.lower()),index, edges[index]['node']['lastName'].lower()))

          # sort seen names based on ratio
          seen_names.sort(key=lambda x: x[0], reverse=True)
          # If the highest ratio is over 50 and the last name is the same, return the rating
          if seen_names[0][0] > 50 and seen_names[0][2] == last_name.lower():
            index = seen_names[0][1]
            result = edges[index]['node']['avgRating']
            legacy_id = edges[index]['node']['legacyId']
            rmp_link = f"https://www.ratemyprofessors.com/professor/{legacy_id}"
            num_ratings = edges[index]['node']['numRatings']
            resp = make_response({"rating": result, "rmp_link": rmp_link, "num_ratings": num_ratings})
            resp.headers['Access-Control-Allow-Origin'] = '*'
            print("returing at else")
            return resp
          
          else:
            resp = make_response({"rating": 0, "rmp_link": "None", "num_ratings": 0})
            resp.headers['Access-Control-Allow-Origin'] = '*'
            return resp
    else:
        return error_message("Method not allowed", 405)
        
@app.route("/query", methods=["GET"])
def query_index():
  try:
     # Get the user question from ?question="text here"
    question = request.args.get('question')



    # Basic Lllama Inddex Setup
    documents = SimpleDirectoryReader("data").load_data()
    index = VectorStoreIndex.from_documents(documents)
    query_engine = index.as_query_engine()
    # Set custom template for how to answer questions
    custom_prompt_template =(
      "You are an assistant for question-answering tasks. \n"
      "Use the following pieces of retrieved context to answer the question. \n"
      "If you don't know the answer, just say that you don't know. But, try you're best to answer the question as detailed as possible. \n"
      "Context: You have been given hundreds of text files containing all the Cornell University courses for the current semester."      
      "Question: {question}\n"
      "Answer: "
    )

    custom_prompt_template = PromptTemplate(custom_prompt_template)
    query_engine.update_prompts(
        {"response_synthesizer:refine": custom_prompt_template}
    )
    response = query_engine.query(f"{question}. The response should be in the format: (Course Code) Course Title: Course Description")
    # MARK: need to do further sanitization of the response to make sure it's at the level the user indicated
    resp = make_response(str(response)), 200
    # resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp
  except Exception as e:
    print(e)
    return error_message(f"An error occurred: {e}", 500)
  
def _build_cors_preflight_response():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add('Access-Control-Allow-Headers', "*")
    response.headers.add('Access-Control-Allow-Methods', "*")
    return response

# Run Server
if __name__ == '__main__':
    app.run (app.run(debug=True))
    
   