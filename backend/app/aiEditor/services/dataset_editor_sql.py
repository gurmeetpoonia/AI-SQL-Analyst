from app.aiEditor.services.dataset_editor_service import generate_edit_plan, preview_plan,execute_plan
from app.database import engine
def generate_edit_plan_service(
    request,
    current_user,
    db
):

    plan = generate_edit_plan(
        engine=engine,
        table_name=request.table_name,
        user_request=request.question
    )
    return plan

def execute_edit_service(
    plan,
    current_user,
    db,
    user_request="AI Dataset Edit"
):
    return execute_plan(
        db=db,
        engine=engine,
        plan=plan,
        current_user=current_user,
        user_request=user_request
    )



def preview_edit_service(
    request,
    current_user
):

    

    return preview_plan(
        engine,
        request
    )
