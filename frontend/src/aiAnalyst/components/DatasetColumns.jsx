import { useState } from "react";
import { FaChevronDown, FaChevronRight, FaColumns } from "react-icons/fa";

import "../styles/datasetColumns.css";

function DatasetColumns({ columns }) {

    const [isOpen, setIsOpen] = useState(false);

    return (

        <div className="dataset-columns">

            <button
                className="columns-header"
                onClick={() => setIsOpen(!isOpen)}
            >

                <div className="header-left">

                    <FaColumns />

                    <span>

                        Columns ({columns.length})

                    </span>

                </div>

                {
                    isOpen
                        ? <FaChevronDown />
                        : <FaChevronRight />
                }

            </button>

            {
                isOpen && (

                    <div className="columns-list">

                        {
                            columns.map((column, index) => (

                                <div
                                    key={index}
                                    className="column-item"
                                >
                                    {column}
                                </div>

                            ))
                        }

                    </div>

                )
            }

        </div>

    );

}

export default DatasetColumns; 