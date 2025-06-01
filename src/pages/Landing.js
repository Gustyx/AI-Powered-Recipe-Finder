import React, { useRef, useState } from "react";
import "./Landing.css";

const questions = [
  {
    id: 1,
    question: "Are you vegetarian/vegan/pescetarian/diabetic or follow a carnivore diet?",
    options: ["Yes", "No"],
  },
  {
    id: 2,
    question: "Do you usually order food or cook at home?",
    options: ["Prefer Ordering Food", "Prefer Cooking at home"],
  },
  {
    id: 3,
    question: "How often do you cook at home?",
    options: ["Daily", "Weekly", "Monthly", "Rarely"],
  },
  {
    id: 4,
    question: "Do you find it easy to order the exact food that will make you feel the best?",
    options: ["Yes", "No", "Sometimes"],
  },
  {
    id: 5,
    question: "How much time does it take you to think of a recipe, buy the ingredients and prepare the food?",
    options: ["Less than an hour", "Too much", "I don't even want to think about it"],
  },
  {
    id: 6,
    question: "How important is the quality and the source of the ingredients for you?",
    options: ["Important", "Pretty Important", "Very Important"],
  }
];

const Landing = () => {
  const questionnaireRef = useRef(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const scrollToQuestionnaire = () => {
    questionnaireRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleChange = (questionId, option) => {
    const updatedAnswers = { ...answers, [questionId]: option };
    setAnswers(updatedAnswers);

    // If it's the last question, go to loading and then ready
    if (currentQuestion === questions.length - 1) {
      setTimeout(() => {
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          setReady(true);
        }, 3000);
      }, 300); // small delay to let user see click
    } else {
      // Otherwise move to next question
      setTimeout(() => {
        setCurrentQuestion((prevIndex) => prevIndex + 1);
      }, 300);
    }
  };

  return (
    <div className="landing-container">
      <div className="landing-overlay"></div>

      <div className="landing-content centered-content">
        <h1 className="app-title">Easy Bite</h1>
        <h2 className="slogan">We Bring Ingredients,<br />You Bring the Flavor.</h2>
        <button className="ready-button" onClick={scrollToQuestionnaire}>
          Find out if you are ready!
        </button>
      </div>

      <div className="questionnaire" ref={questionnaireRef}>
        <h2>Are you ready for an Easy Bite?</h2>

        {!ready && !loading && (
          <div className="question-row">
            <label className="question-text">{questions[currentQuestion].question}</label>
            <div className="options-row">
              {questions[currentQuestion].options.map((option) => (
                <label key={option} className="option-label">
                  <input
                    type="radio"
                    name={`question-${questions[currentQuestion].id}`}
                    value={option}
                    checked={answers[questions[currentQuestion].id] === option}
                    onChange={() => handleChange(questions[currentQuestion].id, option)}
                    required
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        )}

        {loading && <div className="loading-text">Calculating answers...</div>}

        {ready && (
          <>
            <div className="ready-answer">
              <strong>100% Ready</strong>
            </div>
            <div className="left-align-text">
              <p>
                We prioritize your safety and offer diverse food options for every lifestyle.
                Finding trustworthy restaurants with the right ingredients can be tough—
                especially with special dietary needs. That’s why we believe homemade is best.
                Ready to eat healthier and feel amazing? Invest in yourself today!
              </p>
            </div>
            <div className="landing-buttons" style={{ textAlign: "center", marginTop: "2rem" }}>
              <button onClick={() => (window.location.href = "/register")} className="ready-button">
                Register now!
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Landing;
