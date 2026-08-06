import { FaDatabase } from "react-icons/fa";
import "../styles/datasetTabs.css";

function DatasetTabs({

    datasets,

    activeDataset,

    setActiveDataset

}) {

    if (!datasets.length) return null;

    return (

        <div className="dataset-tabs">

            {

                datasets.map((dataset) => (

                    <button

                        key={dataset.table_name}

                        className={
                            activeDataset?.table_name === dataset.table_name
                                ? "dataset-tab active"
                                : "dataset-tab"
                        }

                        onClick={() => setActiveDataset(dataset)}

                    >

                        <FaDatabase />

                        <span>

                            {dataset.filename}

                        </span>

                    </button>

                ))

            }

        </div>

    );

}

export default DatasetTabs;