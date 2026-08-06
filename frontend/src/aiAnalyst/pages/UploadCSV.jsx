import DashboardLayout from "../../shared/layouts/DashboardLayout";

import "./../styles/UploadCSV.css";

function UploadCSV() {
    return (
        <DashboardLayout>

            <div className="upload-page">

                <div className="upload-header">

                    <h1>Upload Dataset</h1>

                    <p>
                        Upload your CSV file and start asking AI questions.
                    </p>

                </div>

                

            </div>

        </DashboardLayout>
    );
}

export default UploadCSV; 