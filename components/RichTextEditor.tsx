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

const RichTextEditor: React.FC = () => {


  const [value, setValue] = useState<Descendant[]>(initialValue);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  const [pages, setPages] = useState<Descendant[][]>([initialValue]);

  // Function to split the text when it overflows the A4 page height
  const splitPages = useCallback(() => {
    const newPages: Descendant[][] = [];
    let remainingText: Descendant[] = [...value]; // Copy value for processing
    const A4Height = 1122; // height in pixels for A4 size

    while (remainingText.length > 0) {
      const currentPage: Descendant[] = [];
      let currentHeight = 0;

      while (remainingText.length > 0) {
        const node = remainingText[0] as CustomElement; // Type assertion to CustomElement

        // Approximate height calculation
        const nodeHeight = 50; // Adjust this value as needed for your content height

        // Check if adding this node would exceed the A4 height
        if (currentHeight + nodeHeight > A4Height) break;

        currentPage.push(node); // Add node to current page
        currentHeight += nodeHeight; // Increase current height
        remainingText.shift(); // Remove the processed node
      }

      newPages.push(currentPage); // Add completed page to newPages
    }

    setPages(newPages);
  }, [value]);

  useEffect(() => {
    splitPages();
  }, [value, splitPages]);

  return (
    <div className="flex flex-col items-center">
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
              setValue(newValue); // Update the main value state
              splitPages(); // Recalculate pages
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
              <Editable 
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

export default RichTextEditor;
