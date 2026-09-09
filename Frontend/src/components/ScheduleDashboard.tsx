import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  UploadCloud,
  File,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import axios from "axios";

// TypeScript Interface data ke liye
interface ScheduleData {
  title: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

const ScheduleDashboard = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [scheduleData, setScheduleData] = useState<ScheduleData[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Drag and drop handler
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
      setScheduleData(null); // Naya file aane par purana data clear
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png"] },
    maxFiles: 1,
  });

  // API Call function
  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("scheduleImage", file);
    formData.append("departmentId", "4"); // Hardcoded for now, aap dropdown bhi laga sakte hain

    try {
      // Apne token ko localStorage ya state se layein (yahan demo token hai)
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:5000/api/schedules/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Maan lijiye API response mein data `.data` ke andar schedule array bhej raha hai
      setScheduleData(response.data.schedule || response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to upload and parse image.",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Schedule Intelligence
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Upload rosters or timetables to digitize them using Gemini AI.
            </p>
          </div>
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
            Department ID: 4
          </div>
        </div>

        {/* Drag & Drop Upload Zone */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ease-in-out
                ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"}
                ${file && !uploading ? "bg-gray-50 border-gray-300" : ""}
              `}
            >
              <input {...getInputProps()} />

              {!file ? (
                <div className="space-y-4 flex flex-col items-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2">
                    <UploadCloud size={32} />
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium text-lg">
                      Drag & drop your timetable image here
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      or click to browse from your computer (PNG, JPG)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                    <File size={32} />
                  </div>
                  <p className="text-gray-800 font-medium">{file.name}</p>
                  <p className="text-gray-500 text-sm">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center text-red-700">
                <AlertCircle size={20} className="mr-2" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Upload Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className={`px-6 py-3 rounded-lg font-medium flex items-center transition-colors
                  ${
                    !file || uploading
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                  }
                `}
              >
                {uploading ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Processing with AI...
                  </>
                ) : (
                  <>
                    Extract Schedule <span className="ml-2">→</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Data Table Section (Appears only after successful upload) */}
        {scheduleData && scheduleData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <CheckCircle size={20} className="text-green-500 mr-2" />
                Extracted Timetable
              </h2>
              <span className="text-sm text-gray-500">
                {scheduleData.length} records found
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700 uppercase font-semibold text-xs border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-lg">Subject / Duty</th>
                    <th className="px-6 py-4">Day</th>
                    <th className="px-6 py-4">Start Time</th>
                    <th className="px-6 py-4 rounded-tr-lg">End Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {scheduleData.map((item, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {item.title}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">
                          {item.dayOfWeek}
                        </span>
                      </td>
                      <td className="px-6 py-4">{item.startTime}</td>
                      <td className="px-6 py-4">{item.endTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleDashboard;
