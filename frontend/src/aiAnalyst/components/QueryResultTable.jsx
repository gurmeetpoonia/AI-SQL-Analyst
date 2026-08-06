import { useState, useRef, useEffect } from "react";
import { FaSearch, FaTable, FaDownload, FaCheck } from "react-icons/fa";
import "../styles/queryTable.css";

function DownloadCSVButton({ rows }) {
  const [copied, setCopied] = useState(false);
  
  const downloadCSV = () => {
    if (!rows || rows.length === 0) return;
    const headers = Object.keys(rows[0]).join(",");
    const csvRows = rows.map((row) =>
      Object.values(row)
        .map((val) => `"${val !== null ? String(val).replace(/"/g, '""') : ""}"`)
        .join(",")
    );
    const blob = new Blob([[headers, ...csvRows].join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "query_result.csv";
    a.click();
    window.URL.revokeObjectURL(url);

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button className={`action-pill-btn ${copied ? "success" : ""}`} onClick={downloadCSV}>
      {copied ? <FaCheck /> : <FaDownload />}
      <span>{copied ? "Downloaded" : "Download CSV"}</span>
    </button>
  );
}

function QueryResultTable({ rows }) {
  if (!rows || rows.length === 0) return null;

  const columns = Object.keys(rows[0]);
  const [search, setSearch] = useState("");


  const [showSearch, setShowSearch] = useState(false);
const searchRef = useRef(null);

useEffect(() => {
  if (showSearch) {
    searchRef.current?.focus();
  }
}, [showSearch]);

  const filteredRows = rows.filter((row) =>
    Object.values(row).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="query-table-box">
      <div className="table-header">
        <div className="table-title">
          <div className="header-badge purple-badge">
            <FaTable />
          </div>
          <h2>Query Result</h2>
        </div>

        <div className="table-actions">
          {showSearch ? (
            <div className="search-container expanded">
              <FaSearch className="search-icon" />

              <input
                ref={searchRef}
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onBlur={() => {
                  if (!search.trim()) {
                    setShowSearch(false);
                  }
                }}
                className="search-input"
              />
            </div>
          ) : (
            <button
              className="search-toggle-btn"
              onClick={() => setShowSearch(true)}
              title="Search"
            >
              <FaSearch />
            </button>
          )}
          <DownloadCSVButton rows={rows} />
        </div>
      </div>

      <div className="table-scroll">
        <table className="result-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={column}>
                    {row[column] !== null ? String(row[column]) : "-"}
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

export default QueryResultTable;