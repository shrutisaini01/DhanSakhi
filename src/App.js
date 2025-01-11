import React, { useState, useEffect } from 'react';
import './App.css';
import ReactMarkdown from 'react-markdown';

function App() {
  const [language, setLanguage] = useState('hindi');
  const [budget, setBudget] = useState({ income: '', expenses: '' });
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [audioStories, setAudioStories] = useState([]);
  const [audio, setAudio] = useState(null); // Track the audio instance
  const [isPlaying, setIsPlaying] = useState(false); // Track the playing status

  const API_KEY = process.env.REACT_APP_GROQ_API_KEY; // Add your Gemini API key here

  useEffect(() => {
    // Mock fetching audio stories from a backend or local storage
    setAudioStories([
      {
        id: 1,
        title: language === 'hindi' ? 'बचत की कहानी' : 'Story of Savings',
        src: language === 'hindi' ? '/audios/Story2.mp3' : '/audios/Story1.mp3',
      },
      {
        id: 2,
        title: language === 'hindi' ? 'बजट बनाना' : 'Creating a Budget',
        src: language === 'hindi' ? '/audios/Story3.mp3' : '/audios/Story4.mp3',
      },
    ]);
  }, [language]);

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleBudgetChange = (type, value) => {
    if (type === 'income') {
      setBudget({ ...budget, income: value });
    } else if (type === 'expenses') {
      // If expenses exceed income, prompt an error message
      if (parseFloat(value) > parseFloat(budget.income || 0)) {
        alert(
          language === 'hindi'
            ? 'आपका व्यय आपकी आय से अधिक है। कृपया पुनः प्रयास करें।'
            : 'Your expenses exceed your income. Please enter valid values.'
        );
      } else {
        setBudget({ ...budget, expenses: value });
      }
    }
  };

  // Modify this function to use the Gemini API
  const handleQuestionSubmit = async () => {
    if (!question) return;

    setAnswer('Loading...');
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`, // Replace with your actual API key
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile', // Use the model specified in the documentation
          messages: [
            {
              role: 'user',
              content: question,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        console.error('API Error Details:', errorDetails);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API Response:', data); // Log the full API response

      // Parse the response based on actual structure
      const generatedAnswer =
        data?.choices?.[0]?.message?.content || 'No answer available.';
      setAnswer(generatedAnswer);
    } catch (error) {
      console.error('Error:', error.message);
      setAnswer(language === 'hindi' ? 'उत्तर प्राप्त करने में त्रुटि।' : 'Error fetching the answer.');
    }
  };


  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = language === 'hindi' ? 'hi-IN' : 'en-US';
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuestion(transcript);
      };
      recognition.start();
    } else {
      alert('Speech recognition not supported in this browser.');
    }
  };

  const playAudioStory = (src) => {
    if (audio) {
      audio.pause(); // Pause the previous audio if there is any
    }
    const newAudio = new Audio(src);
    newAudio.play();
    setAudio(newAudio);
    setIsPlaying(true);

    newAudio.onended = () => {
      setIsPlaying(false); // Set to false when audio ends
    };
  };

  const handlePause = () => {
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleResume = () => {
    if (audio && !isPlaying) {
      audio.play();
      setIsPlaying(true);
    }
  };

  const GuideMe = () => {
    const [step, setStep] = useState(0);
    const [answer, setAnswer] = useState('');
    const steps = [
      {
        title: language=='hindi' ? 'कदम 1: परिचय' : 'Step 1: Introduction',
        description: language=='hindi' ? 'वित्त प्रबंधन के मूलभूत पहलुओं को जानें।':'Learn the basics of financial management.',
      },
      {
        title: language=='hindi' ? 'कदम 2: अपने बजट को सेट करना' : 'Step 2: Setting Your Budget',
        description: language=='hindi' ? 'समझें कि कैसे एक बजट तय और प्रबंधन करना है।':'Understand how to set and manage your budget effectively.',
      },
      {
        title: language=='hindi' ? 'कदम 3: खर्चों का विश्लेषण करना' : 'Step 3: Analyzing Expenses',
        description: language=='hindi' ? 'अपने खर्चों को ट्रैक करें और उन्हें ऑप्टिमाइज़ करें।':'Track your expenses and optimize your spending.',
      },
      {
        title: language=='hindi' ? 'कदम 4: बचत और योजना बनाना' : 'Step 4: Savings & Planning',
        description: language=='hindi' ? 'भविष्य के लिए एक बचत योजना बनाना सीखे।':'Learn how to create a savings plan for your future.',
      },
    ];

    const handleNext = () => setStep(prev => (prev + 1 < steps.length ? prev + 1 : steps.length - 1));
    const handlePrevious = () => setStep(prev => (prev - 1 >= 0 ? prev - 1 : 0));

    const handleKnowMore = async (description) => {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_KEY}`, // Replace with your actual API key
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile', // Use the model specified in the documentation
            messages: [
              {
                role: 'user',
                content: description,
              },
            ],
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch the answer. Please try again later.');
        }

        const data = await response.json();
        const generatedAnswer = data?.choices?.[0]?.message?.content || 'No answer available.';
        setAnswer(generatedAnswer);

      } catch (error) {
        console.error('Error:', error.message);
        setAnswer(language === 'hindi' ? 'उत्तर प्राप्त करने में त्रुटि।' : 'Error fetching the answer.');
      }
    };

    return (
      <div className="guide-me-steps">
        <h2>{language === 'hindi' ? 'मुझे मार्गदर्शन करें' : 'Guide Me'}</h2>
        <div className="step-content">
          <h3>{steps[step].title}</h3>
          <p>{steps[step].description}</p>
          <button onClick={() => handleKnowMore(steps[step].description)}>
            {language === 'hindi' ? 'और जानें' : 'Know More'}
          </button>
          
        </div>
        <div className="step-navigation">
          <button onClick={handlePrevious} disabled={step === 0}>
            {language === 'hindi' ? 'पिछला' : 'Previous'}
          </button>
          <button onClick={handleNext} disabled={step === steps.length - 1}>
            {language === 'hindi' ? 'अगला' : 'Next'}
          </button>
        </div>
        <div className="answer">
          <h3>{language === 'hindi' ? 'उत्तर:' : 'Answer:'}</h3>
          {answer === '' ? <p>{language === 'hindi' ? 'उत्तर मिल रहा है...' : 'Loading...'}</p> : <ReactMarkdown>{answer}</ReactMarkdown>}
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>DhanSakhi</h1>
        <p>Your AI-powered financial advisor</p>
      </header>

      <section className="language-selector">
        <label htmlFor="language">Choose Language:</label>
        <select id="language" value={language} onChange={handleLanguageChange}>
          <option value="hindi">Hindi</option>
          <option value="english">English</option>
        </select>
      </section>

      <section className="question-section">
        <h2>{language === 'hindi' ? 'प्रश्न पूछें' : 'Ask a Question'}</h2>
        <textarea
          placeholder={language === 'hindi' ? 'अपना प्रश्न यहाँ टाइप करें...' : 'Type your question here...'}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        ></textarea>
        <button onClick={handleQuestionSubmit}>{language === 'hindi' ? 'यह पूछें' : 'Submit'}</button>
        <button onClick={startListening} disabled={isListening}>
          {isListening ? (language === 'hindi' ? 'सुनना...' : 'Listening...') : (language === 'hindi' ? 'अपना प्रश्न बोलें' : 'Speak Your Question')}
        </button>
        <div className="answer">
          <h3>{language === 'hindi' ? 'उत्तर:' : 'Answer:'}</h3>
          {answer === 'Loading...' ? <p>Loading...</p> : <ReactMarkdown>{answer}</ReactMarkdown>}
        </div>
      </section>

      <section className="audio-stories">
        <h2>{language === 'hindi' ? 'ऑडियो कहानियां' : 'Audio Stories'}</h2>
        <p>
          {language === 'hindi' ? 'आवश्यक वित्तीय अवधारणाओं को समझने के लिए कहानियां सुनें।' : 'Listen to stories to understand essential financial concepts.'}
        </p>
        <ul>
          {audioStories.map((story) => (
            <li key={story.id}>
              <button onClick={() => playAudioStory(story.src)}>{story.title}</button>
            </li>
          ))}
        </ul>
        <div>
          <button onClick={handlePause} disabled={!isPlaying}>
            Pause
          </button>
          <button onClick={handleResume} disabled={isPlaying}>
            Resume
          </button>
        </div>
      </section>

      <section className="track-expenses">
  <h2>{language === 'hindi' ? 'अपने खर्चों को ट्रैक करें' : 'Track Your Expenses'}</h2>
  
  <div className="input-group">
    <label>
      {language === 'hindi' ? 'अपनी मासिक आय दर्ज करें:' : 'Enter your monthly income:'}
    </label>
    <input
      type="number"
      placeholder={language === 'hindi' ? 'आय (रुपयों में)' : 'Income (in rupees)'}
      value={budget.income}
      onChange={(e) => handleBudgetChange('income', e.target.value)}
    />
  </div>

  <div className="input-group">
    <label>
      {language === 'hindi' ? 'अपने मासिक खर्चे दर्ज करें:' : 'Enter your monthly expenses:'}
    </label>
    <input
      type="number"
      placeholder={language === 'hindi' ? 'खर्चे (रुपयों में)' : 'Expenses (in rupees)'}
      value={budget.expenses}
      onChange={(e) => handleBudgetChange('expenses', e.target.value)}
    />
  </div>

  <div className="savings-result">
    <h3>{language === 'hindi' ? 'आपकी बचत:' : 'Your Savings:'}</h3>
    {budget.income && budget.expenses ? (
      parseFloat(budget.income) >= parseFloat(budget.expenses) ? (
        <p>
          {language === 'hindi'
            ? `आपकी मासिक बचत है: ₹${parseFloat(budget.income) - parseFloat(budget.expenses)}`
            : `Your monthly savings are: ₹${parseFloat(budget.income) - parseFloat(budget.expenses)}`}
        </p>
      ) : (
        <p style={{ color: 'red' }}>
          {language === 'hindi'
            ? 'आपका व्यय आपकी आय से अधिक है। कृपया अपने खर्चे कम करें।'
            : 'Your expenses exceed your income. Please try to reduce your expenses.'}
        </p>
      )
    ) : (
      <p>
        {language === 'hindi'
          ? 'अपनी बचत जानने के लिए ऊपर दिए गए विवरण दर्ज करें।'
          : 'Enter the details above to calculate your savings.'}
      </p>
    )}
  </div>
</section>


      <section className="guide-me">
        <GuideMe />
      </section>

      <footer>
        <p>{language === 'hindi' ? 'धनसखी: आपके वित्तीय भविष्य के लिए।' : 'DhanSakhi: For your financial future.'}</p>
      </footer>
    </div>
  );
}



export default App;
