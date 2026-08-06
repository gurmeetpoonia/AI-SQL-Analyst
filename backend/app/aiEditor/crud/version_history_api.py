from app.aiEditor.model.datasetVersion import DatasetVersion
def get_versions(

    db,

    uploaded_file_id

):

    return db.query(

        DatasetVersion

    ).filter(

        DatasetVersion.uploaded_file_id==uploaded_file_id

    ).order_by(

        DatasetVersion.version.desc()

    ).all()