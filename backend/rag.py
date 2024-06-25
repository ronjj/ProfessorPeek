import os
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader


OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')


documents = SimpleDirectoryReader("data").load_data()
index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine()
user_question = input("Ask a question about classes: ")
response = query_engine.query(f"{user_question}. Provide the course titles, code, descriptions based only on retrieved information.The format should be: (Course Code) Course Title: Course Description  ")
print(response)

 