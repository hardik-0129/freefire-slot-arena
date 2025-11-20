import React, { useState } from 'react';
import "./css/FAQ.css";

const faqData = [
  {
    question: "1. HOW DO I REGISTER ON THE PLATFORM?",
    answer: "To register on our platform, simply click on the \"Register\" button located at the top of the page. You can sign up using either your email address or mobile number. After completing the registration process, you'll be able to log in anytime to browse available tournaments and book slots. Make sure to provide accurate information during registration as it will be used for match confirmations and prize distributions."
  },
  {
    question: "2. WHAT GAMES ARE CURRENTLY AVAILABLE?",
    answer: "Currently, our platform primarily supports Free Fire tournaments. We offer various match types including solo, duo, and squad matches. You can check the full list of available games and upcoming tournaments on our tournament page. We regularly update our game offerings, so keep an eye out for new additions to our platform."
  },
  {
    question: "3. WHAT TYPES OF MATCHES CAN I JOIN?",
    answer: "You can join different types of matches based on your preference and availability. We offer solo matches (1 player), duo matches (2 players), and squad matches (4 players). Each match type has its own entry fee and prize pool. You can select your preferred match type when booking a slot. Make sure to check the match details including entry fee, prize distribution, and match timing before booking."
  },
  {
    question: "4. How do I pay the entry fee?",
    answer: "To pay the entry fee, you need to first add money to your wallet using our approved payment gateways. Once you have sufficient balance in your wallet, you can book a tournament slot. The entry fee will be automatically deducted from your wallet balance when you confirm your booking. You can add money to your wallet anytime from the wallet section in your account dashboard. We support multiple secure payment methods for your convenience."
  },
  {
    question: "5. How will I get the room ID and password?",
    answer: "After successfully booking a slot, you will receive the room ID and password through our notification system. These details are typically sent to you before the match start time. You can find the room ID and password in your match notifications, which will appear in the notification bell icon on the platform. Make sure to check your notifications regularly and join the room on time using the provided credentials. The room details are also available in your 'Upcoming Matches' section."
  },
  {
    question: "6. How is the prize money distributed?",
    answer: "Prize money is distributed based on your performance in the match. The prize calculation includes two components: (1) Per Kill Reward - You earn a fixed amount for each kill you make during the match, and (2) Position Bonus - Top 3 players receive additional bonuses (1st place gets the highest bonus, followed by 2nd and 3rd place). If multiple players share the same rank, the position bonus is split equally among them. Your total winnings (kills × per kill reward + position bonus) will be credited to your wallet as Alpha Coins after the match results are verified and processed by our admin team."
  },
  {
    question: "7. What happens if I don't join the room on time?",
    answer: "If you fail to join the room before the match start time, you will be considered absent and will not be able to participate in that match. Unfortunately, entry fees are non-refundable for missed matches unless the tournament is cancelled by us due to technical issues. We recommend joining the room at least 5-10 minutes before the scheduled match time to avoid any last-minute issues. Make sure to check your notifications for the room ID and password well in advance."
  },
  {
    question: "8. Is cheating allowed?",
    answer: "No, cheating is strictly prohibited on our platform. Any form of cheating, hacking, or unfair play will result in immediate disqualification from the match and potential permanent ban from the platform. This includes using unauthorized software, exploiting game bugs, teaming in solo matches, or any other activities that violate fair play principles. Players found cheating will not receive any rewards and will not be eligible for refunds. We have strict monitoring systems in place, and all matches are reviewed for fair play compliance."
  },
  {
    question: "9. I paid but didn't get confirmation. What should I do?",
    answer: "If you've made a payment but haven't received confirmation, first check your wallet balance and transaction history in your account dashboard. If the amount was deducted but the booking wasn't confirmed, please contact our support team immediately with your transaction details. You can reach us via email at support@alphalions.io, through the contact form on our website, or via WhatsApp at +91 94265 14470. Please provide your booking ID, transaction ID, and payment screenshot for faster resolution. Our team will investigate and resolve the issue within 24-48 hours."
  },
  {
    question: "10. Can I cancel my slot or get a refund?",
    answer: "Entry fees and deposits are generally non-refundable once a slot is booked. However, refunds may be provided in exceptional cases such as technical errors on our end or if the tournament is cancelled by us. Refunds are not available if you are disqualified for violating rules, if you miss the match, or if you simply change your mind. If you believe you have a valid reason for cancellation, please contact our support team at support@alphalions.io with your booking details, and we will review your case on an individual basis."
  },
  {
    question: "11. Do I need a high-end device or fast internet?",
    answer: "While you don't necessarily need the latest high-end device, we recommend using a device that can run Free Fire smoothly without lag or crashes. A stable internet connection is crucial for competitive gameplay - we recommend at least 3-4 Mbps internet speed for optimal performance. Poor connectivity can result in disconnections during matches, which may affect your performance and eligibility for rewards. Make sure to test your connection before joining a match and use a reliable network (Wi-Fi or 4G/5G) to ensure the best gaming experience."
  },
  {
    question: "12. How can I contact support?",
    answer: "You can contact our support team through multiple channels: (1) Email us at support@alphalions.io for detailed queries or issues, (2) Use the Contact Us form on our website for general inquiries, (3) Reach us on WhatsApp at +91 94265 14470 for quick assistance, or (4) Visit our website at https://esports.alphalions.io for more information. Our support team typically responds within 24-48 hours. For urgent match-related issues, WhatsApp is the fastest way to reach us. Please provide your user ID, booking details, and a clear description of your issue for faster resolution."
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
