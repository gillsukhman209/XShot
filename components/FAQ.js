"use client";

import { useRef, useState } from "react";

const faqList = [
  {
    question: "What is XShot?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        XShot is a tool that allows you to capture and customize high-quality
        screenshots of Instagram and Twitter posts. Enhance your content with
        stylish backgrounds, custom fonts, and watermark-free exports.
      </div>
    ),
  },
  {
    question: "Is XShot free to use?",
    answer: (
      <p>
        Yes! We offer a free plan with 10 screenshots per month. For advanced
        customization options, no watermarks, and a higher screenshot limit, you
        can upgrade to our Monthly or Yearly plan.
      </p>
    ),
  },
  {
    question: "Can I customize my screenshots?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        Absolutely! You can change backgrounds, fonts, aspect ratios, and even
        add branding elements like watermarks or overlays to make your
        screenshots stand out.
      </div>
    ),
  },
  {
    question: "What features are included in the Pro plan?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        The Pro plan includes:
        <ul className="list-disc list-inside space-y-1">
          <li>500 screenshots per month</li>
          <li>No watermarks</li>
          <li>Custom backgrounds and themes</li>
          <li>High-resolution downloads</li>
          <li>Priority support</li>
        </ul>
      </div>
    ),
  },
  {
    question: "Is my data safe?",
    answer: (
      <p>
        Yes! We do not store or track your screenshots. Your privacy is our
        priority, and all processing is done securely without sharing your data.
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
        . We&apos;re happy to help!
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
