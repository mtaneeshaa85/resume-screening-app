import React, { useState } from "react";
import { motion } from "framer-motion";

/* ---------------- ANIMATION VARIANTS ---------------- */

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemLeft = {
  hidden: { opacity: 0, x: -40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6 } },
};

const itemUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/* ---------------- MAIN COMPONENT ---------------- */

const FairGradeAI = ({ goToResume }) => {
  const [page, setPage] = useState("home");

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      {page === "home" ? (
        <HomePage onExplore={() => setPage("details")} />
      ) : (
        <DetailsPage onBack={() => setPage("home")} goToResume={goToResume} />
      )}
    </div>
  );
};

/* ---------------- HOME PAGE (Animated Hero) ---------------- */

const HomePage = ({ onExplore }) => {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3eef7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          maxWidth: "1300px",
          width: "100%",
          alignItems: "center",
        }}
      >
        {/* LEFT SIDE */}
        <motion.div style={{ padding: "80px" }}>
          {/* Logo */}
          <motion.div
            variants={itemLeft}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "50px",
            }}
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 6 }}
              transition={{ type: "spring", stiffness: 300 }}
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: "#7c3aed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 20,
              }}
            >
              🧠
            </motion.div>

            <div>
              <h2 style={{ margin: 0 }}>FairGrade AI</h2>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  letterSpacing: 2,
                  color: "#777",
                }}
              >
                HUMANIZING EDUCATION TECHNOLOGY
              </p>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemLeft}
            style={{
              fontSize: "64px",
              lineHeight: 1.1,
              marginBottom: "20px",
            }}
          >
            What AI is <br />
            <span style={{ color: "#7c3aed" }}>Missing</span> in <br />
            Education
          </motion.h1>

          {/* Purple Line */}
          <motion.div
            variants={itemUp}
            style={{
              width: 80,
              height: 4,
              background: "#7c3aed",
              borderRadius: 10,
              marginBottom: 25,
            }}
          />

          {/* Description */}
          <motion.p
            variants={itemUp}
            style={{
              color: "#555",
              fontSize: 18,
              maxWidth: 500,
              marginBottom: 40,
            }}
          >
            Discover the critical gaps in AI-powered education and explore our
            human-centered solutions that bridge technology with empathy,
            creativity, and inclusivity.
          </motion.p>

          {/* Button */}
          <motion.button
            variants={itemUp}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 25px rgba(124,58,237,0.3)",
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={onExplore}
            style={{
              padding: "16px 32px",
              borderRadius: 12,
              border: "none",
              background: "#7c3aed",
              color: "#fff",
              fontWeight: "bold",
              letterSpacing: 1,
              cursor: "pointer",
            }}
          >
            EXPLORE SOLUTIONS →
          </motion.button>
        </motion.div>

        {/* RIGHT IMAGE */}
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            position: "relative",
            height: "650px",
          }}
        >
          <motion.div
            initial={{
              clipPath: "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)",
            }}
            animate={{
              clipPath: "polygon(18% 0, 100% 0, 100% 100%, 0% 100%)",
            }}
            transition={{ duration: 1 }}
            style={{
              position: "absolute",
              inset: 0,
            }}
          >
            <motion.img
              src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f"
              alt="books"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.2 }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

/* ---------------- DETAILS PAGE ---------------- */

const DetailsPage = ({ onBack, goToResume }) => {
  const points = [
    "Lack of emotional intelligence in AI-driven learning platforms.",
    "Limited personalization based on student behavior and creativity.",
    "Over-reliance on automation reduces human interaction.",
    "Accessibility gaps for diverse learners.",
    "Insufficient focus on critical thinking and real-world skills.",
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        minHeight: "100vh",
        background: "#f8f6ff",
        padding: "60px 20px",
      }}
    >
      <div style={{ maxWidth: 700, margin: "auto" }}>
        <h2 style={{ marginBottom: 30 }}>🧠 FairGrade AI</h2>

        <h1 style={{ marginBottom: 30 }}>What AI is Missing</h1>

        {points.map((point, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
            style={{
              background: "#efeaff",
              padding: 18,
              borderRadius: 14,
              marginBottom: 14,
            }}
          >
            {point}
          </motion.div>
        ))}

        <div
          style={{
            marginTop: 50,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            alignItems: "flex-start",
          }}
        >
          {/* Back button */}
          <motion.button
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            style={{
              border: "none",
              background: "transparent",
              color: "#7c3aed",
              fontWeight: 600,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            ← Back to Overview
          </motion.button>

          {/* Primary CTA */}
          <motion.button
            whileHover={{
              scale: 1.04,
              boxShadow: "0 12px 30px rgba(124,58,237,0.35)",
            }}
            whileTap={{ scale: 0.97 }}
            onClick={goToResume}
            style={{
              padding: "16px 34px",
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: 0.5,
              cursor: "pointer",
              alignSelf: "flex-start",
            }}
          >
            Proceed to Resume Screening →
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default FairGradeAI;
