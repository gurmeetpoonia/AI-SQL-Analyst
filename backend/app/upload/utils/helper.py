import os 
import re
from sqlalchemy import inspect
SQL_RESERVED_WORDS = {
    "select",
    "table",
    "order",
    "group",
    "where",
    "from",
    "insert",
    "update",
    "delete",
    "join",
    "index"
}

def gerenate_table_name( filename: str):

    name=os.path.splitext(filename)[0]
    name=name.lower()
    name=name.replace(" ","_")
    name=re.sub(r"[^a-zA-Z0-9_]","",name)
    if name in SQL_RESERVED_WORDS:
        name = f"tbl_{name}"
    return name


def get_unique_table_name(engine, table_name: str):

    inspector = inspect(engine)

    existing_tables = inspector.get_table_names()

    if table_name not in existing_tables:
        return table_name

    counter = 1

    while True:

        new_name = f"{table_name}_{counter}"

        if new_name not in existing_tables:
            return new_name

        counter += 1