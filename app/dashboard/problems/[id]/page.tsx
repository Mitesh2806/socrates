"use client";
import { useState, useEffect } from "react";
import { app } from "@/lib/firebase";
import { getFirestore } from "firebase/firestore";
import { doc, getDoc } from "firebase/firestore";
import CodeEditor from "@/components/ui/CodeEditor";
import { Button } from "@/components/ui/button";
import ChatWindow from "@/components/ChatWindow";
import { RxCross2 } from "react-icons/rx";
import { TiTick } from "react-icons/ti";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Draggable from "react-draggable";
import { useRouter } from "next/navigation";
import axios from "axios";

interface TestCase {
  input: string;
  expectedOutput: string;
}

interface Problem {
  id: string;
  title: string;
  description: string;
  testCases: TestCase[];
}

interface TestResult {
  status: string;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  index: number;
}

export default function ProblemEvaluationPage({
  params,
}: {
  params: { id: string };
}) {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState<string>("");
  const [result, setResult] = useState<TestResult[]>([]);
  const [isHintEnabled, setIsHintEnabled] = useState<boolean>(false);
  const [editorHeight, setEditorHeight] = useState<number>(400); // Default height for small screens
  const [hints, setHints] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLgScreen, setIsLgScreen] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/fetch-data?id=${params.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log("data:", data.documents[0]);
        setProblem({ id: data.id, ...data.documents[0] });
      } catch (error) {
        router.push("/auth");
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [params.id]);

  useEffect(() => {
    const handleResize = () => {
      const windowHeight = window.innerHeight;
      const calculatedHeight = windowHeight * 0.8;
      setEditorHeight(calculatedHeight);
      setIsLgScreen(window.innerWidth >= 1024); // Check if screen width is lg or larger
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const runTests = () => {
    if (!problem) return;

    const testResults = problem.testCases.map((tc, index) => {
      try {
        const parsedInput = JSON.parse(tc.input);
        let functionName = null;
        let modifiedCode = code;

        const functionNameMatch = code.match(/function\s+([a-zA-Z0-9_]+)\s*\(/);
        if (functionNameMatch) {
          functionName = functionNameMatch[1];
        } else {
          functionName = "__userFunction__";
          modifiedCode = "const " + functionName + " = " + code;
        }

        const userFunction = new Function(
          "parsedInput",
          modifiedCode + "; return " + functionName + "(parsedInput);"
        );
        const userOutput = userFunction(parsedInput);

        const normalizedUserOutput = JSON.stringify(userOutput);
        const normalizedExpectedOutput = JSON.stringify(
          JSON.parse(tc.expectedOutput)
        );

        return {
          status: normalizedUserOutput === normalizedExpectedOutput ? "Passed" : "Failed",
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: normalizedUserOutput,
          index: index,
        };
      } catch (err) {
        console.error(err);
        return {
          status: "Error",
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: "Error",
          index: index,
        };
      }
    });

    setResult(testResults);
  };

  const handleToggleHints = () => {
    setIsHintEnabled((prev) => !prev);
  };

  const fetchAIHint = async (message: string) => {
    if (isHintEnabled && problem) {
      try {
        const failedIndexes = result
          .map((r, index) => (r.status !== "Passed" ? index : null))
          .filter((index) => index !== null);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ask`, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: problem.id,
            dict_of_vars: { code },
            prompt: message,
              testResults: {
                failedIndexes: failedIndexes.length > 0 ? failedIndexes : null,
              },
          }),
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        setHints(data.data); // Assuming the API returns the hint in `data.data`
      } catch (error) {
        console.error("Error fetching AI hint:", error);
        setHints("Failed to fetch hint");
      }
    }
  };

  return (
    <div className="w-[96vw] m-2 rounded-xl p-10 md:p-20 bg-gray-100 flex flex-col lg:flex-row gap-10">
      {loading ? (
        <>
          <div className="card flex flex-col basis-1/4">
            <Skeleton height={40} width={`60%`} />
            <Skeleton height={20} width={`80%`} />
            <Skeleton height={20} width={`80%`} />
            <Skeleton height={20} width={`80%`} />
            <Skeleton height={40} width={`40%`} />
          </div>
          <div className="flex-1 basis-3/4">
            <Skeleton height={editorHeight} />
          </div>
        </>
      ) : problem ? (
        <>
          <div className="card flex flex-col basis-1/4">
            <h2 className="text-3xl font-bold mb-6">{problem.title}</h2>
            <p className="mb-4">{problem.description}</p>
            <Button onClick={runTests} className="mt-2 bg-black w-36 text-white">
              Submit
            </Button>
            {result.length > 0 && (
              <div className="mt-4 flex gap-2 items-center ">
                Test Results:
                <div className=" inline-flex text-green-500 gap-1 items-center">
                  <TiTick />
                  {result.filter((r) => r.status === "Passed").length}/{" "}
                  {result.length} test cases passed.
                </div>
              </div>
            )}
            {result.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2 text-red-500 flex items-center gap-2 ">
                  <RxCross2 />
                  Failed Test Cases:{" "}
                  {result.filter((r) => r.status !== "Passed").length}
                </h3>
                <div className="max-h-20 overflow-y-auto p-2 border rounded-lg border-gray-300 shadow-lg">
                  {result.map(
                    (testResult, index) =>
                      testResult.status !== "Passed" && (
                        <div
                          key={index}
                          className="p-4 mb-2 bg-gray-100 rounded-lg border border-red-300"
                        >
                          <div>Test Case {index + 1}:</div>
                          <div>Input: {testResult.input}</div>
                          <div>Expected Output: {testResult.expectedOutput}</div>
                          <div>Your Output: {testResult.actualOutput}</div>
                        </div>
                      )
                  )}
                </div>
              </div>
            )}
            <div className="hintToggle mt-4  ">
              <label>
                <input
                  type="checkbox"
                  checked={isHintEnabled}
                  onChange={handleToggleHints}
                  className="mr-5 "
                />
                Enable Hints
              </label>
            </div>
          </div>

          <div className="flex-1 gap-10 basis-3/4 relative">
            {isHintEnabled && (
              isLgScreen ? (
                <Draggable>
                  <div className="absolute w-1/2 top-0 right-0 z-50">
                    <ChatWindow
                      code={code}
                      problem={problem}
                      fetchAIHint={fetchAIHint}
                      hints={hints}
                    />
                  </div>
                </Draggable>
              ) : (
                <div>
                  <ChatWindow
                    code={code}
                    problem={problem}
                    fetchAIHint={fetchAIHint}
                    hints={hints}
                  />
                </div>
              )
            )}
            <CodeEditor
              initialValue={code}
              language="javascript"
              onChange={setCode}
              height={editorHeight}
            />
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center w-full h-full">
          <Skeleton height={40} width={`60%`} />
        </div>
      )}
    </div>
  );
}