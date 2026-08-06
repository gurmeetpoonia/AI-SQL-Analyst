import pandas as pd
import numpy as np
from sqlalchemy import text


def execute_sql(engine, sql: str):
    with engine.connect() as connection:
        result = connection.execute(text(sql))
        df = pd.DataFrame(result.fetchall(), columns=result.keys())

    # Pehle object dtype me convert karo, phir NaN ko None se replace karo —
    # warna float columns None ko wapas NaN bana dete hai (pandas ka known gotcha)
    df = df.replace([np.inf, -np.inf], np.nan)
    df = df.astype(object).where(pd.notnull(df), None)

    return df.to_dict(orient="records")