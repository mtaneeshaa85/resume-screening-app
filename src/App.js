import React, { useState } from "react";
import Page2 from "./Page2";
import ResumeScreeningApp from "./ResumeScreeningApp";

function App() {
  const [page, setPage] = useState("page2"); // Page 2 first

  return (
    <div>
      {page === "page2" && <Page2 goToResume={() => setPage("resume")} />}

      {page === "resume" && (
        <ResumeScreeningApp goBack={() => setPage("page2")} />
      )}
    </div>
  );
}

export default App;
