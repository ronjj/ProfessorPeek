from flask import Flask, request, jsonify, make_response
import requests
import os
import json
from flask_cors import CORS

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
        return (response.text)
    else:
        return error_message("Method not allowed", 405)
        
   


def _build_cors_preflight_response():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add('Access-Control-Allow-Headers', "*")
    response.headers.add('Access-Control-Allow-Methods', "*")
    return response

def _corsify_actual_response(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response
# Run Server
if __name__ == '__main__':
    app.run (app.run(debug=True))
   