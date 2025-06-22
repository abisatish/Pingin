from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template("""
You are a college admissions consultant.
Student profile:
{profile}

Question:
{question}

Give concise actionable advice (<= 200 words).
""")

llm = ChatOpenAI(model="gpt-4o-mini")
chain = prompt | llm

def get_advice(profile, question):
    return chain.invoke({"profile": profile, "question": question})
