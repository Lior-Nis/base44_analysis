
import React from "react";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen w-full">
      <main>{children}</main>
    </div>
  );
}
