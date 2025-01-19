"use client";

import { useRef, useState } from "react";

// <FAQ> component is a list of <Item> component
// Updated FAQ content for the debt-tracking app
const faqList = [
  {
    question: "What is this app about?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        Our app helps you track borrowed and lent money with ease. Never forget
        who owes what, and avoid confusion or arguments over forgotten debts.
      </div>
    ),
  },
  {
    question: "Is the app free to use?",
    answer: (
      <p>
        Yes! The app offers a free plan where you can add up to 1-2 friends. For
        more features like unlimited friends, reminders, and advanced tools, you
        can upgrade to our Pro plan.
      </p>
    ),
  },
  {
    question: "Can I sync my debts with others?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        Yes! You can sync debts with your friends or family in real time. Both
        users can view updates to shared debts instantly.
      </div>
    ),
  },
  {
    question: "What features are included in the Pro plan?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        The Pro plan includes:
        <ul className="list-disc list-inside space-y-1">
          <li>Unlimited friend connections</li>
          <li>Customizable reminders and notifications</li>
          <li>Debt forgiveness games</li>
          <li>Export debts to PDF or CSV</li>
          <li>Priority support</li>
        </ul>
      </div>
    ),
  },
  {
    question: "How secure is my data?",
    answer: (
      <p>
        Your data security is our top priority. All information is encrypted,
        and we do not share your data with any third parties.
      </p>
    ),
  },
  {
    question: "What if I have more questions?",
    answer: (
      <p>
        Feel free to reach out to us at{" "}
        <a href="mailto:gillsukhman209@gmail.com" className="text-primary">
          gillsukhman209@gmail.com
        </a>
        . We&apos;re here to help!
      </p>
    ),
  },
];

const Item = ({ item }) => {
  const accordion = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <li>
      <button
        className="relative flex gap-2 items-center w-full py-5 text-base font-semibold text-left border-t md:text-lg border-base-content/10"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        aria-expanded={isOpen}
      >
        <span
          className={`flex-1 text-base-content ${isOpen ? "text-primary" : ""}`}
        >
          {item?.question}
        </span>
        <svg
          className={`flex-shrink-0 w-4 h-4 ml-auto fill-current`}
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            y="7"
            width="16"
            height="2"
            rx="1"
            className={`transform origin-center transition duration-200 ease-out ${
              isOpen && "rotate-180"
            }`}
          />
          <rect
            y="7"
            width="16"
            height="2"
            rx="1"
            className={`transform origin-center rotate-90 transition duration-200 ease-out ${
              isOpen && "rotate-180 hidden"
            }`}
          />
        </svg>
      </button>

      <div
        ref={accordion}
        className={`transition-all duration-300 ease-in-out opacity-80 overflow-hidden`}
        style={
          isOpen
            ? { maxHeight: accordion?.current?.scrollHeight, opacity: 1 }
            : { maxHeight: 0, opacity: 0 }
        }
      >
        <div className="pb-5 leading-relaxed">{item?.answer}</div>
      </div>
    </li>
  );
};

const FAQ = () => {
  return (
    <section className="bg-base-200" id="faq">
      <div className="py-24 px-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
        <div className="flex flex-col text-left basis-1/2">
          <p className="inline-block font-semibold text-primary mb-4">FAQ</p>
          <p className="sm:text-4xl text-3xl font-extrabold text-base-content">
            Frequently Asked Questions
          </p>
        </div>

        <ul className="basis-1/2">
          {faqList.map((item, i) => (
            <Item key={i} item={item} />
          ))}
        </ul>
      </div>
    </section>
  );
};

export default FAQ;
