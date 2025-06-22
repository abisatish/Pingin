from sqlmodel import Session, create_engine
import os

engine = create_engine(os.getenv("DATABASE_URL"), echo=True)

def get_db():
    with Session(engine) as session:
        yield session
