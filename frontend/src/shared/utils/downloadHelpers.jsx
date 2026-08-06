import toast from "react-hot-toast";

const getCSVFileName = (filename = "") => {

    if (!filename) return "dataset.csv";

    // xlsx/xls ko csv me convert karo
    if (/\.(xlsx|xls)$/i.test(filename)) {
        return filename.replace(/\.(xlsx|xls)$/i, ".csv");
    }

    // agar csv already hai to wahi return karo
    if (/\.csv$/i.test(filename)) {
        return filename;
    }

    // agar extension hi nahi hai
    return `${filename}.csv`;
};

export const downloadRowsAsCSV = (rows, filename) => {

    if (!rows || rows.length === 0) {
        toast.error("No data to download.");
        return;
    }

    const columns = Object.keys(rows[0]);

    const escapeCell = (value) => {

        if (value === null || value === undefined)
            return "";

        const str = String(value);

        if (
            str.includes(",") ||
            str.includes('"') ||
            str.includes("\n")
        ) {
            return `"${str.replace(/"/g, '""')}"`;
        }

        return str;
    };

    const csvRows = [
        columns.join(","),
        ...rows.map(row =>
            columns.map(col => escapeCell(row[col])).join(",")
        ),
    ];

    const blob = new Blob(
        [csvRows.join("\n")],
        {
            type: "text/csv;charset=utf-8;"
        }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    // ⭐ Sirf yahi line change hui hai
    link.download = getCSVFileName(filename);

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
};