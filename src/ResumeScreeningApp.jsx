import React, { useState } from 'react';
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
  FileSpreadsheet
} from 'lucide-react';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application Error:', error, errorInfo);
    this.setState({ error });
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f6ff',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '40px',
            maxWidth: '500px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '10px'
            }}>
              Oops! Something went wrong
            </h1>
            <p style={{
              color: '#6b7280',
              marginBottom: '20px',
              lineHeight: '1.6'
            }}>
              We're sorry for the inconvenience. The application encountered an unexpected error.
            </p>
            <button
              onClick={this.resetError}
              style={{
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#7c3aed'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#8b5cf6'}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main App Component
const EduBridgeFullApp = () => {
  const [showHero, setShowHero] = useState(true);
  const [currentPage, setCurrentPage] = useState('intro');
  const [sessionData, setSessionData] = useState({
    sessionId: null,
    sessionName: '',
    candidates: [],
    analyzedCandidates: [],
    exceptions: [],
    finalResults: { approved: [], rejected: [] },
    uploadedFileName: '',
    fileType: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const defaultExceptions = [
    'Maternity/Paternity leave (up to 1 year)',
    'Career transition period (up to 6 months)',
    'Educational pursuits (MBA, certifications, advanced degrees)',
    'Health/Family emergency leave',
    'Sabbatical or documented travel',
    'Military service',
    'Startup founding activities',
    'Family care responsibilities'
  ];

  const styles = {
    app: {
      fontFamily: "'-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', sans-serif",
      minHeight: '100vh',
      backgroundColor: '#f8f6ff'
    },
    homeContainer: {
      display: 'flex',
      padding: '40px 20px',
      gap: '30px',
      minHeight: '100vh',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #f8f6ff, #f0e9ff)',
      animation: 'fadeSlideIn 0.8s ease'
    },
    leftSection: {
      flex: 1,
      maxWidth: '600px'
    },
    rightSection: {
      flex: 1,
      background: 'linear-gradient(135deg, #e9ddff, #f3eeff)',
      borderRadius: '24px',
      minHeight: '500px',
      display: 'none'
    },
    logo: {
      fontWeight: 'bold',
      color: '#6a3df0',
      marginBottom: '20px',
      fontSize: '18px'
    },
    heading: {
      fontSize: 'clamp(28px, 5vw, 42px)',
      marginBottom: '20px',
      lineHeight: '1.2',
      color: '#1f2937',
      fontWeight: '700'
    },
    highlight: {
      background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    text: {
      fontSize: '16px',
      color: '#6b7280',
      marginBottom: '30px',
      maxWidth: '520px',
      lineHeight: '1.6',
      fontWeight: '500'
    },
    button: {
      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      color: '#fff',
      border: 'none',
      padding: '14px 26px',
      borderRadius: '12px',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.3s ease',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
    }
  };

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      const styleSheet = document.createElement('style');
      styleSheet.textContent = `
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-animation {
          animation: spin 1s linear infinite;
        }
      `;
      document.head.appendChild(styleSheet);
    }
  }, []);

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header row and one data row');
    }

    const parseCSVLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/"/g, ''));
    const candidates = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length >= headers.length) {
        const candidate = {};
        headers.forEach((header, index) => {
          candidate[header] = (values[index] || '').replace(/^"|"$/g, '').trim();
        });

        if (candidate.name && (candidate.education || candidate.experience)) {
          candidates.push({
            id: i,
            name: candidate.name,
            email: candidate.email || '',
            education: candidate.education || '',
            experience: candidate.experience || '',
            phone: candidate.phone || ''
          });
        }
      }
    }

    if (candidates.length === 0) {
      throw new Error('No valid candidate data found. Please check your CSV format.');
    }

    return candidates;
  };

  const parseExcel = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const candidates = parseCSV(text);
          resolve(candidates);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const detectGaps = (candidate, exceptions) => {
    const education = candidate.education?.toLowerCase() || '';
    const experience = candidate.experience?.toLowerCase() || '';
    const fullText = `${education} ${experience}`;

    let gaps = [];
    let confidence = 0;

    const gapKeywords = ['gap', 'unemployed', 'break', 'career break', 'employment gap'];
    gapKeywords.forEach(keyword => {
      if (fullText.includes(keyword)) {
        gaps.push(`Explicit ${keyword} mentioned in resume`);
        confidence += 25;
      }
    });

    if (fullText.includes('currently unemployed') || fullText.includes('seeking employment') ||
      fullText.includes('currently seeking')) {
      gaps.push('Currently unemployed or seeking employment');
      confidence += 30;
    }

    const freelanceCount = (fullText.match(/freelance|consultant|consulting/g) || []).length;
    if (freelanceCount >= 2) {
      gaps.push('Multiple freelance/consulting periods detected - verify employment continuity');
      confidence += 20;
    }

    if (fullText.includes('career change') || fullText.includes('transition')) {
      gaps.push('Career transition period mentioned');
      confidence += 15;
    }

    const yearMatches = fullText.match(/\b(19|20)\d{2}\b/g);
    if (yearMatches && yearMatches.length >= 2) {
      const years = [...new Set(yearMatches.map(y => parseInt(y)))].sort((a, b) => a - b);

      for (let i = 1; i < years.length; i++) {
        const yearGap = years[i] - years[i - 1];
        if (yearGap > 1 && yearGap < 10) {
          gaps.push(`${yearGap} year timeline gap between ${years[i - 1]} and ${years[i]}`);
          confidence += yearGap * 12;
        }
      }
    }

    if (education.includes('graduated') || education.includes('degree')) {
      const eduYears = education.match(/\b(19|20)\d{2}\b/g);
      const expYears = experience.match(/\b(19|20)\d{2}\b/g);

      if (eduYears && expYears) {
        const lastEduYear = Math.max(...eduYears.map(y => parseInt(y)));
        const firstExpYear = Math.min(...expYears.map(y => parseInt(y)));
        const transitionGap = firstExpYear - lastEduYear;

        if (transitionGap > 1) {
          gaps.push(`${transitionGap} year gap between graduation (${lastEduYear}) and first employment (${firstExpYear})`);
          confidence += transitionGap * 10;
        }
      }
    }

    if (!fullText.includes('present') && !fullText.includes('current') && !fullText.includes(new Date().getFullYear().toString())) {
      const allYears = fullText.match(/\b(19|20)\d{2}\b/g);
      if (allYears) {
        const latestYear = Math.max(...allYears.map(y => parseInt(y)));
        const currentYear = new Date().getFullYear();
        if (currentYear - latestYear >= 1) {
          gaps.push(`No current employment listed - last mentioned year is ${latestYear}`);
          confidence += 20;
        }
      }
    }

    const exceptionLower = exceptions.map(e => e.toLowerCase());
    const filteredGaps = gaps.filter(gap => {
      const gapLower = gap.toLowerCase();
      return !exceptionLower.some(exc => {
        if ((exc.includes('maternity') || exc.includes('paternity')) && gapLower.includes('gap')) return true;
        if (exc.includes('career transition') && (gapLower.includes('freelance') || gapLower.includes('transition'))) return true;
        if (exc.includes('educational') && gapLower.includes('graduation')) return true;
        if (exc.includes('health') && gapLower.includes('health')) return true;
        if (exc.includes('family') && gapLower.includes('family')) return true;
        if (exc.includes('sabbatical') && gapLower.includes('sabbatical')) return true;
        if (exc.includes('military') && gapLower.includes('military')) return true;
        return false;
      });
    });

    confidence = Math.min(95, Math.max(0, confidence));

    return {
      hasGaps: filteredGaps.length > 0,
      gaps: filteredGaps,
      allDetectedGaps: gaps,
      confidence: filteredGaps.length > 0 ? confidence : 0,
      analysis: `Analyzed using pattern matching, timeline analysis, and exception filtering. ${filteredGaps.length > 0 ? `${filteredGaps.length} issue(s) identified.` : 'No significant issues found.'}`
    };
  };

  const generateCSV = (results) => {
    const headers = ['Name', 'Email', 'Phone', 'Education', 'Experience', 'Status', 'Decision Reason', 'AI Detected Gaps', 'AI Confidence'];
    const rows = results.map(candidate => [
      candidate.name,
      candidate.email,
      candidate.phone || '',
      candidate.education,
      candidate.experience,
      candidate.screeningStatus || 'N/A',
      candidate.verificationReason || candidate.rejectionReason || 'N/A',
      (candidate.gapAnalysis?.gaps || []).join('; '),
      candidate.gapAnalysis?.confidence || 0
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  };

  const downloadFile = (content, filename, type) => {
    try {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download file. Please try again.');
    }
  };

  const HeroPage = () => {
    return (
      <div style={styles.homeContainer}>
        <div style={styles.leftSection}>
          <div style={styles.logo}>🧠 FairGrade AI</div>
          <h1 style={styles.heading}>
            What AI is <br />
            <span style={styles.highlight}>Missing</span> in <br />
            Education
          </h1>
          <p style={styles.text}>
            Discover the critical gaps in AI-powered education and explore our
            human-centered solutions that bridge technology with empathy,
            creativity, and inclusivity.
          </p>
          <button
            style={styles.button}
            onClick={() => {
              setShowHero(false);
              setCurrentPage('intro');
            }}
            onMouseEnter={(e) => e.target.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.transform = 'translateY(0)'}
          >
            EXPLORE SOLUTIONS →
          </button>
        </div>
        <div style={styles.rightSection} />
      </div>
    );
  };

  const IntroPage = () => {
    const startSession = () => {
      const sessionId = 'SESSION-' + Date.now();
      setSessionData({
        sessionId,
        sessionName: `Screening - ${new Date().toLocaleDateString()}`,
        candidates: [],
        analyzedCandidates: [],
        exceptions: defaultExceptions,
        finalResults: { approved: [], rejected: [] },
        uploadedFileName: '',
        fileType: ''
      });
      setError('');
      setCurrentPage('data-upload');
    };

    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to right, #eff6ff, #e0e7ff)', padding: '2rem' }}>
        <div style={{
          maxWidth: '1024px',
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          padding: '3rem'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              display: 'inline-block',
              padding: '1rem',
              backgroundColor: '#4f46e5',
              borderRadius: '50%',
              marginBottom: '1rem'
            }}>
              <Users size={48} color="white" />
            </div>
            <h1 style={{
              fontSize: '2.25rem',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '1rem'
            }}>
              AI Resume Screening System
            </h1>
            <p style={{ fontSize: '1.25rem', color: '#4b5563' }}>
              Upload your data, detect gaps, make decisions, download results
            </p>
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{
              backgroundColor: '#eef2ff',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#312e81',
                marginBottom: '1rem'
              }}>
                Complete Workflow
              </h2>
              <ul style={{ spacing: '0.75rem', color: '#374151' }}>
                {[
                  { num: '1', title: 'Upload Data', desc: 'CSV or Excel file with candidate information' },
                  { num: '2', title: 'AI Analysis', desc: 'Automatic gap detection with confidence scoring' },
                  { num: '3', title: 'Define Exceptions', desc: 'Specify acceptable gaps (pre-loaded defaults available)' },
                  { num: '4', title: 'Human Review', desc: 'Approve or reject each flagged candidate' },
                  { num: '5', title: 'Download Results', desc: 'Export updated data with decisions in same format' }
                ].map((step) => (
                  <li key={step.num} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{
                      backgroundColor: '#4f46e5',
                      color: 'white',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '0.75rem',
                      flexShrink: 0,
                      fontSize: '0.875rem',
                      fontWeight: 'bold'
                    }}>
                      {step.num}
                    </div>
                    <span><strong>{step.title}:</strong> {step.desc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{
              backgroundColor: '#f0fdf4',
              borderLeft: '4px solid #16a34a',
              padding: '1.5rem',
              borderRadius: '0.25rem'
            }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#15803d',
                marginBottom: '0.5rem'
              }}>
                📋 Required CSV/Excel Format
              </h3>
              <p style={{ color: '#374151', marginBottom: '0.75rem' }}>
                Your file should have these columns:
              </p>
              <code style={{
                backgroundColor: 'white',
                padding: '0.5rem',
                borderRadius: '0.25rem',
                display: 'block',
                fontSize: '0.875rem',
                fontFamily: 'monospace'
              }}>
                name, email, education, experience
              </code>
              <p style={{ fontSize: '0.875rem', color: '#4b5563', marginTop: '0.5rem' }}>
                Optional: phone
              </p>
            </div>
          </div>

          <button
            onClick={startSession}
            style={{
              width: '100%',
              backgroundColor: '#4f46e5',
              color: 'white',
              padding: '1rem',
              borderRadius: '0.5rem',
              fontWeight: '600',
              fontSize: '1.125rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => e.target.backgroundColor = '#4338ca'}
            onMouseLeave={(e) => e.target.backgroundColor = '#4f46e5'}
          >
            Start New Screening Session <ChevronRight style={{ marginLeft: '0.5rem' }} />
          </button>

          <button
            onClick={() => setShowHero(true)}
            style={{
              marginTop: '1rem',
              width: '100%',
              color: '#4b5563',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'center',
              fontSize: '1rem',
              transition: 'color 0.3s'
            }}
            onMouseEnter={(e) => e.target.color = '#111827'}
            onMouseLeave={(e) => e.target.color = '#4b5563'}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  };

  const DataUploadPage = () => {
    const handleFileUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setError('');
      setLoading(true);

      try {
        const fileType = file.name.split('.').pop().toLowerCase();
        let candidates = [];

        if (fileType === 'csv') {
          const text = await file.text();
          candidates = parseCSV(text);
        } else if (fileType === 'xlsx' || fileType === 'xls') {
          candidates = await parseExcel(file);
        } else {
          throw new Error('Unsupported file type. Please upload CSV or Excel (.xlsx, .xls) file.');
        }

        if (candidates.length === 0) {
          throw new Error('No valid candidate data found in file. Please check the format.');
        }

        setSessionData({
          ...sessionData,
          candidates,
          uploadedFileName: file.name,
          fileType
        });

        setTimeout(() => {
          setLoading(false);
          setCurrentPage('preview-data');
        }, 500);

      } catch (err) {
        setError(err.message || 'Error reading file. Please check the format and try again.');
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
      setError('');
      try {
        const candidates = parseCSV(demoText);
        setSessionData({
          ...sessionData,
          candidates,
          uploadedFileName: 'demo-data.csv',
          fileType: 'csv'
        });
        setTimeout(() => {
          setLoading(false);
          setCurrentPage('preview-data');
        }, 500);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #eff6ff, #e0e7ff)',
        padding: '2rem'
      }}>
        <div style={{
          maxWidth: '1024px',
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          padding: '3rem'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h1 style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '0.5rem'
            }}>
              Upload Candidate Data
            </h1>
            <p style={{ color: '#4b5563' }}>
              Session: {sessionData.sessionName}
            </p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              ID: {sessionData.sessionId}
            </p>
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              borderLeft: '4px solid #dc2626',
              padding: '1rem',
              marginBottom: '1.5rem',
              borderRadius: '0.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <AlertTriangle style={{ color: '#dc2626', marginRight: '0.75rem', flexShrink: 0 }} size={20} />
                <div>
                  <p style={{ color: '#7f1d1d', fontWeight: '600' }}>Upload Error</p>
                  <p style={{ color: '#b91c1c', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div style={{
            border: '2px dashed #a5b4fc',
            borderRadius: '0.5rem',
            padding: '3rem',
            textAlign: 'center',
            backgroundColor: '#eef2ff',
            marginBottom: '1.5rem'
          }}>
            <Upload size={64} style={{ margin: '0 auto 1rem', color: '#4f46e5' }} />
            <h3 style={{
              fontWeight: '600',
              fontSize: '1.25rem',
              marginBottom: '0.5rem',
              color: '#111827'
            }}>
              Upload Your CSV File
            </h3>
            <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>
              CSV or Excel file with columns: <strong>name, email, education, experience</strong>
            </p>

            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="file-upload"
              disabled={loading}
            />
            <label
              htmlFor="file-upload"
              style={{
                backgroundColor: '#4f46e5',
                color: 'white',
                padding: '0.75rem 2rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                fontSize: '1.125rem',
                fontWeight: '600',
                transition: 'all 0.3s',
                opacity: loading ? 0.5 : 1,
                pointerEvents: loading ? 'none' : 'auto'
              }}
              onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#4338ca')}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#4f46e5'}
            >
              {loading ? (
                <>
                  <Loader style={{ animation: 'spin 1s linear infinite', marginRight: '0.5rem' }} size={20} />
                  Processing...
                </>
              ) : (
                <>
                  <FileSpreadsheet style={{ marginRight: '0.5rem' }} size={20} />
                  Choose File
                </>
              )}
            </label>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #a5b4fc' }}>
              <p style={{ color: '#4b5563', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                Or try it with sample data first:
              </p>
              <button
                onClick={useDemoData}
                disabled={loading}
                style={{
                  backgroundColor: '#16a34a',
                  color: 'white',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  transition: 'all 0.3s',
                  opacity: loading ? 0.5 : 1,
                  pointerEvents: loading ? 'none' : 'auto'
                }}
                onMouseEnter={(e) => !loading && (e.target.backgroundColor = '#15803d')}
                onMouseLeave={(e) => e.target.backgroundColor = '#16a34a'}
              >
                📊 Use Demo Data (5 candidates)
              </button>
            </div>
          </div>

          <div style={{
            backgroundColor: '#dbeafe',
            border: '1px solid #0284c7',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            marginBottom: '1rem'
          }}>
            <h3 style={{
              fontWeight: '600',
              color: '#0c4a6e',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center'
            }}>
              <FileText style={{ marginRight: '0.5rem' }} size={18} />
              Sample CSV Format:
            </h3>
            <pre style={{
              backgroundColor: 'white',
              padding: '1rem',
              borderRadius: '0.25rem',
              fontSize: '0.75rem',
              overflow: 'auto',
              border: '1px solid #cbd5e1',
              fontFamily: 'monospace'
            }}>
{`name,email,education,experience
John Doe,john@email.com,BS Computer Science MIT (2018-2022),Software Engineer Google (2022-Present)
Jane Smith,jane@email.com,MBA Harvard (2020-2022),Consultant McKinsey (2022-2024) Currently unemployed`}
            </pre>
          </div>

          <div style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #f59e0b',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{
              fontWeight: '600',
              color: '#78350f',
              marginBottom: '0.5rem',
              fontSize: '0.875rem'
            }}>
              ✅ File Requirements:
            </h3>
            <ul style={{
              fontSize: '0.75rem',
              color: '#92400e',
              spacing: '0.25rem'
            }}>
              {[
                'First row must contain column headers: name, email, education, experience',
                'At least one data row required',
                'Supported formats: .csv, .xlsx, .xls',
                'Optional column: phone'
              ].map((item, idx) => (
                <li key={idx} style={{ marginBottom: '0.25rem' }}>• {item}</li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => setCurrentPage('intro')}
            style={{
              color: '#4b5563',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.3s'
            }}
            onMouseEnter={(e) => e.target.color = '#111827'}
            onMouseLeave={(e) => e.target.color = '#4b5563'}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  };

  const PreviewDataPage = () => {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #eff6ff, #e0e7ff)',
        padding: '2rem'
      }}>
        <div style={{
          maxWidth: '1536px',
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          padding: '3rem'
        }}>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '0.5rem'
          }}>
            Data Loaded Successfully
          </h1>
          <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>
            File: <strong>{sessionData.uploadedFileName}</strong> • {sessionData.candidates.length} candidates found
          </p>

          <div style={{
            backgroundColor: '#f0fdf4',
            borderLeft: '4px solid #16a34a',
            padding: '1rem',
            marginBottom: '1.5rem',
            borderRadius: '0.25rem'
          }}>
            <p style={{ color: '#166534' }}>
              ✓ {sessionData.candidates.length} candidates loaded and ready for AI analysis
            </p>
          </div>

          <div style={{
            overflow: 'auto',
            marginBottom: '1.5rem',
            maxHeight: '400px',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem'
          }}>
            <table style={{
              minWidth: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead style={{
                backgroundColor: '#f9fafb',
                position: 'sticky',
                top: 0
              }}>
                <tr>
                  {['#', 'Name', 'Email', 'Education', 'Experience'].map((header) => (
                    <th key={header} style={{
                      padding: '1.5rem',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      color: '#6b7280',
                      textTransform: 'uppercase'
                    }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ borderTop: '1px solid #e5e7eb' }}>
                {sessionData.candidates.map((candidate, idx) => (
                  <tr key={idx} style={{
                    borderTop: '1px solid #e5e7eb',
                    transition: 'background-color 0.3s'
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{
                      padding: '1.5rem',
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      whiteSpace: 'nowrap'
                    }}>
                      {idx + 1}
                    </td>
                    <td style={{
                      padding: '1.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#111827'
                    }}>
                      {candidate.name}
                    </td>
                    <td style={{
                      padding: '1.5rem',
                      fontSize: '0.875rem',
                      color: '#6b7280'
                    }}>
                      {candidate.email}
                    </td>
                    <td style={{
                      padding: '1.5rem',
                      fontSize: '0.875rem',
                      color: '#4b5563'
                    }}>
                      {candidate.education.substring(0, 50)}{candidate.education.length > 50 ? '...' : ''}
                    </td>
                    <td style={{
                      padding: '1.5rem',
                      fontSize: '0.875rem',
                      color: '#4b5563'
                    }}>
                      {candidate.experience.substring(0, 50)}{candidate.experience.length > 50 ? '...' : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={() => setCurrentPage('gap-detection')}
            style={{
              width: '100%',
              backgroundColor: '#4f46e5',
              color: 'white',
              padding: '1rem',
              borderRadius: '0.5rem',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => e.target.backgroundColor = '#4338ca'}
            onMouseLeave={(e) => e.target.backgroundColor = '#4f46e5'}
          >
            Proceed to AI Analysis <ChevronRight style={{ marginLeft: '0.5rem' }} />
          </button>
        </div>
      </div>
    );
  };

  const GapDetectionPage = () => {
    const runAnalysis = () => {
      setLoading(true);

      setTimeout(() => {
        const analyzed = sessionData.candidates.map(candidate => {
          const analysis = detectGaps(candidate, sessionData.exceptions);
          return {
            ...candidate,
            gapAnalysis: analysis
          };
        });

        setSessionData({
          ...sessionData,
          analyzedCandidates: analyzed
        });
        setLoading(false);
        setCurrentPage('gap-results');
      }, 2000);
    };

    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #eff6ff, #e0e7ff)',
        padding: '2rem'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          padding: '3rem'
        }}>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '0.5rem'
          }}>
            AI Gap Detection
          </h1>
          <p style={{ color: '#4b5563', marginBottom: '2rem' }}>
            Ready to analyze {sessionData.candidates.length} candidates
          </p>

          <div style={{
            backgroundColor: '#f3e8ff',
            border: '1px solid #d8b4fe',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <Brain style={{ color: '#9333ea', marginRight: '1rem', flexShrink: 0 }} size={40} />
              <div>
                <h3 style={{
                  fontWeight: '600',
                  color: '#5b21b6',
                  marginBottom: '0.75rem'
                }}>
                  AI Detection Algorithms:
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '0.75rem'
                }}>
                  {[
                    'Explicit gap keyword detection',
                    'Timeline gap calculation',
                    'Current employment status check',
                    'Freelance pattern recognition',
                    'Education-to-work transition analysis',
                    'Exception filtering & matching',
                    'Confidence scoring (0-95%)',
                    'Career change detection'
                  ].map((algo, idx) => (
                    <div key={idx} style={{
                      fontSize: '0.875rem',
                      color: '#374151'
                    }}>
                      ✓ {algo}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#dbeafe',
            border: '1px solid #0284c7',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '2rem'
          }}>
            <p style={{ fontSize: '0.875rem', color: '#374151' }}>
              <strong>Current Exceptions:</strong> {sessionData.exceptions.length} defined exceptions will be considered during analysis
            </p>
          </div>

          <button
            onClick={runAnalysis}
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#9ca3af' : '#4f46e5',
              color: 'white',
              padding: '1rem',
              borderRadius: '0.5rem',
              fontWeight: '600',
              fontSize: '1.125rem',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => !loading && (e.target.backgroundColor = '#4338ca')}
            onMouseLeave={(e) => !loading && (e.target.backgroundColor = '#4f46e5')}
          >
            {loading ? (
              <>
                <Loader style={{ animation: 'spin 1s linear infinite', marginRight: '0.5rem' }} size={24} />
                Analyzing {sessionData.candidates.length} candidates...
              </>
            ) : (
              <>
                <Brain style={{ marginRight: '0.5rem' }} size={24} />
                Run AI Gap Detection
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  const GapResultsPage = () => {
    const candidatesWithGaps = sessionData.analyzedCandidates.filter(c => c.gapAnalysis.hasGaps);
    const cleanCandidates = sessionData.analyzedCandidates.filter(c => !c.gapAnalysis.hasGaps);

    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #eff6ff, #e0e7ff)',
        padding: '2rem'
      }}>
        <div style={{
          maxWidth: '1536px',
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          padding: '3rem'
        }}>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '0.5rem'
          }}>
            Analysis Complete
          </h1>
          <p style={{ color: '#4b5563', marginBottom: '2rem' }}>
            Issues detected in {candidatesWithGaps.length} out of {sessionData.analyzedCandidates.length} candidates
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            {[
              { icon: <AlertTriangle size={32} />, label: 'Gaps Detected', value: candidatesWithGaps.length, color: '#fee2e2', iconColor: '#dc2626' },
              { icon: <CheckCircle size={32} />, label: 'Clean Resumes', value: cleanCandidates.length, color: '#f0fdf4', iconColor: '#16a34a' },
              { icon: <TrendingUp size={32} />, label: 'Avg Confidence', value: `${candidatesWithGaps.length > 0 ? Math.round(candidatesWithGaps.reduce((sum, c) => sum + c.gapAnalysis.confidence, 0) / candidatesWithGaps.length) : 0}%`, color: '#dbeafe', iconColor: '#0284c7' }
            ].map((stat, idx) => (
              <div key={idx} style={{
                backgroundColor: stat.color,
                border: `1px solid ${stat.iconColor}`,
                borderRadius: '0.5rem',
                padding: '1rem',
                textAlign: 'center'
              }}>
                <div style={{ color: stat.iconColor, marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                  {stat.icon}
                </div>
                <div style={{
                  fontSize: '1.875rem',
                  fontWeight: 'bold',
                  color: stat.iconColor
                }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginBottom: '2rem',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {candidatesWithGaps.map((candidate, idx) => (
              <div key={idx} style={{
                border: '1px solid #fee2e2',
                backgroundColor: '#fef2f2',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem'
                    }}>
                      <h3 style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#111827'
                      }}>
                        {candidate.name}
                      </h3>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: '#fee2e2',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px'
                      }}>
                        <AlertTriangle style={{ color: '#dc2626', marginRight: '0.25rem' }} size={16} />
                        <span style={{
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#991b1b'
                        }}>
                          {candidate.gapAnalysis.confidence}% Confidence
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                      {candidate.email}
                    </p>
                  </div>
                </div>
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '0.25rem',
                  padding: '1rem'
                }}>
                  <h4 style={{
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    color: '#374151',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <AlertTriangle style={{ marginRight: '0.5rem', color: '#dc2626' }} size={16} />
                    Detected Gaps:
                  </h4>
                  <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem' }}>
                    {candidate.gapAnalysis.gaps.map((gap, gapIdx) => (
                      <li key={gapIdx} style={{
                        color: '#374151',
                        fontSize: '0.875rem',
                        marginBottom: '0.25rem'
                      }}>
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}

            {cleanCandidates.map((candidate, idx) => (
              <div key={`clean-${idx}`} style={{
                border: '1px solid #dcfce7',
                backgroundColor: '#f0fdf4',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <h3 style={{
                      fontWeight: '600',
                      color: '#111827'
                    }}>
                      {candidate.name}
                    </h3>
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#4b5563'
                    }}>
                      {candidate.email}
                    </p>
                  </div>
                  <CheckCircle style={{ color: '#10b981' }} size={24} />
                </div>
                <p style={{
                  color: '#15803d',
                  marginTop: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  ✓ No gaps detected
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage('exception-entry')}
            style={{
              width: '100%',
              backgroundColor: '#4f46e5',
              color: 'white',
              padding: '1rem',
              borderRadius: '0.5rem',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => e.target.backgroundColor = '#4338ca'}
            onMouseLeave={(e) => e.target.backgroundColor = '#4f46e5'}
          >
            Continue to Exception Management <ChevronRight style={{ marginLeft: '0.5rem' }} />
          </button>
        </div>
      </div>
    );
  };

  const ExceptionEntryPage = () => {
    const [newException, setNewException] = useState('');
    const [localExceptions, setLocalExceptions] = useState(sessionData.exceptions);

    const addException = () => {
      if (newException.trim()) {
        setLocalExceptions([...localExceptions, newException.trim()]);
        setNewException('');
      }
    };

    const removeException = (index) => {
      setLocalExceptions(localExceptions.filter((_, i) => i !== index));
    };

    const saveAndContinue = () => {
      setSessionData({
        ...sessionData,
        exceptions: localExceptions
      });
      setCurrentPage('human-verification');
    };

    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #eff6ff, #e0e7ff)',
        padding: '2rem'
      }}>
        <div style={{
          maxWidth: '1024px',
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          padding: '3rem'
        }}>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '0.5rem'
          }}>
            Manage Exceptions
          </h1>
          <p style={{ color: '#4b5563', marginBottom: '2rem' }}>
            Review and customize acceptable gaps. These will guide your decisions.
          </p>

          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="text"
                value={newException}
                onChange={(e) => setNewException(e.target.value)}
                placeholder="Add a new exception (e.g., 'PhD studies 2019-2023')"
                style={{
                  flex: 1,
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                onKeyPress={(e) => e.key === 'Enter' && addException()}
              />
              <button
                onClick={addException}
                style={{
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => e.target.backgroundColor = '#4338ca'}
                onMouseLeave={(e) => e.target.backgroundColor = '#4f46e5'}
              >
                Add
              </button>
            </div>

            <div style={{
              maxHeight: '320px',
              overflowY: 'auto'
            }}>
              {localExceptions.map((exception, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#f9fafb',
                  padding: '1rem',
                  borderRadius: '0.25rem',
                  border: '1px solid #e5e7eb',
                  marginBottom: '0.5rem',
                  transition: 'all 0.3s'
                }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#a5b4fc'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                >
                  <span style={{ color: '#374151', flex: 1 }}>
                    {exception}
                  </span>
                  <button
                    onClick={() => removeException(idx)}
                    style={{
                      color: '#dc2626',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      marginLeft: '1rem',
                      transition: 'color 0.3s'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#991b1b'}
                    onMouseLeave={(e) => e.target.style.color = '#dc2626'}
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              ))}
            </div>

            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginTop: '1rem'
            }}>
              Total exceptions: {localExceptions.length}
            </p>
          </div>

          <button
            onClick={saveAndContinue}
            style={{
              width: '100%',
              backgroundColor: '#4f46e5',
              color: 'white',
              padding: '1rem',
              borderRadius: '0.5rem',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => e.target.backgroundColor = '#4338ca'}
            onMouseLeave={(e) => e.target.backgroundColor = '#4f46e5'}
          >
            Proceed to Human Verification <ChevronRight style={{ marginLeft: '0.5rem' }} />
          </button>
        </div>
      </div>
    );
  };

  const HumanVerificationPage = () => {
    const [decisions, setDecisions] = useState({});
    const candidatesWithGaps = sessionData.analyzedCandidates.filter(c => c.gapAnalysis.hasGaps);
    const cleanCandidates = sessionData.analyzedCandidates.filter(c => !c.gapAnalysis.hasGaps);

    const makeDecision = (candidateId, decision, reason) => {
      setDecisions({
        ...decisions,
        [candidateId]: { decision, reason }
      });
    };

    const submitAllDecisions = () => {
      const approved = [];
      const rejected = [];

      sessionData.analyzedCandidates.forEach(candidate => {
        const decision = decisions[candidate.id];

        if (candidate.gapAnalysis.hasGaps) {
          if (decision?.decision === 'approve') {
            approved.push({
              ...candidate,
              screeningStatus: 'Approved',
              verificationReason: decision.reason
            });
          } else if (decision?.decision === 'reject') {
            rejected.push({
              ...candidate,
              screeningStatus: 'Rejected',
              rejectionReason: decision.reason
            });
          }
        } else {
          approved.push({
            ...candidate,
            screeningStatus: 'Auto-Approved',
            verificationReason: 'No gaps detected - automatically approved'
          });
        }
      });

      setSessionData({
        ...sessionData,
        finalResults: { approved, rejected }
      });
      setCurrentPage('final-results');
    };

    const allDecisionsMade = candidatesWithGaps.every(c => decisions[c.id]);
    const progressPercent = candidatesWithGaps.length > 0 ? (Object.keys(decisions).length / candidatesWithGaps.length) * 100 : 100;

    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #eff6ff, #e0e7ff)',
        padding: '2rem'
      }}>
        <div style={{
          maxWidth: '1536px',
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          padding: '3rem'
        }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '0.5rem'
            }}>
              Human Verification
            </h1>
            <p style={{ color: '#4b5563', marginBottom: '1rem' }}>
              Review {candidatesWithGaps.length} flagged candidates
            </p>

            <div style={{
              backgroundColor: '#e5e7eb',
              borderRadius: '9999px',
              height: '12px',
              marginBottom: '0.5rem'
            }}>
              <div
                style={{
                  backgroundColor: '#4f46e5',
                  height: '12px',
                  borderRadius: '9999px',
                  transition: 'all 0.3s',
                  width: `${progressPercent}%`
                }}
              />
            </div>
            <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
              {Object.keys(decisions).length} of {candidatesWithGaps.length} reviewed
              ({cleanCandidates.length} auto-approved)
            </p>
          </div>

          <div style={{
            backgroundColor: '#f3e8ff',
            border: '1px solid #d8b4fe',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{
              fontWeight: '600',
              color: '#5b21b6',
              marginBottom: '0.5rem'
            }}>
              Exceptions Reference:
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {sessionData.exceptions.slice(0, 5).map((exc, idx) => (
                <span
                  key={idx}
                  style={{
                    backgroundColor: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    border: '1px solid #d8b4fe'
                  }}
                >
                  {exc}
                </span>
              ))}
              {sessionData.exceptions.length > 5 && (
                <span
                  style={{
                    backgroundColor: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    border: '1px solid #d8b4fe'
                  }}
                >
                  +{sessionData.exceptions.length - 5} more
                </span>
              )}
            </div>
          </div>

          <div style={{
            marginBottom: '2rem',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {candidatesWithGaps.map((candidate) => (
              <div
                key={candidate.id}
                style={{
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                  backgroundColor: '#f9fafb',
                  marginBottom: '1.5rem'
                }}
              >
                <div style={{ marginBottom: '1rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem'
                    }}
                  >
                    <div>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#111827'
                      }}>
                        {candidate.name}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                        {candidate.email}
                      </p>
                    </div>
                    <span
                      style={{
                        backgroundColor: '#fef3c7',
                        color: '#92400e',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}
                    >
                      {candidate.gapAnalysis.confidence}% AI Confidence
                    </span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#4b5563', marginTop: '0.5rem' }}>
                    {candidate.education}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                    {candidate.experience}
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fee2e2',
                    borderRadius: '0.25rem',
                    padding: '1rem',
                    marginBottom: '1rem'
                  }}
                >
                  <h4
                    style={{
                      fontWeight: '600',
                      color: '#991b1b',
                      marginBottom: '0.5rem'
                    }}
                  >
                    Detected Issues:
                  </h4>
                  <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem' }}>
                    {candidate.gapAnalysis.gaps.map((gap, idx) => (
                      <li
                        key={idx}
                        style={{
                          color: '#374151',
                          fontSize: '0.875rem',
                          marginBottom: '0.25rem'
                        }}
                      >
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() =>
                      makeDecision(
                        candidate.id,
                        'approve',
                        'Acceptable gap - falls under defined exceptions'
                      )
                    }
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      fontWeight: '600',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      backgroundColor:
                        decisions[candidate.id]?.decision === 'approve'
                          ? '#16a34a'
                          : '#dcfce7',
                      color:
                        decisions[candidate.id]?.decision === 'approve'
                          ? 'white'
                          : '#15803d',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      if (decisions[candidate.id]?.decision !== 'approve') {
                        e.target.style.backgroundColor = '#bbf7d0';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (decisions[candidate.id]?.decision !== 'approve') {
                        e.target.style.backgroundColor = '#dcfce7';
                      }
                    }}
                  >
                    <CheckCircle style={{ marginRight: '0.5rem' }} size={20} />
                    Approve
                  </button>
                  <button
                    onClick={() =>
                      makeDecision(
                        candidate.id,
                        'reject',
                        'Unacceptable gap - does not meet criteria'
                      )
                    }
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      fontWeight: '600',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      backgroundColor:
                        decisions[candidate.id]?.decision === 'reject'
                          ? '#dc2626'
                          : '#fee2e2',
                      color:
                        decisions[candidate.id]?.decision === 'reject'
                          ? 'white'
                          : '#991b1b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      if (decisions[candidate.id]?.decision !== 'reject') {
                        e.target.style.backgroundColor = '#fecaca';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (decisions[candidate.id]?.decision !== 'reject') {
                        e.target.style.backgroundColor = '#fee2e2';
                      }
                    }}
                  >
                    <XCircle style={{ marginRight: '0.5rem' }} size={20} />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={submitAllDecisions}
            disabled={!allDecisionsMade}
            style={{
              width: '100%',
              backgroundColor: allDecisionsMade ? '#4f46e5' : '#d1d5db',
              color: 'white',
              padding: '1rem',
              borderRadius: '0.5rem',
              fontWeight: '600',
              border: 'none',
              cursor: allDecisionsMade ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow:
                allDecisionsMade ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : 'none',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              if (allDecisionsMade) {
                e.target.style.backgroundColor = '#4338ca';
              }
            }}
            onMouseLeave={(e) => {
              if (allDecisionsMade) {
                e.target.style.backgroundColor = '#4f46e5';
              }
            }}
          >
            {allDecisionsMade ? (
              <>
                Complete Verification & View Results{' '}
                <ChevronRight style={{ marginLeft: '0.5rem' }} />
              </>
            ) : (
              `Please review all candidates (${
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

    const handleDownload = () => {
      const csvContent = generateCSV(allResults);
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `screening-results-${timestamp}.csv`;
      downloadFile(csvContent, filename, 'text/csv');
    };

    const goHome = () => {
      setShowHero(true);
      setCurrentPage('intro');
      setSessionData({
        sessionId: null,
        sessionName: '',
        candidates: [],
        analyzedCandidates: [],
        exceptions: defaultExceptions,
        finalResults: { approved: [], rejected: [] },
        uploadedFileName: '',
        fileType: ''
      });
    };

    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(to right, #eff6ff, #e0e7ff)',
          padding: '2rem'
        }}
      >
        <div
          style={{
            maxWidth: '1536px',
            margin: '0 auto',
            backgroundColor: 'white',
            borderRadius: '1rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            padding: '3rem'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1
              style={{
                fontSize: '1.875rem',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '0.5rem'
              }}
            >
              Screening Complete!
            </h1>
            <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>
              {sessionData.sessionName} • {totalProcessed} candidates processed
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}
            >
              {[
                {
                  icon: <CheckCircle size={32} />,
                  label: 'Approved',
                  value: approved.length,
                  color: '#f0fdf4',
                  iconColor: '#16a34a'
                },
                {
                  icon: <XCircle size={32} />,
                  label: 'Rejected',
                  value: rejected.length,
                  color: '#fee2e2',
                  iconColor: '#dc2626'
                },
                {
                  icon: <TrendingUp size={32} />,
                  label: 'Approval Rate',
                  value: `${
                    totalProcessed > 0
                      ? Math.round((approved.length / totalProcessed) * 100)
                      : 0
                  }%`,
                  color: '#dbeafe',
                  iconColor: '#0284c7'
                }
              ].map((stat, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: stat.color,
                    border: `1px solid ${stat.iconColor}`,
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    textAlign: 'center'
                  }}
                >
                  <div
                    style={{
                      color: stat.iconColor,
                      marginBottom: '0.5rem',
                      display: 'flex',
                      justifyContent: 'center'
                    }}
                  >
                    {stat.icon}
                  </div>
                  <div
                    style={{
                      fontSize: '1.875rem',
                      fontWeight: 'bold',
                      color: stat.iconColor
                    }}
                  >
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <div
                style={{
                  backgroundColor: '#dcfce7',
                  borderLeft: '4px solid #16a34a',
                  padding: '1rem',
                  borderRadius: '0.25rem',
                  marginBottom: '1rem'
                }}
              >
                <h2
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    color: '#15803d'
                  }}
                >
                  Approved ({approved.length})
                </h2>
              </div>
              <div
                style={{
                  spacing: '0.75rem',
                  maxHeight: '320px',
                  overflowY: 'auto'
                }}
              >
                {approved.map((candidate, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: '1px solid #bbf7d0',
                      backgroundColor: '#f0fdf4',
                      borderRadius: '0.25rem',
                      padding: '0.75rem',
                      marginBottom: '0.75rem'
                    }}
                  >
                    <h3
                      style={{
                        fontWeight: '600',
                        color: '#111827'
                      }}
                    >
                      {candidate.name}
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: '#4b5563' }}>
                      {candidate.email}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '0.25rem' }}>
                      {candidate.verificationReason}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div
                style={{
                  backgroundColor: '#fee2e2',
                  borderLeft: '4px solid #dc2626',
                  padding: '1rem',
                  borderRadius: '0.25rem',
                  marginBottom: '1rem'
                }}
              >
                <h2
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    color: '#991b1b'
                  }}
                >
                  Rejected ({rejected.length})
                </h2>
              </div>
              <div
                style={{
                  spacing: '0.75rem',
                  maxHeight: '320px',
                  overflowY: 'auto'
                }}
              >
                {rejected.map((candidate, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: '1px solid #fecaca',
                      backgroundColor: '#fef2f2',
                      borderRadius: '0.25rem',
                      padding: '0.75rem',
                      marginBottom: '0.75rem'
                    }}
                  >
                    <h3
                      style={{
                        fontWeight: '600',
                        color: '#111827'
                      }}
                    >
                      {candidate.name}
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: '#4b5563' }}>
                      {candidate.email}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#991b1b', marginTop: '0.25rem' }}>
                      {candidate.rejectionReason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#dbeafe',
              border: '1px solid #0284c7',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}
          >
            <h3
              style={{
                fontWeight: '600',
                color: '#0c4a6e',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Download style={{ marginRight: '0.5rem' }} size={20} />
              Download Results
            </h3>
            <p
              style={{
                fontSize: '0.875rem',
                color: '#374151',
                marginBottom: '1rem'
              }}
            >
              Download a CSV file with all candidates, their status, AI analysis, and your decisions.
            </p>
            <button
              onClick={handleDownload}
              style={{
                backgroundColor: '#0284c7',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.target.backgroundColor = '#0369a1'}
              onMouseLeave={(e) => e.target.backgroundColor = '#0284c7'}
            >
              <Download style={{ marginRight: '0.5rem' }} size={20} />
              Download CSV Report
            </button>
          </div>

          <button
            onClick={goHome}
            style={{
              width: '100%',
              backgroundColor: '#4f46e5',
              color: 'white',
              padding: '1rem',
              borderRadius: '0.5rem',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => e.target.backgroundColor = '#4338ca'}
            onMouseLeave={(e) => e.target.backgroundColor = '#4f46e5'}
          >
            <Home style={{ marginRight: '0.5rem' }} size={20} />
            Return to Home
          </button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (showHero) {
      return <HeroPage />;
    }

    switch (currentPage) {
      case 'intro':
        return <IntroPage />;
      case 'data-upload':
        return <DataUploadPage />;
      case 'preview-data':
        return <PreviewDataPage />;
      case 'gap-detection':
        return <GapDetectionPage />;
      case 'gap-results':
        return <GapResultsPage />;
      case 'exception-entry':
        return <ExceptionEntryPage />;
      case 'human-verification':
        return <HumanVerificationPage />;
      case 'final-results':
        return <FinalResultsPage />;
      default:
        return <IntroPage />;
    }
  };

  return (
    <ErrorBoundary>
      <div style={styles.app}>{renderContent()}</div>
    </ErrorBoundary>
  );
};

export default EduBridgeFullApp;
