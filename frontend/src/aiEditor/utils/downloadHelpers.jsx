import toast from "react-hot-toast";
import { downloadRowsAsCSV } from "../../shared/utils/downloadHelpers";

export const handleDownloadCSV = ({
    rows,
    filename
}) => {

    try {

        if (!rows || rows.length === 0) {
            toast.error("No data available to download.");
            return false;
        }

        downloadRowsAsCSV(rows, filename);

        toast.success("Download started");

        return true;

    } catch (error) {

        console.error(error);

        toast.error("Download failed.");

        return false;

    }

};