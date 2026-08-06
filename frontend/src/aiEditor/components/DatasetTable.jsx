import "../styles/DatasetTable.css";

function DatasetTable({ data, loading }) {

    if (loading) {
        return (
            <div className="dataset-table-loading">
                Loading dataset...
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="dataset-table-empty">
                No data found.
            </div>
        );
    }

    const columns = Object.keys(data[0]);

    return (
        <div className="dataset-table-wrapper">

            <div className="dataset-table-info">
                Showing {data.length} rows
            </div>

            <div className="dataset-table-scroll">

                <table className="dataset-table">

                    <thead>
                        <tr>
                            {columns.map((column) => (
                                <th key={column}>
                                    {column}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>

                        {data.map((row, index) => (

                            <tr key={index}>

                                {columns.map((column) => (

                                    <td key={column}>
                                        {String(row[column])}
                                    </td>

                                ))}

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>
    );
}

export default DatasetTable;