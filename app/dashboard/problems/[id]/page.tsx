"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import CodeEditor from "@/components/ui/CodeEditor";
import { Button } from "@/components/ui/button";
import ChatWindow from "@/components/ChatWindow";
import { RxCross2 } from "react-icons/rx";
import { TiTick } from "react-icons/ti";
import { Root } from "postcss";
import RootLayout from "../../layout";

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

export default function ProblemEvaluationPage({
  params,
}: {
  params: { id: string };
}) {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState<string>("");
  const [result, setResult] = useState<string | null>(null);
  const [isHintEnabled, setIsHintEnabled] = useState<boolean>(false);
  const [editorHeight, setEditorHeight] = useState<number>(400); // Default height for small screens
  const [hints, setHints] = useState<string | null>(null);

  

  useEffect(() => {
    const fetchProblem = async () => {
      const problemRef = doc(db, "problems", params.id);
      const problemSnap = await getDoc(problemRef);
      if (problemSnap.exists()) {
        setProblem({ id: problemSnap.id, ...problemSnap.data() } as Problem);
      } else {
        console.error("No such document!");
      }
    };
    fetchProblem();
  }, [params.id]);

  useEffect(() => {
    const handleResize = () => {
      const windowHeight = window.innerHeight;
      const calculatedHeight = windowHeight * 0.8;
      setEditorHeight(calculatedHeight);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const runTests = () => {
    if (!problem) return;

    const testResults = problem.testCases.map((tc) => {
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

        return normalizedUserOutput === normalizedExpectedOutput
          ? "Passed"
          : "Failed";
      } catch (err) {
        console.error(err);
        return "Error";
      }
    });

    setResult(testResults.join(", "));
  };

  const handleToggleHints = () => {
    setIsHintEnabled((prev) => !prev);
  };

  const fetchAIHint = async (message: string) => {
    if (isHintEnabled && problem) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ask`, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: problem.description,
            dict_of_vars: { code },
            prompt: message,
          }),
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
      {problem ? (
        <>
          <div className="card flex flex-col basis-1/4">
            <h2 className="text-3xl font-bold mb-6">{problem.title}</h2>
            <p className="mb-4">{problem.description}</p>
            <Button onClick={runTests} className="mt-2 bg-black w-36 text-white">
              Submit
            </Button>
            {result && (
              <div className="mt-4 flex gap-2 items-center ">
                Test Results:
                <div className=" inline-flex text-green-500 gap-1 items-center">
                <TiTick />
                {result.split(", ").filter((r) => r === "Passed").length}/{" "}
                {result.split(", ").length} test cases passed.
                </div>
              </div>
            )}
            {result && result.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2 text-red-500 flex items-center gap-2 ">
                  <RxCross2 />
                  Failed Test Cases:{" "}
                  {result.split(", ").filter((r) => r != "Passed").length}
                </h3>
                <div className="max-h-20 overflow-y-auto p-2 border rounded-lg border-gray-300 shadow-lg">
                  {result.split(", ").map(
                    (testResult, index) =>
                      testResult !== "Passed" && (
                        <div
                          key={index}
                          className="p-4 mb-2 bg-gray-100 rounded-lg border border-red-300"
                        >
                          Test Case {index + 1}: {testResult}
                        </div>
                      )
                  )}
                </div>
              </div>
            )}
            <div className="hintToggle mt-4 mx-4">
              <label>
                <input
                  type="checkbox"
                  checked={isHintEnabled}
                  onChange={handleToggleHints}
                  className="mr-5"
                />
                Enable Hints
              </label>
              {isHintEnabled && (
                <ChatWindow
                  code={code}
                  problem={problem}
                  fetchAIHint={fetchAIHint}
                  hints={hints}
                />
              )}
            </div>
          </div>

          <div className="flex-1 basis-3/4">
            <CodeEditor
              initialValue={code}
              language="javascript"
              onChange={setCode}
              height={editorHeight}
            />
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
    
  );
}