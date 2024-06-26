import os
import chromadb
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.core import StorageContext
from llama_index.embeddings.huggingface import HuggingFaceEmbedding

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')


embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-base-en-v1.5")


documents = SimpleDirectoryReader("data").load_data()

# save to disk
db = chromadb.PersistentClient(path="./chroma_db")
chroma_collection = db.get_or_create_collection("quickstart")
vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
storage_context = StorageContext.from_defaults(vector_store=vector_store)

index = VectorStoreIndex.from_documents(
    documents, storage_context=storage_context, embed_model=embed_model
)

# load from disk
db2 = chromadb.PersistentClient(path="./chroma_db")
chroma_collection = db2.get_or_create_collection("quickstart")
vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
index = VectorStoreIndex.from_vector_store(
    vector_store, embed_model=embed_model
)


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

 