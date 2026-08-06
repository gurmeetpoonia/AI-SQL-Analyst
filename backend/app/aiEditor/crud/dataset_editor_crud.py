from sqlalchemy import text
import pandas as pd






def preview_query(
    engine,
    preview_sql,
    params
):

    if preview_sql is None:
        return []

    with engine.connect() as conn:

        result=conn.execute(
            text(preview_sql),
            params
        )

        df=pd.DataFrame(
            result.fetchall(),
            columns=result.keys()
        )

    return df.to_dict(
        orient="records"
    )


def execute_query(
    engine,
    sql,
    params
):

    with engine.begin() as conn:

        result=conn.execute(
            text(sql),
            params
        )

    return result.rowcount