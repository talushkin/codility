import React, { useState } from "react";

interface PopUpProps {
  show: boolean;
  setShowPopup: (show: boolean) => void;
  InputPlaceHolder?: string;
}

export default function PopUp({ show, setShowPopup, InputPlaceHolder }: PopUpProps) {
  const [inputValue, setInputValue] = useState<string | number | readonly string[] | undefined>([""]);

  if (!show) return null; // hide popup if 'show' is false

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
          <h2 className="text-xl font-bold">Enter a value</h2>
          <input
            type="text"
            placeholder={InputPlaceHolder}
            className="border p-2 rounded w-full"
            value={inputValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <button
              className="bg-gray-300 px-4 py-2 rounded"
              onClick={() => setShowPopup(false)}
            >
              Cancel
            </button>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded"
              onClick={() => {
                // handle submit here if needed
                setShowPopup(false);
              }}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
