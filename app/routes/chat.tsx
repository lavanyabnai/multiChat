import { Link, Form, useFetcher } from "@remix-run/react";
import { Tab } from "@headlessui/react";
import {
  ChatBubbleOvalLeftEllipsisIcon,
  PaperAirplaneIcon,
  ArrowUpTrayIcon,
  AdjustmentsVerticalIcon,
  HandThumbUpIcon,
  ChatBubbleLeftEllipsisIcon,
  EyeIcon,
  ShareIcon,
  XMarkIcon,
  InformationCircleIcon,
  ChatBubbleOvalLeftIcon,
  HeartIcon,
  TrashIcon,
  ArrowDownIcon,
  ChevronLeftIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/20/solid";
import React, { useState, useEffect, useRef } from "react";

import { FcCustomerSupport } from "react-icons/fc";
import { IoMdSend } from "react-icons/io";

function formatText(text) {
  const formattedText = text
    .replace(/\*([^\*]+)\*/g, "<strong>$1</strong>") // Bold: *text*
    .replace(/_([^_]+)_/g, "<em>$1</em>") // Italics: _text_
    .replace(/- ([^\n]+)/g, "<li>$1</li>"); // Bullets: - item

  return formattedText.split("\n").map((item, index) => {
    if (item.startsWith("<li>")) {
      return (
        <ul key={index}>
          <li>{item.substring(4, item.length - 5)}</li>
        </ul>
      );
    } else {
      return <p key={index} dangerouslySetInnerHTML={{ __html: item }} />;
    }
  });
}
const tabs = [
  { name: "Conversations", href: "#", count: "52", current: false },
  { name: "Prompts", href: "#", count: "6", current: true },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
export default function Demo({ aiMessage }) {
  const [messages, setMessages] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const endOfMessagesRef = useRef(null);
  const ref = useRef(null);
  const textareaRef = useRef(null);
  const eventSourceRef = useRef(null);

  const handleClick = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleChatGPTStream = (prompt, onData) => {
    // Close the previous EventSource if it exists
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(
      `/demo/gpt?prompt=${encodeURIComponent(prompt)}`,
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "done") {
        eventSource.close();
      } else {
        let content = data?.choices?.[0]?.delta?.content;
        if (content) {
          onData(content);
        }
      }
    };

    eventSource.onerror = (event) => {
      console.error("EventSource failed:", event);
      eventSource.close();
    };

    // Update the ref with the new EventSource
    eventSourceRef.current = eventSource;
  };

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const appendToLastMessage = (newText) => {
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      if (lastMessage && lastMessage.role === "gpt") {
        return [
          ...prevMessages.slice(0, -1),
          { ...lastMessage, content: lastMessage.content + newText },
        ];
      } else {
        return [...prevMessages, { role: "gpt", content: newText }];
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setIsSubmitting(true);

    const formData = new FormData(e.target);

    const prompt = formData.get("prompt");
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: prompt },
    ]);
    textareaRef.current.value = "";

    handleChatGPTStream(prompt, appendToLastMessage);

    setIsSubmitting(false);
  };

  // const handleKeyPress = (e) => {
  //   console.log("Key pressed:", e.key);
  //   if (e.key === "Enter" && e.shiftKey) {
  //     const formData = new FormData(e.target);
  //     const prompt = formData.get("prompt");
  //     console.log("Prompt:", prompt);
  //     e.preventDefault(); // Prevent default behavior of newline in textarea
  //     e.target.form.dispatchEvent(new Event("submit", { cancelable: true }));
  //   }
  // };

  const handleClose = () => {
    setIsSidebarOpen(false); // Close the sidebar when XMarkIcon is clicked
  };

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="relative w-full">
      <div className={`flex ${isSidebarOpen ? "" : "xl:flex"} h-screen`}>
        <div className="flex h-screen w-full flex-col items-center bg-white ">
          <div
            ref={ref}
            className="max-w-7xl w-4/6 mx-auto flex-grow overflow-y-auto"
          >
            {messages.map((msg, index) =>
              msg.role === "user" ? (
                // eslint-disable-next-line react/jsx-key
                <div className="mx-auto mt-2 flex w-full max-w-full text-base">
                  <div className="flex  h-12 w-12 items-center justify-center rounded-full">
                    <div className="flex items-center justify-center  rounded-full bg-gradient-to-t shadow-lg p-0.5 border">
                      <FcCustomerSupport className="mx-auto bg-white h-10 w-10 justify-center rounded-full p-1.5" />
                    </div>
                  </div>
                  <div className="mx-2 w-full p-0.5 rounded-lg bg-gradient-to-t from-purple-500 to-pink-500 shadow-lg">
                    <div className="flex w-full flex-col relative bg-white p-4 shadow rounded-lg">
                      <p className="break-words text-lg">
                        {formatText(msg.content)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                // eslint-disable-next-line react/jsx-key
                <div className="my-4 flex text-base">
                  <div className="relative flex  h-12 w-12  items-center justify-center rounded-full">
                    <div className="flex items-center justify-center  rounded-full bg-gradient-to-t from-indigo-400 via-cyan-400 to-sky-500 shadow-lg p-0.5">
                      <img
                        className="mx-auto bg-white h-10 w-10 justify-center rounded-full p-1.5"
                        src={"/assets/logo-4.png"}
                        alt="logo"
                      />
                    </div>
                  </div>

                  <div className="mx-2 w-full p-0.5 rounded-lg bg-gradient-to-t from-indigo-400 via-cyan-400 to-sky-500 shadow-lg">
                    <div className="flex w-full flex-col relative bg-white p-4 shadow rounded-lg">
                      <p className="mt-1 break-words text-lg">
                        {formatText(msg.content)}
                      </p>

                      <div className="mt-4 pt-2 flex justify-between border-t">
                        <div className="flex space-x-4">
                          <span className="inline-flex items-center text-sm">
                            <button
                              type="button"
                              className="inline-flex text-gray-400 hover:text-gray-500"
                            >
                              <HandThumbUpIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </button>
                          </span>
                          <span className="inline-flex items-center text-sm">
                            <button
                              type="button"
                              className="inline-flex space-x-2 text-gray-400 hover:text-gray-500"
                            >
                              <ChatBubbleLeftEllipsisIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </button>
                          </span>
                          <span className="inline-flex items-center text-sm">
                            <button
                              type="button"
                              className="inline-flex space-x-2 text-gray-400 hover:text-gray-500"
                            >
                              <EyeIcon className="h-5 w-5" aria-hidden="true" />
                            </button>
                          </span>
                        </div>
                        <div className="flex text-sm">
                          <span className="inline-flex items-center text-sm">
                            <button
                              type="button"
                              className="inline-flex space-x-2 text-gray-400 hover:text-gray-500"
                            >
                              <ShareIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </button>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ),
            )}
            <div ref={endOfMessagesRef} />
          </div>

          {/* <div className="relative">
            <button
              onClick={handleClick}
              hidden={endOfMessagesRef.current}
              className="absolute bottom-4 right-4 rounded-full p-2 text-black border shadow-lg bg-white"
            >
              <ArrowDownIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div> */}

          <form
            onSubmit={handleSubmit}
            className="mx-auto flex h-20 w-full max-w-7xl p-4"
          >
            <div className="flex flex-grow rounded-md bg-gray-100 p-2.5">
              <textarea
                required
                name="prompt"
                id="prompt"
                placeholder="Message ChatGPT..."
                ref={textareaRef}
                // onKeyDown={handleKeyPress}
                className="flex-grow text-lg bg-gray-100 outline-none"
                style={{ resize: "none" }}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className={`ml-2 rounded-md text-white ${
                  isSubmitting ? "opacity-50" : ""
                }`}
              >
                <IoMdSend className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="flex text-blue-900 ">
              <button
                type="button"
                disabled={isSubmitting}
                className={`mx-2 flex items-center justify-center rounded-md bg-gray-100 p-2.5 ${
                  isSubmitting ? "opacity-50" : ""
                }`}
              >
                <ArrowUpTrayIcon className="h-5 w-5 font-bold stroke-2" />
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                className={`flex items-center justify-center rounded-md bg-gray-100 p-2.5 ${
                  isSubmitting ? "opacity-50" : ""
                }`}
              >
                <AdjustmentsVerticalIcon className="h-5 w-5 font-bold stroke-2" />
              </button>
            </div>
          </form>
        </div>
        {/* sidebar */}

        <div
          className={`sidebar bg-slate-50 px-4  ${
            isSidebarOpen ? "block" : "hidden"
          } w-96 transition delay-150 duration-300 shadow-lg `}
        >
          <div className="flex  h-screen flex-col gap-y-4 pb-4 ">
            <div className="flex my-4 justify-between ">
              <Link
                href="#"
                onClick={handleClose}
                className="flex rounded-md p-2 mr-2 text-base font-semibold leading-6 bg-white text-blue-900 hover:bg-gray-100 hover:text-gray-200 border"
              >
                <XMarkIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
              </Link>
              <Link
                href="#"
                className="flex-1 rounded-md px-2 py-2 text-base font-semibold leading-6 bg-white text-blue-900 hover:bg-gray-100 hover:text-gray-white border"
              >
                <div className="flex items-center">
                  <ChatBubbleOvalLeftIcon
                    className="h-6 w-6 mr-2"
                    aria-hidden="true"
                  />
                  <span className="flex items-center text-sm ">
                    New Conversation
                  </span>
                </div>
              </Link>
            </div>
            <div className="rounded-lg">
              <Tab.Group className="flex justify-between">
                <Tab.List className="">
                  {tabs.map((tab) => (
                    <Tab
                      key={tab.name}
                      className={({ selected }) =>
                        classNames(
                          "flex flex-col border-black p-2 text-center text-base font-semibold mx-1 outline-none",
                          selected
                            ? "border-b-2 text-blue-900"
                            : "text-gray-400 hover:text-gray-700",
                        )
                      }
                    >
                      {tab.name}
                    </Tab>
                  ))}
                </Tab.List>
              </Tab.Group>
            </div>
            <nav className="mt-4 flex flex-1 flex-col gap-y-7">
              <div className="flex flex-1 flex-col ">
                <div className="bg-white  rounded-md p-4 font-semibold leading-6 border">
                  <Link className="flex items-center justify-between text-base text-blue-900 hover:text-gray-700">
                    <span>Hello, World!</span>

                    <span className="flex items-center justify-between space-x-2 mr-2">
                      {" "}
                      <HeartIcon className=" h-4 w-4" />
                      <TrashIcon className="h-4 w-4" />
                    </span>
                  </Link>
                </div>

                <div className="mt-auto m-2 rounded-md p-2 font-semibold leading-6 text-gray-400  hover:text-gray-500 ">
                  <Link href="#" className="flex items-center justify-center">
                    <InformationCircleIcon
                      className="h-6 w-6"
                      aria-hidden="true"
                    />
                    <span className="flex items-center ml-4 text-lg">
                      {" "}
                      Information
                    </span>
                  </Link>
                </div>
              </div>
            </nav>
          </div>
        </div>

        {!isSidebarOpen ? <div className="absolute  right-0  m-2">
            <div className="flex items-center justify-center">
              <button
                type="button"
                className="flex items-center justify-center rounded-full h-10 w-10 bg-rose-500 p-1 font-semibold text-white shadow-sm"
                onClick={toggleSidebar}
              >
                <ChevronLeftIcon
                  className="flex items-center h-6 w-6"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div> : null}
      </div>
    </div>
  );
}
