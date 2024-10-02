import React from "react";
import RichTextEditor from "../components/RichTextEditor";
import RichTextEditorSingle from "@/components/RichTextEditorSingle";

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mt-8 mb-4">Rich Text Editor</h1>
      {/* <RichTextEditor /> */}
      <RichTextEditorSingle />
    </div>
  );
};

export default HomePage;
