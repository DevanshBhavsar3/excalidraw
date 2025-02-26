import { GrSync } from "react-icons/gr";
import { TbTools } from "react-icons/tb";
import { FaShapes } from "react-icons/fa6";
import { LuPencilLine } from "react-icons/lu";

export function Features() {
  const tabs = [
    {
      icon: <GrSync size={18} />,
      title: "Real-Time Sync",
      description:
        "Experience instant collaboration. Every change you make is immediately visible to all participants, ensuring seamless teamwork and fluid creative flow.",
    },
    {
      icon: <TbTools size={18} />,
      title: "Tool Customization",
      description:
        "Tailor your workspace to your exact needs. Fine-tune every tool's settings for maximum efficiency and personalized creative expression.",
    },
    {
      icon: <FaShapes size={18} />,
      title: "Shape Manipulation",
      description:
        "Effortlessly create and modify shapes. Resize and reshape elements with intuitive controls, enabling precise design and dynamic compositions.",
    },
    {
      icon: <LuPencilLine size={18} />,
      title: "Freehand Shaping",
      description:
        "Unleash your creativity with natural drawing tools. Sketch, paint, and mold shapes directly on the canvas, fostering organic and expressive artwork",
    },
  ];

  return (
    <section className="z-10 py-10 border-b">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold py-10">Features</h1>
        <div className="flex justify-between items-start gap-10 h-fit relative mb-20">
          {/* Video frame */}
          <div className="sticky top-32 left-0 h-fit w-1/2 rounded-md aspect-video">
            <div className="border border-blue-500 p-4">
              <div className="border border-cyan-500 p-4">
                <video
                  src="/demo.mp4"
                  className="h-full w-full border border-primary"
                  autoPlay
                  muted
                  loop
                  playsInline
                ></video>
              </div>
            </div>
            <div className=""></div>
          </div>

          {/* Text frame */}
          <div className="w-1/2 flex flex-col gap-10">
            {tabs.map((tab, index) => (
              <div
                key={index}
                className="py-32 p-10 sticky top-32 right-0 h-fit flex flex-col justify-center items-start gap-3 bg-white border-t-2"
              >
                {tab.icon}
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
