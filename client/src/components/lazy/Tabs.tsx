import { useState } from "react";

export interface TabItmes {
  title: string;
  content: React.ReactNode;
}

export default function Tabs({
  children,
  tabs,
}: {
  children?: React.ReactNode;
  tabs: TabItmes[];
}) {
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);

  return (
    <div>
      <div className="flex justify-between items-center">
        {tabs.length > 1 && (
          <div className="flex bg-muted p-1.5 rounded-lg gap-4">
            {tabs.map((tab, index) => {
              return (
                <button
                  key={index}
                  className={`py-1 px-3 rounded-md text-sm transition-colors ${
                    activeTabIndex === index
                      ? "bg-card text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setActiveTabIndex(index)}
                >
                  {tab.title}
                </button>
              );
            })}
          </div>
        )}
        {children}
      </div>
      {tabs[activeTabIndex]?.content}
    </div>
  );
}
