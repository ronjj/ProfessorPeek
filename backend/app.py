from flask import Flask, request, jsonify, make_response
import requests
import os
import json
from flask_cors import CORS
from fuzzywuzzy import fuzz


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
          for edge in edges:
            # Make sure it's the right professor
            print(edge['node']['firstName'].lower(), first_name.lower(), edge['node']['lastName'].lower(), last_name.lower())
            if edge['node']['firstName'].lower() == first_name.lower() and edge['node']['lastName'].lower() == last_name.lower():
              result = edges[0]['node']['avgRating']
              legacy_id = edges[0]['node']['legacyId']
              rmp_link = f"https://www.ratemyprofessors.com/professor/{legacy_id}"
              num_ratings = edges[0]['node']['numRatings']
              resp = make_response({"rating": result, "rmp_link": rmp_link, "num_ratings": num_ratings})
              resp.headers['Access-Control-Allow-Origin'] = '*'
              print("returing at if")
              return resp
            # Incase professor Course Roster name is different from Rate My Professor name, this still returns a rating
            # Example: Course Roster: "Stephen Marschener", Rate My Professor: "Steve Marschener"
            # There's also a case where it just returns the wrong professor entirely. Jaehee Kim for example since they 
            # don't have reviews but there are multiple professors with last name Kim.
            # Another example is Snyder

            # iterate through list again and see if levenshetein distance is close enough for any results. if so, return that element
            # else return professor not found
            elif fuzz.ratio(edge['node']['firstName'].lower(), first_name.lower()) >= 51 and edge['node']['lastName'].lower() == last_name.lower(): 
              result = edges[0]['node']['avgRating']
              legacy_id = edges[0]['node']['legacyId']
              rmp_link = f"https://www.ratemyprofessors.com/professor/{legacy_id}"
              num_ratings = edges[0]['node']['numRatings']
              resp = make_response({"rating": result, "rmp_link": rmp_link, "num_ratings": num_ratings})
              resp.headers['Access-Control-Allow-Origin'] = '*'
              print("returing at else if")
              return resp
            else: 
              print("continue")

              continue
          return {"rating": 0, "rmp_link": "None", "num_ratings": 0}
    else:
        return error_message("Method not allowed", 405)
        
def _build_cors_preflight_response():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add('Access-Control-Allow-Headers', "*")
    response.headers.add('Access-Control-Allow-Methods', "*")
    return response

# Run Server
if __name__ == '__main__':
    app.run (app.run(debug=True))
   