import os
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader


OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')


documents = SimpleDirectoryReader("data").load_data()
index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine()
user_question = input("Ask a question about classes: ")
level = input("Graduate level or undergraduate level?: ")
if level == "graduate":
    level = "The course code should start with a 5 or 6."
else:
    level = "The course code should start with a 1, 2, 3, or 4."
response = query_engine.query(f"{user_question}. {level} Provide the course titles, code, descriptions based only on retrieved information.The format should be: (Course Code) Course Title: Course Description.  ")
# MARK: need to do further sanitization of the response to make sure it's at the level the user indicated
print(response)

 