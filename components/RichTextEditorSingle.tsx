'use client';

import React, { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { Slate, Editable, withReact } from "slate-react";
import { createEditor, Descendant, BaseEditor } from "slate";
import { withHistory, HistoryEditor } from "slate-history";
import { ReactEditor } from "slate-react";

// Define custom types for Slate elements
type CustomElement = { type: "paragraph"; children: CustomText[] };
type CustomText = { text: string };

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

// Define the initial value for Slate editor
const initialValue: CustomElement[] = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

const RichTextEditorSingle: React.FC = () => {

   // Create a ref to the div
   const divRef = useRef<HTMLDivElement>(null);

   // Function to select the text inside the div
   const selectText = () => {
     if (divRef.current) {
       const range = document.createRange();
       range.selectNodeContents(divRef.current);
       const selection = window.getSelection();
       selection?.removeAllRanges();
       selection?.addRange(range);
     }
   };


   const printContent = () => {
    if (divRef.current) {
      const printWindow = window.open('', '_blank');
      printWindow?.document.write(`
        <html>
          <head>
            <title>Print</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
              }
            </style>
          </head>
          <body>
            ${divRef.current.innerHTML}
          </body>
        </html>
      `);
      printWindow?.document.close();
      printWindow?.print();
    }
  };
 
   


  const [value, setValue] = useState<Descendant[]>(initialValue);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  const [pages, setPages] = useState<Descendant[][]>([initialValue]);

  // Function to split the text when it overflows the A4 page height
  const splitPages = useCallback(() => {
    const editorElement = document.getElementById("editor-0"); // Get the first editor instance
    if (!editorElement) return;

    const textHeight = editorElement.scrollHeight;
    const A4Height = 1122; // height in pixels for A4 size

    if (textHeight > A4Height) {
      const newPages: Descendant[][] = [];
      let remainingText: Descendant[] = [...value]; // Copy value for processing

      while (remainingText.length > 0) {
        const currentPage: Descendant[] = [];
        let currentHeight = 0;

        while (remainingText.length > 0) {
          const node = remainingText[0] as CustomElement; // Type assertion to CustomElement

          // Extract text and calculate height
          const text = node.children.map((child: CustomText) => child.text).join('');
          const nodeHeight = 50; // Approximate height for one node

          // Check if adding this node would exceed the A4 height
          if (currentHeight + nodeHeight > A4Height) break;

          currentPage.push(node); // Add node to current page
          currentHeight += nodeHeight; // Increase current height
          remainingText.shift(); // Remove the processed node
        }

        newPages.push(currentPage); // Add completed page to newPages
      }

      setPages(newPages);
    } else {
      setPages([value]);
    }
  }, [value]);

  useEffect(() => {
    splitPages();
  }, [value, splitPages]);

  return (
    <div className="flex flex-col items-center">

      <button onClick={selectText}>Select All Content Text</button>
      <button onClick={() => { selectText(); printContent(); }}>Select and Print</button>
      
      {pages.map((pageContent, index) => (
        <div
          key={index} // Ensure this key is unique
          className="border border-gray-300 bg-white shadow-md p-4 my-4"
          style={{
            width: "793.7px", // A4 width
            height: "1122px", // A4 height
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          <Slate
            editor={editor}
            initialValue={pageContent}
            onChange={(newValue) => {
              const updatedPages = [...pages];
              updatedPages[index] = newValue; // Update individual page content
              setPages(updatedPages);
            }}
          >
            <div
              style={{
                height: "100%",
                overflowY: "auto", // Enable scrolling
                padding: "2.5rem", // Add padding for text inside the editor
                margin: "0", // Remove margin to prevent breaking
                boxSizing: "border-box",
              }}
            >
              <Editable ref={divRef}
                id={`editor-${index}`} // Unique ID for each editor instance
                placeholder="Start typing here..."
                className="outline-none"
                style={{
                  height: "100%",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </Slate>
        </div>
      ))}
    </div>
  );
};

export default RichTextEditorSingle;
