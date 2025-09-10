import React, { useState } from 'react';
import "./css/FAQ.css";

const faqData = [
  {
    question: "1. HOW DO I REGISTER ON THE PLATFORM?",
    answer: "Simply click on the “Register” button at the top, and sign up using your email or mobile number. Once registered, you can log in anytime to book tournament slots."
  },
  {
    question: "2. WHAT GAMES ARE CURRENTLY AVAILABLE?",
    answer: "We support popular titles like BGMI, Free Fire, and more. Check our platform for the full list."
  },
  {
    question: "3. WHAT TYPES OF MATCHES CAN I JOIN?",
    answer: "You can join solo, duo, or squad matches depending on your preference and availability."
  },
  {
    question: "4. How do I pay the entry fee?",
    answer: "Simply click on the “Register” button at the top, and sign up using your email or mobile number. Once registered, you can log in anytime to book tournament slots."
  },
  {
    question: "5. How will I get the room ID and password?",
    answer: "We support popular titles like BGMI, Free Fire, and more. Check our platform for the full list."
  },
  {
    question: "6. How is the prize money distributed?",
    answer: "You can join solo, duo, or squad matches depending on your preference and availability."
  },
  {
    question: "7. What happens if I don’t join the room on time?",
    answer: "Simply click on the “Register” button at the top, and sign up using your email or mobile number. Once registered, you can log in anytime to book tournament slots."
  },
  {
    question: "8. Is cheating allowed?",
    answer: "We support popular titles like BGMI, Free Fire, and more. Check our platform for the full list."
  },
  {
    question: "9. I paid but didn’t get confirmation. What should I do?",
    answer: "You can join solo, duo, or squad matches depending on your preference and availability."
  },
  {
    question: "10. Can I cancel my slot or get a refund?",
    answer: "You can join solo, duo, or squad matches depending on your preference and availability."
  },
  {
    question: "11. Do I need a high-end device or fast internet?",
    answer: "Simply click on the “Register” button at the top, and sign up using your email or mobile number. Once registered, you can log in anytime to book tournament slots."
  },
  {
    question: "12. How can I contact support?",
    answer: "We support popular titles like BGMI, Free Fire, and more. Check our platform for the full list."
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleItem = (index) => {
    setOpenIndex(prevIndex => (prevIndex === index ? -1 : index));
  };

  return (
    <div className="container">
            <h2 className="text-[42px] font-bold text-center mb-10">How it Works</h2>
      {faqData.map((item, index) => (
        <div key={index} className={`faq-item ${openIndex === index ? "open" : ""}`}>
          <div className="faq-question" onClick={() => toggleItem(index)}>
            <img 
              src={openIndex === index ? "/assets/images/FFBlack.png" : "/assets/images/FFYellow.png"} 
              alt="FAQ icon" 
              className="w-6 h-6 transition-all duration-300"
            />
            <h3>{item.question}</h3>
          </div>
          <div className="faq-answer">
            <p>{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FAQ;
