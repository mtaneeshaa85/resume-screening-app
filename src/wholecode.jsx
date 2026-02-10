import React, { useState } from "react";
import {
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronRight,
  Upload,
  Download,
  Loader,
  Brain,
  TrendingUp,
  Home,
  FileSpreadsheet,
} from "lucide-react";
import * as XLSX from "xlsx";

const ResumeScreeningApp = ({ goBack }) => {
  const [currentPage, setCurrentPage] = useState("intro");
  const [sessionData, setSessionData] = useState({
    sessionId: null,
    sessionName: "",
    candidates: [],
    analyzedCandidates: [],
    exceptions: [],
    finalResults: { approved: [], rejected: [] },
    uploadedFileName: "",
    fileType: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const defaultExceptions = [
    "Maternity/Paternity leave (up to 1 year)",
    "Career transition period (up to 6 months)",
    "Educational pursuits (MBA, certifications, advanced degrees)",
    "Health/Family emergency leave",
    "Sabbatical or documented travel",
    "Military service",
    "Startup founding activities",
    "Family care responsibilities",
  ];

  const parseCSV = (text) => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length < 2)
      throw new Error(
        "CSV file must have at least a header row and one data row"
      );

    const parseCSVLine = (line) => {
      const result = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseCSVLine(lines[0]).map((h) =>
      h.toLowerCase().replace(/"/g, "")
    );
    const candidates = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length >= headers.length) {
        const candidate = {};
        headers.forEach((header, index) => {
          candidate[header] = (values[index] || "")
            .replace(/^"|"$/g, "")
            .trim();
        });

        if (candidate.name && (candidate.education || candidate.experience)) {
          candidates.push({
            id: i,
            name: candidate.name,
            email: candidate.email || "",
            education: candidate.education || "",
            experience: candidate.experience || "",
            phone: candidate.phone || "",
          });
        }
      }
    }

    if (candidates.length === 0)
      throw new Error("No valid candidate data found.");
    return candidates;
  };

  const parseExcel = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (jsonData.length < 2)
            throw new Error(
              "Excel file must have at least a header row and one data row"
            );

          const headers = jsonData[0].map((h) =>
            String(h).trim().toLowerCase()
          );
          const candidates = [];

          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length === 0) continue;

            const candidate = {};
            headers.forEach((header, index) => {
              candidate[header] = row[index] ? String(row[index]).trim() : "";
            });

            if (
              candidate.name &&
              (candidate.education || candidate.experience)
            ) {
              candidates.push({
                id: i,
                name: candidate.name,
                email: candidate.email || "",
                education: candidate.education || "",
                experience: candidate.experience || "",
                phone: candidate.phone || "",
              });
            }
          }

          if (candidates.length === 0)
            throw new Error("No valid candidate data found.");
          resolve(candidates);
        } catch (err) {
          reject(new Error(`Excel parsing error: ${err.message}`));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read Excel file"));
      reader.readAsArrayBuffer(file);
    });
  };

  const detectGaps = (candidate, exceptions) => {
    const education = candidate.education?.toLowerCase() || "";
    const experience = candidate.experience?.toLowerCase() || "";
    const fullText = `${education} ${experience}`;

    let gaps = [];
    let confidence = 0;

    const gapKeywords = [
      "gap",
      "unemployed",
      "break",
      "career break",
      "employment gap",
    ];
    gapKeywords.forEach((keyword) => {
      if (fullText.includes(keyword)) {
        gaps.push(`Explicit ${keyword} mentioned in resume`);
        confidence += 25;
      }
    });

    if (
      fullText.includes("currently unemployed") ||
      fullText.includes("seeking employment")
    ) {
      gaps.push("Currently unemployed or seeking employment");
      confidence += 30;
    }

    const freelanceCount = (
      fullText.match(/freelance|consultant|consulting/g) || []
    ).length;
    if (freelanceCount >= 2) {
      gaps.push("Multiple freelance/consulting periods detected");
      confidence += 20;
    }

    if (fullText.includes("career change") || fullText.includes("transition")) {
      gaps.push("Career transition period mentioned");
      confidence += 15;
    }

    const yearMatches = fullText.match(/\b(19|20)\d{2}\b/g);
    if (yearMatches && yearMatches.length >= 2) {
      const years = [...new Set(yearMatches.map((y) => parseInt(y)))].sort(
        (a, b) => a - b
      );
      for (let i = 1; i < years.length; i++) {
        const yearGap = years[i] - years[i - 1];
        if (yearGap > 1 && yearGap < 10) {
          gaps.push(
            `${yearGap} year timeline gap between ${years[i - 1]} and ${
              years[i]
            }`
          );
          confidence += yearGap * 12;
        }
      }
    }

    const exceptionLower = exceptions.map((e) => e.toLowerCase());
    const filteredGaps = gaps.filter((gap) => {
      const gapLower = gap.toLowerCase();
      return !exceptionLower.some((exc) => {
        if (
          (exc.includes("maternity") || exc.includes("paternity")) &&
          gapLower.includes("gap")
        )
          return true;
        if (
          exc.includes("career transition") &&
          (gapLower.includes("freelance") || gapLower.includes("transition"))
        )
          return true;
        return false;
      });
    });

    confidence = Math.min(95, Math.max(0, confidence));

    return {
      hasGaps: filteredGaps.length > 0,
      gaps: filteredGaps,
      confidence: filteredGaps.length > 0 ? confidence : 0,
    };
  };

  const generateCSV = (results) => {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Education",
      "Experience",
      "Status",
      "Decision Reason",
      "AI Detected Gaps",
      "AI Confidence",
    ];
    const rows = results.map((candidate) => [
      candidate.name,
      candidate.email,
      candidate.phone || "",
      candidate.education,
      candidate.experience,
      candidate.screeningStatus || "N/A",
      candidate.verificationReason || candidate.rejectionReason || "N/A",
      (candidate.gapAnalysis?.gaps || []).join("; "),
      candidate.gapAnalysis?.confidence || 0,
    ]);

    return [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const IntroPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-12">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-indigo-600 rounded-full mb-4">
            <Users size={48} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Resume Screening System
          </h1>
          <p className="text-xl text-gray-600">
            Upload data, detect gaps, make decisions, download results
          </p>
        </div>

        <div className="bg-indigo-50 p-6 rounded-lg mb-10">
          <h2 className="text-2xl font-semibold text-indigo-900 mb-4">
            Complete Workflow
          </h2>
          <ul className="space-y-3 text-gray-700">
            {[
              "Upload Data: CSV or Excel file",
              "AI Analysis: Automatic gap detection",
              "Define Exceptions: Acceptable gaps",
              "Human Review: Approve or reject",
              "Download Results: Export with decisions",
            ].map((step, i) => (
              <li key={i} className="flex items-start">
                <div className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 text-sm font-bold">
                  {i + 1}
                </div>
                <span>
                  <strong>{step.split(":")[0]}:</strong> {step.split(":")[1]}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={() => {
            setSessionData({
              sessionId: "SESSION-" + Date.now(),
              sessionName: `Screening - ${new Date().toLocaleDateString()}`,
              candidates: [],
              analyzedCandidates: [],
              exceptions: defaultExceptions,
              finalResults: { approved: [], rejected: [] },
              uploadedFileName: "",
              fileType: "",
            });
            setCurrentPage("data-upload");
          }}
          className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition flex items-center justify-center shadow-lg"
        >
          Start New Screening Session <ChevronRight className="ml-2" />
        </button>
      </div>
    </div>
  );

  const DataUploadPage = () => {
    const handleFileUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setError("");
      setLoading(true);

      try {
        const fileType = file.name.split(".").pop().toLowerCase();
        let candidates = [];

        if (fileType === "csv") {
          candidates = parseCSV(await file.text());
        } else if (fileType === "xlsx" || fileType === "xls") {
          candidates = await parseExcel(file);
        } else {
          throw new Error(
            "Unsupported file type. Please upload CSV or Excel file."
          );
        }

        setSessionData({
          ...sessionData,
          candidates,
          uploadedFileName: file.name,
          fileType,
        });
        setTimeout(() => {
          setLoading(false);
          setCurrentPage("preview-data");
        }, 500);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    const useDemoData = () => {
      const demoText = `name,email,education,experience
John Doe,john@email.com,BS Computer Science MIT (2018-2022),Software Engineer Google (2022-Present)
Jane Smith,jane@email.com,MBA Harvard (2020-2022),Consultant McKinsey (2022-2024) Currently unemployed
Mike Johnson,mike@email.com,BS Engineering (2015-2019),Engineer Tesla (2019-2021) Career break (2021-2023) Developer Amazon (2023-Present)
Sarah Williams,sarah@email.com,MS Data Science (2017-2020),Data Analyst Microsoft (2020-2022) Freelance Consultant (2022-2024)
David Brown,david@email.com,BA Business (2016-2020),Marketing Manager Apple (2020-Present)`;

      setLoading(true);
      try {
        const candidates = parseCSV(demoText);
        setSessionData({
          ...sessionData,
          candidates,
          uploadedFileName: "demo-data.csv",
          fileType: "csv",
        });
        setTimeout(() => {
          setLoading(false);
          setCurrentPage("preview-data");
        }, 500);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Upload Candidate Data
          </h1>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
              <div className="flex items-start">
                <AlertTriangle className="text-red-600 mr-3" size={20} />
                <div>
                  <p className="text-red-800 font-semibold">Upload Error</p>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="border-2 border-dashed border-indigo-300 rounded-lg p-12 text-center bg-indigo-50 mb-6">
            <Upload size={64} className="mx-auto mb-4 text-indigo-600" />
            <h3 className="font-semibold text-xl mb-2">Upload Your File</h3>
            <p className="text-gray-600 mb-6">
              CSV or Excel (.xlsx, .xls) with: name, email, education,
              experience
            </p>

            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              disabled={loading}
            />
            <label
              htmlFor="file-upload"
              className={`bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 cursor-pointer inline-flex items-center text-lg font-semibold ${
                loading ? "opacity-50" : ""
              }`}
            >
              {loading ? (
                <>
                  <Loader className="animate-spin mr-2" size={20} />
                  Processing...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="mr-2" size={20} />
                  Choose File
                </>
              )}
            </label>

            <div className="mt-6 pt-6 border-t border-indigo-200">
              <p className="text-gray-600 mb-3 text-sm">
                Or try it with sample data:
              </p>
              <button
                onClick={useDemoData}
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold"
              >
                📊 Use Demo Data (5 candidates)
              </button>
            </div>
          </div>

          <button
            onClick={() => setCurrentPage("intro")}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  };

  const PreviewDataPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Data Loaded Successfully
        </h1>
        <p className="text-gray-600 mb-6">
          File: <strong>{sessionData.uploadedFileName}</strong> •{" "}
          {sessionData.candidates.length} candidates
        </p>

        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <p className="text-green-800">
            ✓ {sessionData.candidates.length} candidates ready for AI analysis
          </p>
        </div>

        <div className="overflow-x-auto mb-6 max-h-96 overflow-y-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                {["#", "Name", "Email", "Education", "Experience"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessionData.candidates.map((c, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">{i + 1}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {c.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{c.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {c.education.substring(0, 50)}
                    {c.education.length > 50 ? "..." : ""}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {c.experience.substring(0, 50)}
                    {c.experience.length > 50 ? "..." : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={() => setCurrentPage("gap-detection")}
          className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 shadow-lg"
        >
          Proceed to AI Analysis <ChevronRight className="inline ml-2" />
        </button>
      </div>
    </div>
  );

  const GapDetectionPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Gap Detection
        </h1>
        <p className="text-gray-600 mb-8">
          Ready to analyze {sessionData.candidates.length} candidates
        </p>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <Brain className="text-purple-600 mr-4" size={40} />
            <div>
              <h3 className="font-semibold text-purple-900 mb-3">
                AI Detection Algorithms:
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  "Explicit gap keyword detection",
                  "Timeline gap calculation",
                  "Current employment status check",
                  "Freelance pattern recognition",
                  "Education-to-work transition",
                  "Exception filtering",
                  "Confidence scoring (0-95%)",
                  "Career change detection",
                ].map((alg) => (
                  <div key={alg} className="text-sm text-gray-700">
                    ✓ {alg}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setLoading(true);
            setTimeout(() => {
              const analyzed = sessionData.candidates.map((candidate) => ({
                ...candidate,
                gapAnalysis: detectGaps(candidate, sessionData.exceptions),
              }));
              setSessionData({ ...sessionData, analyzedCandidates: analyzed });
              setLoading(false);
              setCurrentPage("gap-results");
            }, 2000);
          }}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 flex items-center justify-center shadow-lg"
        >
          {loading ? (
            <>
              <Loader className="animate-spin mr-2" size={24} />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="mr-2" size={24} />
              Run AI Gap Detection
            </>
          )}
        </button>
      </div>
    </div>
  );

  const GapResultsPage = () => {
    const candidatesWithGaps = sessionData.analyzedCandidates.filter(
      (c) => c.gapAnalysis.hasGaps
    );
    const cleanCandidates = sessionData.analyzedCandidates.filter(
      (c) => !c.gapAnalysis.hasGaps
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Analysis Complete
          </h1>
          <p className="text-gray-600 mb-8">
            Issues in {candidatesWithGaps.length} of{" "}
            {sessionData.analyzedCandidates.length} candidates
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <AlertTriangle className="mx-auto mb-2 text-red-600" size={32} />
              <div className="text-3xl font-bold text-red-900">
                {candidatesWithGaps.length}
              </div>
              <div className="text-sm text-gray-600">Gaps Detected</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <CheckCircle className="mx-auto mb-2 text-green-600" size={32} />
              <div className="text-3xl font-bold text-green-900">
                {cleanCandidates.length}
              </div>
              <div className="text-sm text-gray-600">Clean Resumes</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <TrendingUp className="mx-auto mb-2 text-blue-600" size={32} />
              <div className="text-3xl font-bold text-blue-900">
                {candidatesWithGaps.length > 0
                  ? Math.round(
                      candidatesWithGaps.reduce(
                        (sum, c) => sum + c.gapAnalysis.confidence,
                        0
                      ) / candidatesWithGaps.length
                    )
                  : 0}
                %
              </div>
              <div className="text-sm text-gray-600">Avg Confidence</div>
            </div>
          </div>

          <div className="space-y-4 mb-8 max-h-96 overflow-y-auto">
            {candidatesWithGaps.map((c, i) => (
              <div
                key={i}
                className="border border-red-200 bg-red-50 rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{c.name}</h3>
                  <span className="bg-red-100 px-3 py-1 rounded-full text-sm font-medium text-red-800">
                    {c.gapAnalysis.confidence}% Confidence
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{c.email}</p>
                <div className="bg-white rounded p-4">
                  <h4 className="font-semibold text-sm mb-2">Detected Gaps:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {c.gapAnalysis.gaps.map((gap, j) => (
                      <li key={j} className="text-sm">
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
            {cleanCandidates.map((c, i) => (
              <div
                key={`clean-${i}`}
                className="border border-green-200 bg-green-50 rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-semibold">{c.name}</h3>
                  <p className="text-sm text-gray-600">{c.email}</p>
                </div>
                <CheckCircle className="text-green-500" size={24} />
              </div>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage("exception-entry")}
            className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 shadow-lg"
          >
            Continue to Exception Management{" "}
            <ChevronRight className="inline ml-2" />
          </button>
        </div>
      </div>
    );
  };

  const ExceptionEntryPage = () => {
    const [newException, setNewException] = useState("");
    const [localExceptions, setLocalExceptions] = useState(
      sessionData.exceptions
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Manage Exceptions
          </h1>
          <p className="text-gray-600 mb-8">
            Review and customize acceptable gaps
          </p>

          <div className="mb-8">
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newException}
                onChange={(e) => setNewException(e.target.value)}
                placeholder="Add exception (e.g., 'PhD studies 2019-2023')"
                className="flex-1 border border-gray-300 rounded px-4 py-3"
                onKeyPress={(e) =>
                  e.key === "Enter" &&
                  newException.trim() &&
                  (setLocalExceptions([
                    ...localExceptions,
                    newException.trim(),
                  ]),
                  setNewException(""))
                }
              />
              <button
                onClick={() =>
                  newException.trim() &&
                  (setLocalExceptions([
                    ...localExceptions,
                    newException.trim(),
                  ]),
                  setNewException(""))
                }
                className="bg-indigo-600 text-white px-6 py-3 rounded hover:bg-indigo-700 font-semibold"
              >
                Add
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {localExceptions.map((exc, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-gray-50 p-4 rounded border"
                >
                  <span className="flex-1">{exc}</span>
                  <button
                    onClick={() =>
                      setLocalExceptions(
                        localExceptions.filter((_, idx) => idx !== i)
                      )
                    }
                    className="text-red-600 hover:text-red-800 ml-4"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              setSessionData({ ...sessionData, exceptions: localExceptions });
              setCurrentPage("human-verification");
            }}
            className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 shadow-lg"
          >
            Proceed to Human Verification{" "}
            <ChevronRight className="inline ml-2" />
          </button>
        </div>
      </div>
    );
  };

  const HumanVerificationPage = () => {
    const [decisions, setDecisions] = useState({});
    const candidatesWithGaps = sessionData.analyzedCandidates.filter(
      (c) => c.gapAnalysis.hasGaps
    );
    const cleanCandidates = sessionData.analyzedCandidates.filter(
      (c) => !c.gapAnalysis.hasGaps
    );
    const allDecisionsMade = candidatesWithGaps.every((c) => decisions[c.id]);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-12">
          <h1 className="text-3xl font-bold mb-2">Human Verification</h1>
          <p className="text-gray-600 mb-4">
            Review {candidatesWithGaps.length} flagged candidates
          </p>

          <div className="bg-gray-200 rounded-full h-3 mb-6">
            <div
              className="bg-indigo-600 h-3 rounded-full transition-all"
              style={{
                width: `${
                  (Object.keys(decisions).length /
                    (candidatesWithGaps.length || 1)) *
                  100
                }%`,
              }}
            ></div>
          </div>

          <div className="space-y-6 mb-8 max-h-96 overflow-y-auto">
            {candidatesWithGaps.map((c) => (
              <div key={c.id} className="border rounded-lg p-6 bg-gray-50">
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-semibold">{c.name}</h3>
                      <p className="text-sm text-gray-600">{c.email}</p>
                    </div>
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs">
                      {c.gapAnalysis.confidence}% AI Confidence
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{c.education}</p>
                  <p className="text-sm text-gray-600">{c.experience}</p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
                  <h4 className="font-semibold text-red-900 mb-2">
                    Detected Issues:
                  </h4>
                  <ul className="list-disc list-inside">
                    {c.gapAnalysis.gaps.map((gap, i) => (
                      <li key={i} className="text-sm">
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      setDecisions({
                        ...decisions,
                        [c.id]: {
                          decision: "approve",
                          reason: "Acceptable gap",
                        },
                      })
                    }
                    className={`flex-1 py-3 rounded font-semibold ${
                      decisions[c.id]?.decision === "approve"
                        ? "bg-green-600 text-white"
                        : "bg-green-100 text-green-800 hover:bg-green-200"
                    }`}
                  >
                    <CheckCircle className="inline mr-2" size={20} />
                    Approve
                  </button>
                  <button
                    onClick={() =>
                      setDecisions({
                        ...decisions,
                        [c.id]: {
                          decision: "reject",
                          reason: "Unacceptable gap",
                        },
                      })
                    }
                    className={`flex-1 py-3 rounded font-semibold ${
                      decisions[c.id]?.decision === "reject"
                        ? "bg-red-600 text-white"
                        : "bg-red-100 text-red-800 hover:bg-red-200"
                    }`}
                  >
                    <XCircle className="inline mr-2" size={20} />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              const approved = [];
              const rejected = [];
              sessionData.analyzedCandidates.forEach((c) => {
                const decision = decisions[c.id];
                if (c.gapAnalysis.hasGaps) {
                  if (decision?.decision === "approve") {
                    approved.push({
                      ...c,
                      screeningStatus: "Approved",
                      verificationReason: decision.reason,
                    });
                  } else if (decision?.decision === "reject") {
                    rejected.push({
                      ...c,
                      screeningStatus: "Rejected",
                      rejectionReason: decision.reason,
                    });
                  }
                } else {
                  approved.push({
                    ...c,
                    screeningStatus: "Auto-Approved",
                    verificationReason: "No gaps detected",
                  });
                }
              });
              setSessionData({
                ...sessionData,
                finalResults: { approved, rejected },
              });
              setCurrentPage("final-results");
            }}
            disabled={!allDecisionsMade}
            className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 shadow-lg"
          >
            {allDecisionsMade ? (
              <>
                Complete Verification <ChevronRight className="inline ml-2" />
              </>
            ) : (
              `Review all candidates (${
                candidatesWithGaps.length - Object.keys(decisions).length
              } remaining)`
            )}
          </button>
        </div>
      </div>
    );
  };

  const FinalResultsPage = () => {
    const { approved, rejected } = sessionData.finalResults;
    const totalProcessed = approved.length + rejected.length;
    const allResults = [...approved, ...rejected];

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Screening Complete!</h1>
            <p className="text-gray-600 mb-6">
              {sessionData.sessionName} • {totalProcessed} candidates processed
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <CheckCircle
                  className="mx-auto mb-2 text-green-600"
                  size={32}
                />
                <div className="text-3xl font-bold text-green-900">
                  {approved.length}
                </div>
                <div className="text-sm text-gray-600">Approved</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <XCircle className="mx-auto mb-2 text-red-600" size={32} />
                <div className="text-3xl font-bold text-red-900">
                  {rejected.length}
                </div>
                <div className="text-sm text-gray-600">Rejected</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <TrendingUp className="mx-auto mb-2 text-blue-600" size={32} />
                <div className="text-3xl font-bold text-blue-900">
                  {totalProcessed > 0
                    ? Math.round((approved.length / totalProcessed) * 100)
                    : 0}
                  %
                </div>
                <div className="text-sm text-gray-600">Approval Rate</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <div className="bg-green-100 border-l-4 border-green-600 p-4 mb-4 rounded">
                <h2 className="text-xl font-bold text-green-900">
                  Approved ({approved.length})
                </h2>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {approved.map((c, i) => (
                  <div
                    key={i}
                    className="border border-green-300 bg-green-50 rounded p-3"
                  >
                    <h3 className="font-semibold">{c.name}</h3>
                    <p className="text-xs text-gray-600">{c.email}</p>
                    <p className="text-xs text-green-700 mt-1">
                      {c.verificationReason}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="bg-red-100 border-l-4 border-red-600 p-4 mb-4 rounded">
                <h2 className="text-xl font-bold text-red-900">
                  Rejected ({rejected.length})
                </h2>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {rejected.map((c, i) => (
                  <div
                    key={i}
                    className="border border-red-300 bg-red-50 rounded p-3"
                  >
                    <h3 className="font-semibold">{c.name}</h3>
                    <p className="text-xs text-gray-600">{c.email}</p>
                    <p className="text-xs text-red-700 mt-1">
                      {c.rejectionReason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
              <Download className="mr-2" size={20} />
              Download Results
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              Download CSV with all candidates and decisions
            </p>
            <button
              onClick={() => {
                const csvContent = generateCSV(allResults);
                downloadFile(
                  csvContent,
                  `screening-results-${
                    new Date().toISOString().split("T")[0]
                  }.csv`,
                  "text/csv"
                );
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold flex items-center"
            >
              <Download className="mr-2" size={20} />
              Download CSV Report
            </button>
          </div>

          <button
            onClick={() => {
              setCurrentPage("intro");
              setSessionData({
                sessionId: null,
                sessionName: "",
                candidates: [],
                analyzedCandidates: [],
                exceptions: defaultExceptions,
                finalResults: { approved: [], rejected: [] },
                uploadedFileName: "",
                fileType: "",
              });
            }}
            className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 shadow-lg flex items-center justify-center"
          >
            <Home className="mr-2" size={20} />
            Return to Home & Start New Screening
          </button>
          {goBack && (
            <button
              onClick={goBack}
              className="w-full mt-4 bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-black transition"
            >
              ← Back to EduBridge AI
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderPage = () => {
    switch (currentPage) {
      case "intro":
        return <IntroPage />;
      case "data-upload":
        return <DataUploadPage />;
      case "preview-data":
        return <PreviewDataPage />;
      case "gap-detection":
        return <GapDetectionPage />;
      case "gap-results":
        return <GapResultsPage />;
      case "exception-entry":
        return <ExceptionEntryPage />;
      case "human-verification":
        return <HumanVerificationPage />;
      case "final-results":
        return <FinalResultsPage />;
      default:
        return <IntroPage />;
    }
  };

  return (
    <div className="App">
      <div className="page-container">{renderPage()}</div>
    </div>
  );

  <div
    style={{
      maxWidth: 1400,
      margin: "0 auto",
    }}
  >
    {renderPage()}
  </div>;
};

export default ResumeScreeningApp;
