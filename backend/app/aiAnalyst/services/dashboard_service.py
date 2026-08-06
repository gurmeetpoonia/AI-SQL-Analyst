from app.aiEditor.schemas.response_schemas import APIResponse

from app.aiAnalyst.crud.dashboard_crud import(
    get_total_uploaded_files,
    get_total_queries,
    get_successful_queries,
    get_failed_queries,
    get_recent_queries,
    average_execution_time,get_latest_uploaded_file
)

def get_dashboard_statistics_service(
    db,current_user
):
    total_files = get_total_uploaded_files(
    db=db,
    user_id=current_user.id
)

    total_queries=get_total_queries(
        db=db,user_id=current_user.id
    )

    successful_queries=get_successful_queries(
        db=db,
        user_id=current_user.id
    )

    failed_queries=get_failed_queries(db=db,
                                      user_id=current_user.id)

    mean_execution_time=average_execution_time(db=db,
                                                  user_id=current_user.id)
    return APIResponse(
        success=True,
        message="Dashboard statistics fetch successfully.",
        data={
           "total_files": total_files or 0,
           "total_queries": total_queries or 0,
           "successful_queries": successful_queries or 0,
           "failed_queries": failed_queries or 0,
           "mean_execution_time": round(mean_execution_time or 0,2 )
        }
    )

def get_recent_queries_service(
        db,
        current_user
):
    history=get_recent_queries(
        db=db,
        user_id=current_user.id
    )


    data=[]
    for item in history:
        data.append({
            "id": item.id,
            "question": item.question,
            "sql_query": item.sql_query,
            "status": item.status,
            "execution_time": item.execution_time,
            "created_at": item.created_at
        })
    return APIResponse(
            success=True,
            message="Recent queries fetched successfully.",
            data=data
        )

def get_current_dataset_service(
    db,
    current_user
):

    dataset = get_latest_uploaded_file(
        db,
        current_user.id
    )

    if dataset is None:

        return APIResponse(
            success=True,
            message="No dataset.",
            data=None
        )

    return APIResponse(
        success=True,
        message="Current dataset.",
        data={
            "id":dataset.id,
            "file_name":dataset.file_name,
            "table_name":dataset.table_name,
            "upload_time":dataset.upload_time
        }
    )