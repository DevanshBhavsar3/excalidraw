"use client";

import Image from "next/image";

export function Features() {
  const tabs = [
    {
      title: "Real-Time Sync",
      description:
        "Experience instant collaboration. Every change you make is immediately visible to all participants, ensuring seamless teamwork and fluid creative flow.",
    },
    {
      title: "Tool Customization",
      description:
        "Tailor your workspace to your exact needs. Fine-tune every tool's settings for maximum efficiency and personalized creative expression.",
    },
    {
      title: "Shape Manipulation",
      description:
        "Effortlessly create and modify shapes. Resize and reshape elements with intuitive controls, enabling precise design and dynamic compositions.",
    },
    {
      title: "Freehand Shaping",
      description:
        "Unleash your creativity with natural drawing tools. Sketch, paint, and mold shapes directly on the canvas, fostering organic and expressive artwork",
    },
  ];

  return (
    <section className="z-10 bg-gray-100 py-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold py-10">Features</h1>
        <div className="flex justify-between items-start gap-10 h-fit relative mb-20">
          {/* Video frame */}
          <div className="sticky top-32 left-0 h-fit w-fit rounded-md border-4 border-primary aspect-video">
            <video
              src="/demo.mp4"
              className="h-full w-full"
              autoPlay
              muted
              loop
              controls
            ></video>
          </div>

          {/* Text frame */}
          <div className="w-1/2 flex flex-col gap-10">
            {tabs.map((tab, index) => (
              <div
                key={index}
                className="py-32 p-10 sticky top-32 right-0 h-fit flex flex-col justify-center items-start gap-3 rounded-md bg-gray-100"
              >
                <p className="text-xl font-semibold">{tab.title}</p>
                <p className="text-md max-w-lg">{tab.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
